import { runtimeEnv } from '@/lib/runtime-env';
import { sendNotification } from '@/lib/notification-service';
import { turso } from '@/lib/turso';
import { recordPayment } from '@/lib/x402-payment-handler';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Webhook endpoint to handle x402 payment confirmations
 * This would be called by the x402 facilitator after payment verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, transactionHash, network, amount, resource, userEmail } = body;

    if (!userId || !transactionHash || !network || !amount || !resource) {
      return NextResponse.json({ error: 'Missing required webhook parameters' }, { status: 400 });
    }

    // Record payment in database
    const payment = await recordPayment({ userId, transactionHash, network, amount, resource });

    const { createMCPSession } = await import('@/lib/mcp-server');
    const sessionToken = await createMCPSession(userId);

    // Get or create user in database
    const userCheck = await turso.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });

    if (userCheck.rows.length === 0 && userEmail) {
      await turso.execute({
        sql: `INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)`,
        args: [userId, userEmail, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)]
      });
    }

    // Get user details for notification
    const userResult = await turso.execute({ sql: 'SELECT email FROM users WHERE id = ?', args: [userId] });

    const email = (userResult.rows[0]?.email as string) || userEmail;
    const appUrl = runtimeEnv.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
    const mcpEndpoint = `${appUrl}/api/mcp`;

    if (email) {
      await sendNotification({
        userId,
        email,
        subject: 'Payment Confirmed - Your MCP Endpoint is Ready',
        message:
          `Your payment of ${amount} USDC on ${network} has been confirmed!\n\nTransaction: ${transactionHash}\n\nYour custom MCP notification endpoint is now active:\n${mcpEndpoint}\n\nSession Token: ${sessionToken}\n\nVisit your profile to view integration instructions.`,
        type: 'payment_confirmation'
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.paymentId,
      sessionToken,
      mcpEndpoint,
      message: 'Payment processed, notification sent, and MCP session created'
    });
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    return NextResponse.json({ error: 'Failed to process payment webhook' }, { status: 500 });
  }
}
