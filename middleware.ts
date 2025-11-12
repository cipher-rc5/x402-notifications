import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

// x402 payment middleware - currently disabled due to Solana dependency issues
// To enable: uncomment the code below and ensure x402-next dependencies are properly installed

/*
import { paymentMiddleware } from 'x402-next';
import { runtimeEnv } from '@/lib/runtime-env';

const paymentAddress = runtimeEnv.X402_PAYMENT_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

export default paymentMiddleware(
  paymentAddress,
  {
    "/dashboard": {
      price: "$0.01",
      network: "base-sepolia",
      config: {
        description: "Access to x402 Notification Dashboard",
        maxTimeoutSeconds: 120,
      },
    },
    "/api/notifications/send": {
      price: "$0.005",
      network: "base-sepolia",
      config: {
        description: "Send custom notification",
        maxTimeoutSeconds: 60,
      },
    },
    "/analytics": {
      price: "$0.02",
      network: "base-sepolia",
      config: {
        description: "Access to notification analytics",
        maxTimeoutSeconds: 120,
      },
    },
  },
  undefined,
  {
    appName: "x402 Notification System",
    appLogo: "/icon.svg",
  },
);
*/

// Temporary bypass - all requests pass through without payment
export function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Request bypassed - x402 temporarily disabled');
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analytics/:path*', '/api/notifications/send'],
};
