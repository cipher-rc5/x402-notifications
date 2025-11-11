"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Send, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"

interface NotificationTriggerProps {
  userId: string
  userEmail: string
}

export function NotificationTrigger({ userId, userEmail }: NotificationTriggerProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("notification_system")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendNotification = async () => {
    if (!subject || !message) {
      setResult({ success: false, message: "Please fill in all fields" })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: userEmail,
          subject,
          message,
          type,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({ success: true, message: `Notification sent! ID: ${data.notificationId}` })
        setSubject("")
        setMessage("")
      } else {
        setResult({ success: false, message: data.error || "Failed to send notification" })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error. Please try again." })
      console.error("Error sending notification:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">Send Test Notification</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Trigger a notification manually to test your integration. The notification will be sent via NotificationAPI and
        logged to the database.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notification-type">Notification Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="notification-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notification_system">System Notification</SelectItem>
              <SelectItem value="payment_received">Payment Received</SelectItem>
              <SelectItem value="payment_failed">Payment Failed</SelectItem>
              <SelectItem value="mcp_session_created">MCP Session Created</SelectItem>
              <SelectItem value="custom_alert">Custom Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-subject">Subject</Label>
          <Input
            id="notification-subject"
            placeholder="Enter notification subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-message">Message</Label>
          <Textarea
            id="notification-message"
            placeholder="Enter notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={handleSendNotification} disabled={sending} className="w-full gap-2">
          <Send className="h-4 w-4" />
          {sending ? "Sending..." : "Send Notification"}
        </Button>

        {result && (
          <Alert className={result.success ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}>
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription className="ml-2">{result.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  )
}
