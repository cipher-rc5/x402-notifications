import { turso } from '@/lib/turso';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/payments?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    const result = await turso.execute({ sql: 'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', args: [userId] });

    return NextResponse.json({ success: true, payments: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST /api/payments - Record a new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, network, amount, currency, resource, transactionHash } = body;

    if (!userId || !network || !amount || !currency || !resource) {
      return NextResponse.json({ error: 'Missing required payment parameters' }, { status: 400 });
    }

    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await turso.execute({
      sql: `INSERT INTO payments (id, user_id, transaction_hash, network, amount, currency, status, resource, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        paymentId,
        userId,
        transactionHash || null,
        network,
        amount,
        currency,
        'confirmed',
        resource,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000)
      ]
    });

    return NextResponse.json({ success: true, paymentId, message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
