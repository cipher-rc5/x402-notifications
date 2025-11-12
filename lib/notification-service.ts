import notificationapi from 'notificationapi-node-server-sdk';
import { runtimeEnv } from './runtime-env';
import { type Notification, turso } from './turso';

const clientId = runtimeEnv.NOTIFICATIONAPI_CLIENT_ID;
const clientSecret = runtimeEnv.NOTIFICATIONAPI_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.warn('NotificationAPI credentials missing - notifications will be logged to database only');
}

// Initialize NotificationAPI with credentials
if (clientId && clientSecret) {
  console.log('Initializing NotificationAPI client...');
  notificationapi.init(clientId, clientSecret);
  console.log('NotificationAPI client initialized');
}

export interface SendNotificationParams {
  userId: string;
  email: string;
  subject: string;
  message: string;
  type?: string;
  phone?: string;
}

/**
 * Check if user can send notification based on their pricing model
 */
export async function canSendNotification(
  userId: string
): Promise<{ allowed: boolean, reason?: string, requiresPayment?: boolean, amount?: number }> {
  try {
    // Get user's pricing preference
    const prefResult = await turso.execute({ sql: 'SELECT * FROM user_pricing_preferences WHERE user_id = ?', args: [userId] });

    const pref = prefResult.rows[0];

    if (!pref) {
      // No preference set - default to pay-per-use at $0.99
      return { allowed: true, requiresPayment: true, amount: 0.99 };
    }

    if (pref.pricing_model === 'pay-per-use') {
      // Pay per use - requires payment for each notification
      return { allowed: true, requiresPayment: true, amount: Number(pref.per_notification_price) || 0.99 };
    }

    // Subscription model - check limits
    const subResult = await turso.execute({
      sql: `SELECT s.*, p.notification_limit
            FROM subscriptions s
            JOIN subscription_plans p ON s.plan_id = p.id
            WHERE s.user_id = ? AND s.status = 'active'
            ORDER BY s.created_at DESC
            LIMIT 1`,
      args: [userId]
    });

    const subscription = subResult.rows[0];

    if (!subscription) {
      return { allowed: false, reason: 'No active subscription. Please subscribe or switch to pay-per-use.' };
    }

    // Check if subscription expired
    const now = Math.floor(Date.now() / 1000);
    if (subscription.expires_at < now) {
      return { allowed: false, reason: 'Subscription expired. Please renew.' };
    }

    // Check notification limit
    const limit = subscription.notification_limit;
    if (limit !== null && subscription.notifications_used >= limit) {
      return { allowed: false, reason: `Monthly notification limit (${limit}) reached. Upgrade or wait for reset.` };
    }

    return { allowed: true, requiresPayment: false };
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return { allowed: false, reason: 'Error checking permissions' };
  }
}

/**
 * Record notification usage for subscription or pay-per-use tracking
 */
export async function recordNotificationUsage(userId: string, notificationId: string, paymentId?: string, chargedAmount?: number) {
  try {
    const usageId = `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await turso.execute({
      sql: `INSERT INTO notification_usage (id, user_id, notification_id, payment_id, charged_amount, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [usageId, userId, notificationId, paymentId || null, chargedAmount || null, Math.floor(Date.now() / 1000)]
    });

    // If subscription, increment usage counter
    const prefResult = await turso.execute({ sql: 'SELECT pricing_model FROM user_pricing_preferences WHERE user_id = ?', args: [userId] });

    if (prefResult.rows[0]?.pricing_model === 'subscription') {
      await turso.execute({
        sql: `UPDATE subscriptions
              SET notifications_used = notifications_used + 1, updated_at = ?
              WHERE user_id = ? AND status = 'active'`,
        args: [Math.floor(Date.now() / 1000), userId]
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error recording notification usage:', error);
    throw error;
  }
}

/**
 * Send notification via NotificationAPI and log to Turso database
 */
export async function sendNotification(params: SendNotificationParams) {
  const { userId, email, subject, message, type = 'notification_system', phone } = params;

  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Check if user can send notification
    const permissionResult = await canSendNotification(userId);
    if (!permissionResult.allowed) {
      console.error('Notification not allowed:', permissionResult.reason);
      throw new Error(permissionResult.reason);
    }

    if (clientId && clientSecret) {
      console.log('Sending notification via NotificationAPI...');
      const response = await notificationapi.send({
        notificationId: type,
        user: { id: userId, email: email, ...(phone && { number: phone }) },
        mergeTags: { subject: subject, message: message, title: subject }
      });
      console.log('NotificationAPI response:', response);
    } else {
      console.log('Skipping NotificationAPI send (credentials not configured)');
    }

    console.log('Inserting notification into database...');
    const insertResult = await turso.execute({
      sql: `INSERT INTO notifications (id, user_id, type, title, message, channel, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        notificationId,
        userId,
        type,
        subject,
        message,
        'email',
        clientId && clientSecret ? 'sent' : 'skipped',
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000)
      ]
    });

    console.log('Notification logged successfully, rows affected:', insertResult.rowsAffected);

    // Record notification usage
    await recordNotificationUsage(
      userId,
      notificationId,
      permissionResult.requiresPayment ? 'payment_id_here' : undefined,
      permissionResult.requiresPayment ? permissionResult.amount : undefined
    );

    return { success: true, notificationId };
  } catch (error) {
    console.error('Error sending notification:', error);

    if (error instanceof Error && error.message.includes('no such table')) {
      console.error('CRITICAL: notifications table does not exist in database!');
      console.error('Please run the database initialization scripts in the scripts folder');
      throw new Error("Database table 'notifications' does not exist. Please initialize your database schema.");
    }

    // Try to log failed notification to database
    try {
      await turso.execute({
        sql: `INSERT INTO notifications (id, user_id, type, title, message, channel, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          notificationId,
          userId,
          type,
          subject,
          message,
          'email',
          'failed',
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000)
        ]
      });
    } catch (dbError) {
      console.error('Could not log failed notification to database:', dbError);
    }

    throw error;
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    console.log('Querying notifications for user:', userId);
    const result = await turso.execute({ sql: 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', args: [userId] });

    console.log('Found', result.rows.length, 'notifications');
    return result.rows as unknown as Notification[];
  } catch (error) {
    console.error('Error fetching notifications from database:', error);

    if (error instanceof Error && error.message.includes('no such table')) {
      console.error('CRITICAL: notifications table does not exist!');
      throw new Error("Database table 'notifications' does not exist. Please run database initialization scripts.");
    }

    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  await turso.execute({
    sql: `UPDATE notifications
          SET status = 'read', read_at = ?, updated_at = ?
          WHERE id = ?`,
    args: [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000), notificationId]
  });
}
