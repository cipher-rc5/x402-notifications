// Next.js 16+ proxy (formerly middleware) for x402 payments
import { runtimeEnv } from '@/lib/runtime-env';
import { getAddress, isAddress } from 'viem';
import { paymentMiddleware } from 'x402-next';

export const runtime = 'nodejs';

const FALLBACK_PAYMENT_ADDRESS = '0x1111111111111111111111111111111111111111';
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

const paymentAddress = resolvePaymentAddress();
const paymentProxy = paymentMiddleware(
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

export const proxy = paymentProxy;
export default paymentProxy;
export const config = { matcher: ['/dashboard/:path*', '/analytics/:path*', '/api/notifications/send'] };
