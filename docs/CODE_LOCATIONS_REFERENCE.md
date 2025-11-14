# Code Locations Reference - Dashboard Loading Issue

## Issue 1: No Auto-Redirect After Payment

### Location
**File**: `/app/payment-success/page.tsx`
**Lines**: 30-45

### Current Code (BROKEN)
```tsx
useEffect(() => {
  // Simulate fetching session token (in production, this comes from the webhook response)
  const fetchSession = async () => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'createSession', params: { userId } })
      });

      const data = await response.json();
      if (data.success) {
        setSessionToken(data.data.sessionToken);
        localStorage.setItem('mcp_session_token', data.data.sessionToken);
        localStorage.setItem('x402_payment_complete', 'true');
        // ❌ MISSING: router.push('/dashboard') or window.location.href
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      // ❌ MISSING: setSessionError() - no error display
    } finally {
      setLoading(false);
    }
  };

  fetchSession();
}, [userId]);
```

### Why It's Broken
- Sets localStorage flags but doesn't redirect
- User sees success page indefinitely
- User must manually click "Back to Dashboard" button
- This might retrigger the x402-next middleware

### What Needs to Happen
1. After 2 seconds (to show success message)
2. Auto-redirect to `/dashboard` 
3. Pass userId and userEmail as query parameters
4. Store userId in localStorage for context

---

## Issue 2: Hardcoded userId in Dashboard

### Location
**File**: `/app/dashboard/page.tsx`
**Line**: 27

### Current Code (BROKEN)
```tsx
export default function DashboardPage() {
  // ❌ Hardcoded for testing
  const userId = 'test-user-1';
  const userEmail = 'test@example.com';

  // ... rest of component
```

### Why It's Broken
- Payment success page gets userId from query params
- Dashboard ignores it and uses hardcoded 'test-user-1'
- If real user pays, their data won't load
- All API calls use wrong userId

### What Should Happen
```tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  
  // Get from URL query params first, then localStorage, then default
  const userId = searchParams.get('userId') || 
                 (typeof window !== 'undefined' ? localStorage.getItem('current_user_id') : null) ||
                 'test-user-1';
  
  const userEmail = searchParams.get('userEmail') ||
                    (typeof window !== 'undefined' ? localStorage.getItem('current_user_email') : null) ||
                    'test@example.com';
```

---

## Issue 3: No Timeout Protection on API Calls

### Location
**File**: `/app/dashboard/page.tsx`
**Lines**: 38-91 (loadData function)

### Current Code (BROKEN)
```tsx
async function loadData() {
  try {
    console.log('Starting data load for userId:', userId);
    setLoading(true);
    setError(null);

    console.log('Fetching notifications...');
    const notifResponse = await fetch(`/api/notifications?userId=${userId}`);
    // ❌ No timeout - if this hangs, dashboard hangs forever
    
    console.log('Notifications response status:', notifResponse.status);

    if (!notifResponse.ok) {
      const errorText = await notifResponse.text();
      console.error('Notifications API error:', errorText);
      throw new Error(`Failed to fetch notifications: ${errorText}`);
    }

    const notifData = await notifResponse.json();
    // ... process data

    console.log('Fetching payments...');
    const paymentResponse = await fetch(`/api/payments?userId=${userId}`);
    // ❌ No timeout here either
    
    // ... process payments
    
    console.log('Data load complete');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading dashboard data:', errorMessage);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
}
```

### Why It's Broken
- `fetch()` has no timeout by default
- If API is slow or hanging, dashboard waits forever
- Only times out after browser's default timeout (60-90+ seconds)
- No AbortController to cancel hanging requests
- User sees "Loading dashboard..." indefinitely

### What Should Happen
```tsx
async function loadData() {
  try {
    console.log('Starting data load for userId:', userId);
    setLoading(true);
    setError(null);

    // Create AbortController with 30-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log('Fetching notifications...');
    const notifResponse = await fetch(`/api/notifications?userId=${userId}`, {
      signal: controller.signal  // ✓ Add abort signal
    });
    clearTimeout(timeoutId);  // Clear timeout if request succeeds
    
    // ... rest of code with same timeout handling
```

---

## Issue 4: x402-next Timeout Too Short

### Location
**File**: `/proxy.ts`
**Line**: 15

### Current Code
```typescript
const paymentProxy = paymentMiddleware(
  paymentAddress,
  {
    '/dashboard': {
      price: '$0.01',
      network: 'base-sepolia',
      config: { 
        description: 'Access to x402 Notification Dashboard', 
        maxTimeoutSeconds: 120  // ❌ Only 2 minutes
      }
    },
    // ...
  }
);
```

### Why It's Broken
- 120 seconds might not be enough for:
  - Slow database queries
  - Multiple API calls
  - Network latency
  - Cold starts
- If dashboard load exceeds timeout, entire request fails
- User sees error or just "Loading dashboard..." forever

### What Should Happen
```typescript
config: { 
  description: 'Access to x402 Notification Dashboard', 
  maxTimeoutSeconds: 300  // ✓ Increase to 5 minutes
}
```

---

## Issue 5: Silent Failure in Payment Success

### Location
**File**: `/app/payment-success/page.tsx`
**Lines**: 15-18, 36-40

### Current Code (BROKEN)
```tsx
const [sessionToken, setSessionToken] = useState<string | null>(null);
const [copied, setCopied] = useState(false);
const [loading, setLoading] = useState(true);
// ❌ Missing: const [sessionError, setSessionError] = useState<string | null>(null);

const fetchSession = async () => {
  try {
    const response = await fetch('/api/mcp', {...});
    const data = await response.json();
    if (data.success) {
      // ... success
    }
    // ❌ Missing: else branch to handle data.success === false
  } catch (error) {
    console.error('Error fetching session:', error);
    // ❌ Logs error but doesn't display it
  } finally {
    setLoading(false);  // Sets loading to false even if error occurred
  }
};
```

### Why It's Broken
- MCP session creation can fail silently
- User sees success page but integration won't work
- No error message shown to user
- `finally` block executes even if creation failed

### What Should Happen
```tsx
const [sessionToken, setSessionToken] = useState<string | null>(null);
const [sessionError, setSessionError] = useState<string | null>(null);  // ✓ Add this
const [loading, setLoading] = useState(true);

const fetchSession = async () => {
  try {
    const response = await fetch('/api/mcp', {...});
    const data = await response.json();
    
    if (data.success) {
      setSessionToken(data.data.sessionToken);
      localStorage.setItem('mcp_session_token', data.data.sessionToken);
    } else {
      // ✓ Handle error
      setSessionError(data.error || 'Failed to create MCP session');
    }
  } catch (error) {
    // ✓ Display error
    setSessionError(`Network error: ${error instanceof Error ? error.message : 'Unknown'}`);
    console.error('Error fetching session:', error);
  } finally {
    setLoading(false);
  }
};

// ✓ In render, check for error
if (sessionError) {
  return (
    <div className='...'>
      <Card className='p-8 border-red-500/20 bg-red-500/5'>
        <AlertCircle className='h-12 w-12 text-red-600 mx-auto mb-2' />
        <h2>Session Creation Failed</h2>
        <p>{sessionError}</p>
      </Card>
    </div>
  );
}
```

---

## Issue 6: Database Connection Verification Without Retry

### Location
**File**: `/lib/turso.ts`
**Lines**: 53-62 (verifyConnection function)

### Current Code (BROKEN)
```typescript
export async function verifyConnection() {
  try {
    console.log('Verifying Turso connection...');
    const result = await turso.execute({ sql: 'SELECT 1 as test', args: [] });
    console.log('Connection verified successfully:', result);
    return true;
  } catch (error) {
    console.error('Connection verification failed:', error);
    return false;  // ❌ Fails immediately, no retry
  }
}
```

### Why It's Broken
- Temporary network glitches fail immediately
- No exponential backoff or retry logic
- If DB connection is slow to establish, dashboard fails
- Called every request - could be optimized with caching

### What Should Happen
```typescript
export async function verifyConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Verifying Turso connection (attempt ${i + 1}/${retries})...`);
      const result = await turso.execute({ sql: 'SELECT 1 as test', args: [] });
      console.log('Connection verified successfully:', result);
      return true;
    } catch (error) {
      console.error(`Connection verification failed (attempt ${i + 1}):`, error);
      
      if (i < retries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = 1000 * Math.pow(2, i);
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}
```

### Called By
**File**: `/app/api/notifications/route.ts`
**Lines**: 8-15

```typescript
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    console.log('Verifying database connection...');
    const isConnected = await verifyConnection();
    // ❌ This call might hang or take too long
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed...' }, { status: 500 });
    }
    // ... rest of handler
```

---

## Issue 7: TypeScript Errors Hidden

### Location
**File**: `/next.config.ts`
**Line**: 5

### Current Code (PROBLEMATIC)
```typescript
const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  // Optimize for Bun runtime
  typescript: { ignoreBuildErrors: true },  // ❌ Hiding errors!
  images: { unoptimized: true }
};
```

### Why It's Problematic
- Real errors are being hidden
- TypeScript compilation errors not shown
- Could be masking real issues in code
- Makes debugging harder

### What Should Happen
```typescript
const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  images: { unoptimized: true }
  // Remove: typescript: { ignoreBuildErrors: true }
};
```

---

## Issue 8: Proxy Export Pattern Compatibility

### Location
**File**: `/proxy.ts`
**Lines**: 29-34

### Current Code
```typescript
export const proxy = paymentProxy;
export default paymentProxy;
export const config = { matcher: ['/dashboard/:path*', '/analytics/:path*', '/api/notifications/send'] };
```

### Potential Issue
- x402-next middleware is exported as default
- Running on Vercel with Bun runtime
- Might not be compatible with Vercel's middleware pattern
- Vercel expects Next.js middleware export pattern from `/middleware.ts`

### Investigation Needed
1. Check if middleware is being invoked
2. Verify x402-next version compatibility
3. Test payment flow manually
4. Check Vercel function logs

---

## File Structure Summary

```
/app/
├── layout.tsx                      # Root layout, sets up ThemeProvider
├── page.tsx                        # Home page
├── navigation.tsx                  # Navigation bar component
├── dashboard/
│   └── page.tsx                    # ❌ MAIN ISSUE #1: Hardcoded userId, no timeout
├── payment-success/
│   ├── page.tsx                    # ❌ MAIN ISSUE #2: No auto-redirect
│   └── loading.tsx
├── profile/
│   └── page.tsx
└── api/
    ├── notifications/
    │   ├── route.ts                # ❌ ISSUE #3: No timeout, verifyConnection hangs
    │   └── [id]/read/
    │       └── route.ts
    ├── payments/
    │   └── route.ts                # ❌ ISSUE #3: No timeout
    ├── subscriptions/
    │   └── route.ts
    ├── users/
    │   └── route.ts
    ├── x402/webhook/
    │   └── route.ts
    ├── mcp/
    │   ├── route.ts
    │   ├── session/
    │   │   └── route.ts
    │   └── docs/
    │       └── page.tsx

/lib/
├── turso.ts                        # ❌ ISSUE #4: No retry logic in verifyConnection
├── mcp-server.ts
├── mcp-client.ts
├── notification-service.ts
├── x402-payment-handler.ts
└── runtime-env.ts

/components/
├── custom-notification-creator.tsx # Initiates payment flow
├── pricing-selector.tsx
├── notification-trigger.tsx
└── ui/
    └── [various UI components]

/proxy.ts                           # ❌ ISSUE #5: Timeout too short, export pattern
/next.config.ts                     # ❌ ISSUE #6: ignoreBuildErrors
/package.json
/vercel.json
```

---

## Summary Table

| Issue | File | Line | Type | Severity |
|-------|------|------|------|----------|
| No auto-redirect | `/app/payment-success/page.tsx` | 30-45 | Missing code | CRITICAL |
| Hardcoded userId | `/app/dashboard/page.tsx` | 27 | Wrong value | CRITICAL |
| No fetch timeout | `/app/dashboard/page.tsx` | 38-91 | Missing code | HIGH |
| x402 timeout too short | `/proxy.ts` | 15 | Configuration | HIGH |
| Silent error in payment success | `/app/payment-success/page.tsx` | 36-40 | Missing error handling | MEDIUM |
| No connection retry | `/lib/turso.ts` | 53-62 | Missing logic | MEDIUM |
| verifyConnection hangs | `/app/api/notifications/route.ts` | 8-15 | Design issue | HIGH |
| ignoreBuildErrors enabled | `/next.config.ts` | 5 | Configuration | LOW |

