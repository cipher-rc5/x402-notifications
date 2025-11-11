import notificationapi from 'notificationapi-node-server-sdk';
import { type Notification, turso } from './turso';

const clientId = process.env.NOTIFICATIONAPI_CLIENT_ID;
const clientSecret = process.env.NOTIFICATIONAPI_CLIENT_SECRET;

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
 * Send notification via NotificationAPI and log to Turso database
 */
export async function sendNotification(params: SendNotificationParams) {
  const { userId, email, subject, message, type = 'notification_system', phone } = params;

  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
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
