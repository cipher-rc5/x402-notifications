import { CodeBlock } from "@/components/code-block"
import { ApiPlayground } from "@/components/api-playground"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Book, Code2, Rocket, Shield, Zap, ExternalLink } from "lucide-react"

export default function MCPDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                MCP API Documentation
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Model Context Protocol for AI-powered notification systems
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 border-primary/20 bg-primary/5">
              <Zap className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Real-time Notifications</h3>
              <p className="text-sm text-muted-foreground">Send multi-channel notifications via NotificationAPI</p>
            </Card>
            <Card className="p-4 border-green-500/20 bg-green-500/5">
              <Shield className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">x402 Payment Gates</h3>
              <p className="text-sm text-muted-foreground">Protected endpoints with EVM & Solana micropayments</p>
            </Card>
            <Card className="p-4 border-blue-500/20 bg-blue-500/5">
              <Rocket className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">TypeScript First</h3>
              <p className="text-sm text-muted-foreground">Fully typed API with interactive examples</p>
            </Card>
          </div>
        </div>

        {/* Getting Started */}
        <section className="space-y-6 mb-12">
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Getting Started</h2>
          </div>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <AlertDescription>
              <strong>New User?</strong> After making your first x402 payment, you'll receive a custom MCP endpoint URL.
              This unique link allows you to integrate notifications into your AI assistants and automation tools.
            </AlertDescription>
          </Alert>

          <Card className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Base URL</h3>
            <CodeBlock language="bash" code="POST https://your-domain.com/api/mcp" />

            <h3 className="text-xl font-semibold mt-6">Authentication</h3>
            <p className="text-muted-foreground">
              All methods except <code className="px-1.5 py-0.5 rounded bg-muted text-sm">createSession</code> require a
              valid session token.
            </p>

            <CodeBlock
              language="typescript"
              code={`// Create a session first
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'createSession',
    params: { userId: 'your-user-id' }
  })
});

const { data } = await response.json();
const sessionToken = data.sessionToken;
//    ^? string - Valid for 24 hours`}
            />
          </Card>
        </section>

        {/* API Methods */}
        <section className="space-y-6 mb-12">
          <h2 className="text-3xl font-bold">API Methods</h2>

          <Tabs defaultValue="createSession" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
              <TabsTrigger value="createSession">Session</TabsTrigger>
              <TabsTrigger value="sendNotification">Send</TabsTrigger>
              <TabsTrigger value="getNotifications">Get</TabsTrigger>
              <TabsTrigger value="markRead">Mark Read</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="spent">Total</TabsTrigger>
              <TabsTrigger value="user">User</TabsTrigger>
            </TabsList>

            {/* createSession */}
            <TabsContent value="createSession" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">createSession</h3>
                  <p className="text-muted-foreground">
                    Create a new MCP session for a user. Returns a session token valid for 24 hours.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Request</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface CreateSessionRequest {
  method: 'createSession';
  params: {
    userId: string;
  };
}

const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'createSession',
    params: { userId: 'user-123' }
  })
});`}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Response</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface CreateSessionResponse {
  success: true;
  data: {
    sessionToken: string;  // Valid for 24 hours
    expiresIn: number;     // 86400 seconds
  };
  timestamp: number;       // Unix timestamp
}

const data = await response.json();
// data.data.sessionToken -> "tok-xxxxx..."
//            ^? string`}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* sendNotification */}
            <TabsContent value="sendNotification" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">sendNotification</h3>
                  <p className="text-muted-foreground">
                    Send a notification to a user via NotificationAPI. Supports email, SMS, and in-app channels.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Request</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface SendNotificationRequest {
  method: 'sendNotification';
  params: {
    userId: string;
    email: string;
    subject: string;
    message: string;
    type?: string;    // Default: 'notification_system'
    phone?: string;   // Optional for SMS
  };
  sessionToken: string;
}

await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'sendNotification',
    params: {
      userId: 'user-123',
      email: 'user@example.com',
      subject: 'Payment Received',
      message: 'Your x402 payment was successful!',
      type: 'payment_success'
    },
    sessionToken: 'tok-xxxxx'
  })
});`}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Response</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface SendNotificationResponse {
  success: true;
  data: {
    notificationId: string;
  };
  timestamp: number;
}

// Example response
{
  "success": true,
  "data": { "notificationId": "notif-1234..." },
  "timestamp": 1704067200
}`}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* getNotifications */}
            <TabsContent value="getNotifications" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">getNotifications</h3>
                  <p className="text-muted-foreground">
                    Retrieve all notifications for the authenticated user, ordered by creation date.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Request</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface GetNotificationsRequest {
  method: 'getNotifications';
  params: {};
  sessionToken: string;
}

const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'getNotifications',
    params: {},
    sessionToken: 'tok-xxxxx'
  })
});`}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Response</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  channel: 'email' | 'sms' | 'in_app';
  status: 'sent' | 'read' | 'failed';
  read_at: number | null;
  created_at: number;
  updated_at: number;
}

interface GetNotificationsResponse {
  success: true;
  data: {
    notifications: Notification[];
    count: number;
  };
  timestamp: number;
}`}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* markNotificationRead */}
            <TabsContent value="markRead" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">markNotificationRead</h3>
                  <p className="text-muted-foreground">
                    Mark a specific notification as read and record the timestamp.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Request</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface MarkReadRequest {
  method: 'markNotificationRead';
  params: {
    notificationId: string;
  };
  sessionToken: string;
}

await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'markNotificationRead',
    params: { notificationId: 'notif-123...' },
    sessionToken: 'tok-xxxxx'
  })
});`}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* getPaymentHistory */}
            <TabsContent value="payments" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">getPaymentHistory</h3>
                  <p className="text-muted-foreground">
                    Retrieve x402 payment history for the authenticated user across all networks.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Response</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface Payment {
  id: string;
  user_id: string;
  transaction_hash: string | null;
  network: 'base' | 'base-sepolia' | 'solana-devnet' | 'solana-testnet';
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  resource: string;
  created_at: number;
  updated_at: number;
}

interface PaymentHistoryResponse {
  success: true;
  data: {
    payments: Payment[];
    count: number;
  };
  timestamp: number;
}`}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* getTotalSpent */}
            <TabsContent value="spent" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">getTotalSpent</h3>
                  <p className="text-muted-foreground">
                    Calculate total amount spent by the authenticated user across all confirmed payments.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Response</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface TotalSpentResponse {
  success: true;
  data: {
    totalSpent: number;  // Sum of all confirmed payments
    currency: 'USDC';    // Currently supports USDC
  };
  timestamp: number;
}`}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* getUser */}
            <TabsContent value="user" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">getUser</h3>
                  <p className="text-muted-foreground">Retrieve user information for the authenticated session.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Response</h4>
                  <CodeBlock
                    language="typescript"
                    code={`interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  metadata: string | null;
  created_at: number;
  updated_at: number;
}

interface GetUserResponse {
  success: true;
  data: {
    user: User;
  };
  timestamp: number;
}`}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Error Handling */}
        <section className="space-y-6 mb-12">
          <h2 className="text-3xl font-bold">Error Handling</h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              All responses include a <code className="px-1.5 py-0.5 rounded bg-muted text-sm">success</code> field.
              When <code className="px-1.5 py-0.5 rounded bg-muted text-sm">false</code>, an{" "}
              <code className="px-1.5 py-0.5 rounded bg-muted text-sm">error</code> field provides details.
            </p>

            <CodeBlock
              language="typescript"
              code={`interface ErrorResponse {
  success: false;
  error: string;
  timestamp: number;
}

// Common errors:
{
  "success": false,
  "error": "Invalid or expired session token",
  "timestamp": 1704067200
}

{
  "success": false,
  "error": "User not found",
  "timestamp": 1704067200
}

{
  "success": false,
  "error": "Missing required parameter: email",
  "timestamp": 1704067200
}`}
            />
          </Card>
        </section>

        {/* Interactive Playground */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">API Playground</h2>
          <ApiPlayground />
        </section>

        {/* SDK & Integration Examples */}
        <section className="space-y-6 mt-12">
          <h2 className="text-3xl font-bold">Integration Examples</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">MCP Client Setup</h3>
              <p className="text-sm text-muted-foreground">
                Configure Claude Desktop or other MCP-compatible AI assistants
              </p>
              <CodeBlock
                language="json"
                code={`{
  "mcpServers": {
    "x402-notifications": {
      "url": "https://your-domain.com/api/mcp",
      "auth": {
        "type": "bearer",
        "token": "your-session-token"
      }
    }
  }
}`}
              />
              <Button variant="outline" size="sm" asChild>
                <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">
                  MCP Documentation <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Node.js Example</h3>
              <p className="text-sm text-muted-foreground">Send notifications from your backend</p>
              <CodeBlock
                language="typescript"
                code={`import { MCPClient } from '@/lib/mcp-client';

const client = new MCPClient({
  baseUrl: 'https://your-domain.com/api/mcp',
  userId: 'user-123'
});

await client.init();

await client.sendNotification({
  email: 'user@example.com',
  subject: 'Welcome!',
  message: 'Thanks for joining.'
});`}
              />
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
