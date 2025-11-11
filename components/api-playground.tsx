"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Loader2 } from "lucide-react"
import { useState } from "react"
import { CodeBlock } from "./code-block"

export function ApiPlayground() {
  const [method, setMethod] = useState("createSession")
  const [userId, setUserId] = useState("test-user-1")
  const [email, setEmail] = useState("test@example.com")
  const [subject, setSubject] = useState("Test Notification")
  const [message, setMessage] = useState("This is a test notification from the API playground")
  const [sessionToken, setSessionToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExecute = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const body: any = { method }

      if (method === "createSession") {
        body.params = { userId }
      } else if (method === "sendNotification") {
        body.params = { userId, email, subject, message }
        body.sessionToken = sessionToken
      } else if (method === "getNotifications") {
        body.params = {}
        body.sessionToken = sessionToken
      }

      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      setResponse(data)

      // Auto-populate session token for convenience
      if (data.success && data.data?.sessionToken) {
        setSessionToken(data.data.sessionToken)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createSession">createSession</SelectItem>
              <SelectItem value="sendNotification">sendNotification</SelectItem>
              <SelectItem value="getNotifications">getNotifications</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="test-user-1" />
          </div>

          {method !== "createSession" && (
            <div className="space-y-2">
              <Label>Session Token</Label>
              <Input
                value={sessionToken}
                onChange={(e) => setSessionToken(e.target.value)}
                placeholder="tok-xxxxx..."
              />
            </div>
          )}
        </div>

        {method === "sendNotification" && (
          <>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Notification subject" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message"
                rows={4}
              />
            </div>
          </>
        )}

        <Button onClick={handleExecute} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Execute Request
        </Button>
      </div>

      {error && (
        <Alert className="border-red-500/20 bg-red-500/5">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <div className="space-y-2">
          <Label>Response</Label>
          <CodeBlock language="json" code={JSON.stringify(response, null, 2)} />
        </div>
      )}
    </Card>
  )
}
