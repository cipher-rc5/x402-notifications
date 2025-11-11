import { getUserNotifications, sendNotification } from '@/lib/notification-service';
import { verifyConnection, verifyTables } from '@/lib/turso';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/notifications?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    console.log('Verifying database connection...');
    const isConnected = await verifyConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed. Please check your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.' }, {
        status: 500
      });
    }

    console.log('Checking database tables...');
    const tables = await verifyTables();
    const hasNotificationsTable = tables.some((t) => t.name === 'notifications');

    if (!hasNotificationsTable) {
      console.error('notifications table does not exist!');
      return NextResponse.json({
        error: 'Database not initialized. Please run the SQL scripts in the scripts/ folder to create the required tables.',
        tables: tables.map((t) => t.name)
      }, { status: 500 });
    }

    const notifications = await getUserNotifications(userId);

    return NextResponse.json({ success: true, notifications, count: notifications.length });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, subject, message, type, phone } = body;

    if (!userId || !email || !subject || !message) {
      return NextResponse.json({ error: 'userId, email, subject, and message are required' }, { status: 400 });
    }

    const result = await sendNotification({ userId, email, subject, message, type, phone });

    return NextResponse.json({ success: true, notificationId: result.notificationId, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
