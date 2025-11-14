# x402 Notifications - Complete Data Flow Architecture

## 1. PAYMENT FLOW (Current - BROKEN)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER INITIATES PAYMENT                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CustomNotificationCreator Component (/components/custom-notification...)    │
│ - User selects pricing model (pay-per-use or subscription)                  │
│ - User fills in notification details                                        │
│ - User clicks "Pay $0.99 & Create"                                          │
│ - handlePayment() is called                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ POST /api/payments (app/api/payments/route.ts)                              │
│ - Records payment: { userId, network, amount, resource }                    │
│ - Returns: { success: true, paymentId }                                     │
│ - Stores in Turso database: payments table                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ POST /api/mcp/session (app/api/mcp/session/route.ts)                        │
│ - Creates MCP session: { userId }                                           │
│ - Returns: { sessionToken, expiresIn: 86400 }                               │
│ - Stores in Turso database: mcp_sessions table                              │
│ - Token valid for 24 hours                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ x402-next Payment Middleware (proxy.ts)                                     │
│ - Intercepts request to /dashboard                                          │
│ - Returns HTTP 402 Payment Required                                         │
│ - Redirects user to x402 payment UI                                         │
│ - User completes transaction on x402 platform                               │
│ - Receives transaction hash                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ x402 Payment Facilitator (External Service)                                 │
│ - Broadcasts transaction to blockchain                                      │
│ - Verifies payment received at address: 0xFAD8b348A09b45493A2fE382...      │
│ - Calls webhook on completion                                               │
│ - Redirects user to /payment-success?userId=X&amount=0.99&network=...       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Payment Success Page (/app/payment-success/page.tsx) ❌ ISSUE HERE           │
│                                                                              │
│ Current Flow:                                                               │
│ 1. Shows success message                                                    │
│ 2. Fetches MCP session (may fail silently)                                  │
│ 3. Shows "Back to Dashboard" button                                         │
│ 4. ❌ DOES NOT AUTO-REDIRECT                                                │
│ 5. ❌ User must manually click button                                       │
│ 6. ❌ No userID stored in context/localStorage                              │
│                                                                              │
│ What should happen:                                                         │
│ 1. Auto-redirect to /dashboard after 2 seconds                              │
│ 2. Store userId in localStorage                                             │
│ 3. Pass userId as query param to dashboard                                  │
│ 4. Show errors if MCP session creation fails                                │
│                                                                              │
│ Status: ❌ BROKEN - Causes dashboard to hang                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ POST /api/x402/webhook (app/api/x402/webhook/route.ts)                      │
│ - Called by x402 facilitator after payment confirmation                     │
│ - Receives: { userId, transactionHash, network, amount, resource, ... }    │
│ - Calls recordPayment() → stores in database                                │
│ - Calls createMCPSession() → creates session token                          │
│ - Creates/updates user record                                               │
│ - Sends confirmation email via NotificationAPI                              │
│ - Returns: { success: true, sessionToken, mcpEndpoint }                     │
│                                                                              │
│ Note: This webhook is independent of payment-success page flow!             │
│       Both paths try to create MCP session (redundant)                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Browser Navigates to /dashboard                                             │
│ ❌ ISSUE: x402-next middleware might intercept AGAIN                        │
│    because payment verification isn't cached                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Dashboard Component (/app/dashboard/page.tsx) ❌ MAIN ISSUE                 │
│                                                                              │
│ Initial State: loading = true                                               │
│                                                                              │
│ On Mount (useEffect):                                                       │
│   1. Calls loadData()                                                       │
│   2. Calls loadPricingModel()                                               │
│                                                                              │
│ loadData() execution:                                                       │
│   1. setLoading(true)                                                       │
│   2. GET /api/notifications?userId=test-user-1                              │
│      ├─ ❌ HARDCODED userId!                                                │
│      ├─ Might NOT match payment userId                                      │
│      └─ Returns empty notifications or 404                                  │
│   3. GET /api/payments?userId=test-user-1                                   │
│      ├─ Same hardcoded issue                                                │
│      └─ Returns empty payments                                              │
│   4. ❌ If either request hangs, dashboard stays loading forever             │
│   5. finally → setLoading(false) might never execute                        │
│                                                                              │
│ If loading = true is never cleared:                                         │
│   - Shows: "Loading dashboard..." (animate-pulse)                           │
│   - No error message                                                        │
│   - No way for user to retry                                                │
│   - Must refresh browser or wait for timeout                                │
│                                                                              │
│ Expected Flow:                                                              │
│   userId should come from: query params OR localStorage OR context          │
│                                                                              │
│ Status: ❌ BROKEN - This is why dashboard hangs                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GET /api/notifications (app/api/notifications/route.ts)                     │
│                                                                              │
│ Request Flow:                                                               │
│   1. Get userId from query params                                           │
│   2. Call verifyConnection() → checks if DB is reachable                    │
│      ❌ No timeout - might hang if DB is slow                               │
│      ❌ No retry - fails once = fails permanently                           │
│   3. Call verifyTables() → checks if tables exist                           │
│      ❌ Same issues as verifyConnection                                     │
│   4. Call getUserNotifications(userId)                                      │
│      Executes: SELECT * FROM notifications WHERE user_id = ?               │
│   5. Returns: { success: true, notifications, count }                       │
│                                                                              │
│ Failure Modes:                                                              │
│   - Database URL invalid/unreachable → hangs                                │
│   - Auth token expired → hangs                                              │
│   - Network timeout → hangs without error message                           │
│   - No tables in database → returns 500 error                               │
│   - Very slow query → dashboard waits                                       │
│                                                                              │
│ Status: ❌ FRAGILE - No timeout protection                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GET /api/payments (app/api/payments/route.ts)                               │
│                                                                              │
│ Same issues as /api/notifications:                                          │
│   - No timeout                                                              │
│   - No retry                                                                │
│   - Directly queries Turso database                                         │
│   - Might hang if DB is slow                                                │
│                                                                              │
│ Status: ❌ FRAGILE - No timeout protection                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GET /api/subscriptions (app/api/subscriptions/route.ts)                     │
│                                                                              │
│ Similar pattern, also vulnerable to:                                        │
│   - Database connection issues                                              │
│   - Timeout without error                                                   │
│   - No retry logic                                                          │
│                                                                              │
│ Status: ❌ FRAGILE - No timeout protection                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Dashboard Renders                                                            │
│                                                                              │
│ If loading = false and error = null:                                        │
│   - Show notification cards                                                 │
│   - Show payment history                                                    │
│   - Show stats                                                              │
│   - Show pricing selector                                                   │
│                                                                              │
│ If error is set:                                                            │
│   - Show error card with troubleshooting steps                              │
│   - Show retry button                                                       │
│                                                                              │
│ Current Issue: loading never becomes false, so neither path works           │
│                                                                              │
│ Status: ❌ STUCK - Never reaches this point                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DATA STORAGE ARCHITECTURE

### Turso Database (libSQL)
```
Database: notifications-api-cipher0x0000.aws-us-east-1.turso.io

Tables:
├── users
│   ├── id (string, primary key)
│   ├── email (string)
│   ├── phone (string, nullable)
│   ├── preferences (string, JSON nullable)
│   ├── wallet_address (string, nullable)
│   ├── created_at (integer, unix timestamp)
│   └── updated_at (integer, unix timestamp)
│
├── payments
│   ├── id (string, primary key)
│   ├── user_id (string, foreign key)
│   ├── transaction_hash (string, nullable)
│   ├── network (enum: 'base'|'base-sepolia'|'solana-devnet'|'solana-testnet')
│   ├── amount (string)
│   ├── currency (string, typically 'USDC')
│   ├── status (enum: 'pending'|'confirmed'|'failed')
│   ├── resource (string)
│   ├── created_at (integer)
│   └── updated_at (integer)
│
├── notifications
│   ├── id (string, primary key)
│   ├── user_id (string, foreign key)
│   ├── type (string)
│   ├── title (string)
│   ├── message (string)
│   ├── channel (enum: 'email'|'sms'|'push'|'in_app'|'voice'|'slack')
│   ├── status (enum: 'pending'|'sent'|'delivered'|'failed'|'read')
│   ├── metadata (string, JSON nullable)
│   ├── created_at (integer)
│   ├── updated_at (integer)
│   └── read_at (integer, nullable)
│
├── mcp_sessions
│   ├── id (string, primary key)
│   ├── user_id (string, foreign key)
│   ├── session_token (string, unique)
│   ├── expires_at (integer, unix timestamp)
│   ├── metadata (string, JSON nullable)
│   └── created_at (integer)
│
├── subscriptions
│   ├── id (string, primary key)
│   ├── user_id (string, foreign key)
│   ├── plan_id (string, foreign key)
│   ├── status (enum: 'active'|'cancelled'|'expired')
│   ├── notifications_used (integer)
│   ├── expires_at (integer)
│   ├── created_at (integer)
│   └── updated_at (integer)
│
├── subscription_plans
│   ├── id (string, primary key)
│   ├── plan_name (string)
│   ├── notification_limit (integer)
│   ├── monthly_price (decimal)
│   ├── yearly_price (decimal)
│   └── features (string, JSON)
│
├── user_pricing_preferences
│   ├── id (string, primary key)
│   ├── user_id (string, foreign key)
│   ├── pricing_model (enum: 'pay-per-use'|'subscription')
│   ├── plan_id (string, nullable)
│   ├── per_notification_price (decimal)
│   └── updated_at (integer)
│
└── notification_usage
    ├── id (string, primary key)
    ├── user_id (string, foreign key)
    ├── notification_id (string, foreign key)
    ├── payment_id (string, nullable)
    ├── charged_amount (decimal, nullable)
    └── created_at (integer)
```

### LocalStorage
```
localStorage keys:
├── mcp_session_token: "tok-xxxxx" (set by payment-success page)
├── x402_payment_complete: "true" (set by payment-success page)
├── current_user_id: "user-123" (should be set but isn't currently)
└── current_user_email: "user@example.com" (should be set but isn't currently)
```

### Environment Variables
```
Required:
├── TURSO_DATABASE_URL: libsql://notifications-api-....turso.io
├── TURSO_AUTH_TOKEN: eyJhbGciOiJFZERTQSI...
├── X402_PAYMENT_ADDRESS: 0xFAD8b348A09b45493A2fE382763C688B48C138aD
├── NOTIFICATIONAPI_CLIENT_ID: wtvaxqza4b5qp19...
├── NOTIFICATIONAPI_CLIENT_SECRET: qaoyfjts74nhnnwojui3rwgrru...
└── NEXT_PUBLIC_APP_URL: https://your-domain.com
```

---

## 3. COMPONENT COMMUNICATION MAP

```
payment-success/page.tsx
    │
    ├─ fetch('/api/mcp', { method: 'createSession', params: { userId } })
    │   └─ /api/mcp/route.ts
    │       └─ handleMCPRequest({ method: 'createSession', ... })
    │           └─ createMCPSession(userId)
    │               └─ turso.execute() → INSERT into mcp_sessions
    │
    └─ localStorage.setItem('x402_payment_complete', 'true')
    └─ ❌ Should: router.push('/dashboard?userId=X&userEmail=Y')
    └─ ❌ Currently: Does nothing - waits for user click
    
custom-notification-creator.tsx
    │
    ├─ fetch('/api/payments', POST) → Records payment
    │
    ├─ fetch('/api/mcp/session', POST) → Creates MCP session
    │
    └─ Shows result with MCP endpoint
    
dashboard/page.tsx
    │
    ├─ useEffect() → calls loadData() and loadPricingModel()
    │
    ├─ loadData()
    │   ├─ fetch('/api/notifications?userId=test-user-1', GET)
    │   │   └─ /api/notifications/route.ts → verifyConnection() → verifyTables() → getUserNotifications()
    │   │       └─ turso.execute(SELECT * FROM notifications WHERE user_id = ?)
    │   │
    │   └─ fetch('/api/payments?userId=test-user-1', GET)
    │       └─ /api/payments/route.ts
    │           └─ turso.execute(SELECT * FROM payments WHERE user_id = ?)
    │
    └─ loadPricingModel()
        └─ fetch('/api/subscriptions?userId=test-user-1', GET)
            └─ /api/subscriptions/route.ts
                └─ Check user's pricing preference
                
notification-trigger.tsx
    │
    └─ fetch('/api/notifications', POST) → Sends test notification
        └─ /api/notifications/route.ts
            └─ sendNotification() → NotificationAPI + Turso
            
pricing-selector.tsx
    │
    └─ fetch('/api/subscriptions', POST) → Updates pricing model
        └─ /api/subscriptions/route.ts
            └─ Updates user_pricing_preferences table
```

---

## 4. REQUEST/RESPONSE FLOW (With Timing)

```
Timeline of what should happen:

T=0s:    User navigates to /dashboard
T=0.1s:  x402-next middleware intercepts
T=0.2s:  Checks if payment is valid (might be cached)
T=0.3s:  If not paid: returns 402, redirects to payment UI
         If paid: allows request to continue
T=1s:    Dashboard component mounts
T=1.1s:  loadData() starts
T=1.1s:  fetch('/api/notifications?userId=test-user-1') sent
T=1.2s:  fetch('/api/payments?userId=test-user-1') sent
T=1.5s:  Notifications response received (success or error)
T=1.8s:  Payments response received (success or error)
T=1.9s:  loadPricingModel() starts
T=2.0s:  Subscriptions response received
T=2.1s:  setLoading(false) called in finally block
T=2.5s:  Dashboard renders with data

Current broken timeline:

T=0s:    User clicks "Back to Dashboard" button
T=0.1s:  x402-next middleware intercepts again
         ❌ Payment verification fails or loops
T=0.5s:  Request stuck or returns 402 again
T=1s:    User sees "Loading dashboard..."
T=10s:   Still loading...
T=30s:   Still loading...
T=120s:  x402-next timeout (maxTimeoutSeconds: 120)
         ❌ Dashboard still shows "Loading dashboard..."
T=121s:  User is confused, refreshes browser
```

---

## 5. ERROR HANDLING PATHS

```
Dashboard Error Scenarios:

Scenario A: Database Connection Failed
├─ GET /api/notifications
├─ verifyConnection() fails
├─ Returns 500 error
├─ catch block in dashboard catches it
├─ setError() called with error message
├─ Shows error card with "Check environment variables..." message
└─ User can click Retry button

Scenario B: Database Table Missing
├─ GET /api/notifications
├─ verifyConnection() succeeds
├─ verifyTables() shows notifications table doesn't exist
├─ Returns 500 error with "Database not initialized..."
├─ catch block catches it
├─ setError() called
├─ Shows error message
└─ ✓ Works correctly

Scenario C: Request Timeout (CURRENT ISSUE)
├─ GET /api/notifications sent
├─ No response received (DB hangs, network issue, etc.)
├─ Request times out after browser default (varies, often 60-90s)
├─ fetch rejects with network error
├─ catch block catches it
├─ setError() called
├─ finally block calls setLoading(false)
├─ Shows error card
└─ ✓ Works, but takes 60-90 seconds

Scenario D: userId Mismatch (ACTUAL ISSUE)
├─ Dashboard hardcodes userId = 'test-user-1'
├─ GET /api/notifications?userId=test-user-1 sent
├─ API returns 200 OK but empty array (different user paid)
├─ setNotifications([]) called
├─ setLoading(false) called
├─ Dashboard shows "No notifications yet" instead of user's notifications
└─ ❌ Appears to work but shows wrong data

Scenario E: Silent Failure (PAYMENT-SUCCESS ISSUE)
├─ Payment success page tries to create MCP session
├─ fetch('/api/mcp', ...) fails silently
├─ catch block logs error but doesn't display it
├─ setLoading(false) still called
├─ Page shows success message but MCP session doesn't exist
├─ User thinks payment worked but integration won't function
└─ ❌ Silent failure

Scenario F: Immediate Timeout (POTENTIAL ISSUE)
├─ x402-next middleware has maxTimeoutSeconds: 120
├─ If dashboard takes > 120 seconds to load
├─ Entire request times out at middleware level
├─ setLoading(false) never called
├─ Dashboard shows "Loading dashboard..." forever
└─ ❌ No error message, just hangs
```

---

## 6. FIX IMPLEMENTATION SEQUENCE

```
Fix Priority:

1. AUTO-REDIRECT (Payment Success Page)
   └─ Prevents user from manually triggering x402-next again
   
2. userId CONTEXT (Dashboard)
   └─ Ensures dashboard shows correct user's data
   
3. FETCH TIMEOUT (Dashboard)
   └─ Prevents indefinite hanging on slow APIs
   
4. x402-next TIMEOUT (Proxy)
   └─ Increase to allow slow dashboard loads
   
5. ERROR DISPLAY (Payment Success)
   └─ Show MCP session creation errors to user
   
6. CONNECTION RETRY (API Routes)
   └─ Retry failed database connections
   
7. BUNK CONFIG (Next.js)
   └─ Remove TypeScript ignore, optimize
```

