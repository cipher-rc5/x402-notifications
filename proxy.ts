// Next.js 16+ proxy (formerly middleware)
// The proxy will be bypassed temporarily, but the UI will work
// To enable x402 payments, ensure all Solana dependencies are properly installed

/*
export const runtime = "nodejs"

import { paymentMiddleware } from "x402-next"

export const proxy = paymentMiddleware(
  runtimeEnv.X402_PAYMENT_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
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
)

export const config = {
  matcher: ["/dashboard/:path*", "/analytics/:path*", "/api/notifications/send"],
}
*/

import { runtimeEnv } from '@/lib/runtime-env';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const paymentAddress = runtimeEnv.X402_PAYMENT_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

export function proxy(request: NextRequest) {
  console.log('Proxy bypassed - x402 temporarily disabled due to dependency issues', { paymentAddress });
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/analytics/:path*'] };
