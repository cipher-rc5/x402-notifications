// Next.js 16+ proxy (formerly middleware) for x402 payments
import { runtimeEnv } from '@/lib/runtime-env';
import { getAddress } from 'viem';
import { paymentMiddleware } from 'x402-next';

export const runtime = 'nodejs';

const DEFAULT_PAYMENT_ADDRESS = '0x1111111111111111111111111111111111111111';

function resolvePaymentAddress() {
  const configuredAddress = runtimeEnv.X402_PAYMENT_ADDRESS;

  if (configuredAddress) {
    try {
      return getAddress(configuredAddress);
    } catch {
      console.warn(`Invalid X402 payment address "${configuredAddress}" provided via X402_PAYMENT_ADDRESS. Falling back to default.`);
    }
  }

  return getAddress(DEFAULT_PAYMENT_ADDRESS);
}

const paymentAddress = resolvePaymentAddress();

export const proxy = paymentMiddleware(
  paymentAddress,
  {
    '/dashboard': {
      price: '$0.01',
      network: 'base-sepolia',
      config: { description: 'Access to x402 Notification Dashboard', maxTimeoutSeconds: 120 }
    },
    '/api/notifications/send': {
      price: '$0.005',
      network: 'base-sepolia',
      config: { description: 'Send custom notification', maxTimeoutSeconds: 60 }
    },
    '/analytics': {
      price: '$0.02',
      network: 'base-sepolia',
      config: { description: 'Access to notification analytics', maxTimeoutSeconds: 120 }
    }
  },
  undefined,
  { appName: 'x402 Notification System', appLogo: '/icon.svg' }
);

export const config = { matcher: ['/dashboard/:path*', '/analytics/:path*', '/api/notifications/send'] };
