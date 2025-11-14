// Next.js 16+ proxy (formerly middleware) for x402 payments
import { runtimeEnv } from '@/lib/runtime-env';
import { turso } from '@/lib/turso';
import { getAddress, isAddress } from 'viem';
import { paymentMiddleware } from 'x402-next';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const FALLBACK_PAYMENT_ADDRESS = '0xFAD8b348A09b45493A2fE382763C688B48C138aD';
const FALLBACK_CHECKSUM_ADDRESS = getAddress(FALLBACK_PAYMENT_ADDRESS);

function resolvePaymentAddress() {
  const configuredAddress = runtimeEnv.X402_PAYMENT_ADDRESS?.trim();

  if (!configuredAddress) {
    return FALLBACK_CHECKSUM_ADDRESS;
  }

  if (!isAddress(configuredAddress, { strict: false })) {
    console.warn(
      `Invalid X402 payment address "${configuredAddress}" provided via X402_PAYMENT_ADDRESS. ` +
        'It must be a 20-byte hex string (40 hex characters). Falling back to the default address.'
    );
    return FALLBACK_CHECKSUM_ADDRESS;
  }

  return getAddress(configuredAddress);
}

/**
 * Check if user has a recent payment for the dashboard resource
 * This allows bypassing x402 middleware after successful payment
 */
async function hasRecentPayment(userId: string | null, resource: string): Promise<boolean> {
  if (!userId) return false;

  try {
    // Check for payments in the last 30 minutes for this resource
    const thirtyMinutesAgo = Math.floor(Date.now() / 1000) - 30 * 60;
    const result = await turso.execute({
      sql: `SELECT id FROM payments 
            WHERE user_id = ? AND resource = ? AND status = 'confirmed' AND created_at > ?
            ORDER BY created_at DESC LIMIT 1`,
      args: [userId, resource, thirtyMinutesAgo]
    });

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking recent payment:', error);
    return false;
  }
}

const paymentAddress = resolvePaymentAddress();
const x402Middleware = paymentMiddleware(
  paymentAddress,
  {
    '/dashboard': {
      price: '$0.01',
      network: 'base-sepolia',
      config: { description: 'Access to x402 Notification Dashboard', maxTimeoutSeconds: 300 }
    },
    '/api/notifications/send': {
      price: '$0.005',
      network: 'base-sepolia',
      config: { description: 'Send custom notification', maxTimeoutSeconds: 60 }
    },
    '/analytics': {
      price: '$0.02',
      network: 'base-sepolia',
      config: { description: 'Access to notification analytics', maxTimeoutSeconds: 300 }
    }
  },
  undefined,
  { appName: 'x402 Notification System', appLogo: '/icon.svg' }
);

/**
 * Wrapper middleware that checks for recent payments before applying x402 check
 */
async function paymentProxy(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Extract userId from query params (common after payment redirect)
  const userId = url.searchParams.get('userId');

  // Map paths to resources
  let resource = '';
  if (pathname.startsWith('/dashboard')) {
    resource = '/dashboard';
  } else if (pathname.startsWith('/analytics')) {
    resource = '/analytics';
  } else if (pathname === '/api/notifications/send') {
    resource = '/api/notifications/send';
  }

  // If we have a userId and resource, check for recent payment
  if (userId && resource) {
    const hasPayment = await hasRecentPayment(userId, resource);
    if (hasPayment) {
      console.log(`Bypassing x402 check for ${resource} - recent payment found for user ${userId}`);
      // Allow request through without x402 check
      return NextResponse.next();
    }
  }

  // Otherwise, use x402 middleware
  return x402Middleware(request);
}

export const proxy = paymentProxy;
export default paymentProxy;
export const config = { matcher: ['/dashboard/:path*', '/analytics/:path*', '/api/notifications/send'] };
