import { turso } from '@/lib/turso';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/subscriptions?userId=xxx - Get user's active subscription
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    // Get user's pricing preference
    const prefResult = await turso.execute({ sql: 'SELECT * FROM user_pricing_preferences WHERE user_id = ?', args: [userId] });

    const pricingModel = prefResult.rows[0];

    // Get active subscription if they're on subscription model
    let subscription = null;
    if (pricingModel && pricingModel.pricing_model === 'subscription') {
      const subResult = await turso.execute({
        sql: `SELECT s.*, p.name as plan_name, p.notification_limit, p.price
              FROM subscriptions s
              JOIN subscription_plans p ON s.plan_id = p.id
              WHERE s.user_id = ? AND s.status = 'active'
              ORDER BY s.created_at DESC
              LIMIT 1`,
        args: [userId]
      });
      subscription = subResult.rows[0] || null;
    }

    return NextResponse.json({ success: true, pricingModel: pricingModel || null, subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

// POST /api/subscriptions - Create or update subscription/pricing preference
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pricingModel, planId, perNotificationPrice, paymentId } = body;

    if (!userId || !pricingModel) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Upsert pricing preference
    await turso.execute({
      sql: `INSERT INTO user_pricing_preferences (user_id, pricing_model, per_notification_price, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              pricing_model = excluded.pricing_model,
              per_notification_price = excluded.per_notification_price,
              updated_at = excluded.updated_at`,
      args: [userId, pricingModel, perNotificationPrice || 0.99, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)]
    });

    // If subscription model, create subscription
    if (pricingModel === 'subscription' && planId) {
      const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Get plan details
      const planResult = await turso.execute({ sql: 'SELECT * FROM subscription_plans WHERE id = ?', args: [planId] });

      const plan = planResult.rows[0];
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
      }

      // Calculate expiry (30 days for monthly, 365 for yearly)
      const daysToAdd = plan.billing_period === 'monthly' ? 30 : 365;
      const expiresAt = Math.floor(Date.now() / 1000) + daysToAdd * 24 * 60 * 60;

      await turso.execute({
        sql: `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          subscriptionId,
          userId,
          planId,
          'active',
          Math.floor(Date.now() / 1000),
          expiresAt,
          paymentId || null,
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000)
        ]
      });

      return NextResponse.json({ success: true, message: 'Subscription created successfully', subscriptionId, expiresAt });
    }

    return NextResponse.json({ success: true, message: 'Pricing preference updated successfully' });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

// PATCH /api/subscriptions/:id - Update subscription status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, status, notificationsUsed } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const args: any[] = [];

    if (status) {
      updates.push('status = ?');
      args.push(status);
    }

    if (typeof notificationsUsed === 'number') {
      updates.push('notifications_used = ?');
      args.push(notificationsUsed);
    }

    updates.push('updated_at = ?');
    args.push(Math.floor(Date.now() / 1000));

    args.push(subscriptionId);

    await turso.execute({ sql: `UPDATE subscriptions SET ${updates.join(', ')} WHERE id = ?`, args });

    return NextResponse.json({ success: true, message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
