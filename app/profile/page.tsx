"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeBlock } from "@/components/code-block"
import { CheckCircle2, Copy, ExternalLink, Key, Sparkles, User, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [userId] = useState("test-user-1")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const router = useRouter()

  const mcpEndpoint = typeof window !== "undefined" ? `${window.location.origin}/api/mcp` : ""

  useEffect(() => {
    // Check if user has made a payment (simulated for now)
    const hasPayment = localStorage.getItem("x402_payment_complete")
    if (hasPayment) {
      const token = localStorage.getItem("mcp_session_token")
      setSessionToken(token)
    }
  }, [])

  const handleSimulatePayment = async () => {
    setSimulating(true)
    try {
      // Simulate x402 payment on Base Sepolia testnet
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      const mockPayment = {
        userId,
        transactionHash: mockTxHash,
        network: "base-sepolia" as const,
        amount: "0.0001",
        resource: "/api/mcp",
      }

      console.log("[v0] Simulating x402 payment:", mockPayment)

      // Record payment in database
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockPayment),
      })

      if (!paymentResponse.ok) {
        throw new Error("Failed to record payment")
      }

      const paymentData = await paymentResponse.json()
      console.log("[v0] Payment recorded:", paymentData)

      // Generate MCP session token
      await handleGenerateSession()

      // Mark payment as complete
      localStorage.setItem("x402_payment_complete", "true")

      // Redirect to payment success page
      router.push(`/payment-success?txHash=${mockTxHash}&network=base-sepolia`)
    } catch (error) {
      console.error("Error simulating payment:", error)
      alert("Payment simulation failed. Check console for details.")
    } finally {
      setSimulating(false)
    }
  }

  const handleGenerateSession = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "createSession",
          params: { userId },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSessionToken(data.data.sessionToken)
        localStorage.setItem("mcp_session_token", data.data.sessionToken)
        localStorage.setItem("x402_payment_complete", "true")
      }
    } catch (error) {
      console.error("Error generating session:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(mcpEndpoint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Your MCP Profile</h1>
              <p className="text-muted-foreground">Manage your notification system integration</p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {!sessionToken ? (
          <Alert className="border-yellow-500/20 bg-yellow-500/5">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2 flex items-center justify-between">
              <div>
                <strong>Complete your first x402 payment</strong> to unlock your custom MCP endpoint for AI assistant
                integration.
              </div>
              <Button onClick={handleSimulatePayment} disabled={simulating} size="sm" className="ml-4 gap-2">
                <Zap className="h-4 w-4" />
                {simulating ? "Processing..." : "Simulate x402 Payment"}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="ml-2">
              <strong>Payment verified!</strong> Your MCP endpoint is active and ready to use.
            </AlertDescription>
          </Alert>
        )}

        {/* User Info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <User className="h-6 w-6" />
            Account Details
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={userId} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value="test@example.com" readOnly className="bg-muted" />
            </div>
          </div>
        </Card>

        {/* MCP Endpoint */}
        {sessionToken && (
          <>
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Key className="h-6 w-6" />
                Your MCP Endpoint
              </h2>
              <p className="text-sm text-muted-foreground">
                Use this endpoint URL and session token to integrate with MCP-compatible AI assistants like Claude
                Desktop.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Endpoint URL</Label>
                  <div className="flex gap-2">
                    <Input value={mcpEndpoint} readOnly className="bg-muted font-mono text-sm" />
                    <Button onClick={handleCopyEndpoint} variant="outline" size="icon">
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Session Token</Label>
                  <Input value={sessionToken} readOnly className="bg-muted font-mono text-sm" />
                  <p className="text-xs text-muted-foreground">
                    Valid for 24 hours. Generate a new one after expiration.
                  </p>
                </div>
              </div>
            </Card>

            {/* Configuration Guide */}
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">MCP Configuration</h2>
              <p className="text-sm text-muted-foreground">
                Add this configuration to your MCP client (e.g., Claude Desktop config file):
              </p>

              <CodeBlock
                language="json"
                filename="mcp_config.json"
                code={JSON.stringify(
                  {
                    mcpServers: {
                      "x402-notifications": {
                        url: mcpEndpoint,
                        auth: {
                          type: "bearer",
                          token: sessionToken,
                        },
                        description: "x402-powered notification system with payment gates",
                      },
                    },
                  },
                  null,
                  2,
                )}
              />

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href="/api/mcp/docs" target="_blank" rel="noreferrer">
                  View Full API Documentation <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>

            {/* Test Integration */}
            <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
              <h3 className="text-xl font-semibold">Test Your Integration</h3>
              <p className="text-sm text-muted-foreground">
                Try sending a test notification to verify your MCP endpoint is working:
              </p>
              <CodeBlock
                language="bash"
                code={`curl -X POST ${mcpEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "sendNotification",
    "params": {
      "userId": "${userId}",
      "email": "test@example.com",
      "subject": "Test from MCP",
      "message": "Hello from your custom endpoint!"
    },
    "sessionToken": "${sessionToken}"
  }'`}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
