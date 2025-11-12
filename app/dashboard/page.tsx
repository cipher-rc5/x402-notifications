"use client"
import { NotificationCard } from "@/components/notification-card"
import { PaymentCard } from "@/components/payment-card"
import { StatsCard } from "@/components/stats-card"
import { NotificationTrigger } from "@/components/notification-trigger"
import { CustomNotificationCreator } from "@/components/custom-notification-creator"
import { PricingSelector } from "@/components/pricing-selector"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Notification, Payment } from "@/lib/turso"
import { Activity, Bell, DollarSign, Users, Code2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, unread: 0, totalSpent: 0, paymentsCount: 0 })
  const [showPricingSelector, setShowPricingSelector] = useState(false)
  const [pricingModel, setPricingModel] = useState<{ model: string; plan?: any } | null>(null)

  const userId = "test-user-1"
  const userEmail = "test@example.com"

  useEffect(() => {
    console.log("Dashboard mounted, loading data...")
    loadData()
    loadPricingModel()
  }, [])

  async function loadData() {
    try {
      console.log("Starting data load for userId:", userId)
      setLoading(true)
      setError(null)

      console.log("Fetching notifications...")
      const notifResponse = await fetch(`/api/notifications?userId=${userId}`)
      console.log("Notifications response status:", notifResponse.status)

      if (!notifResponse.ok) {
        const errorText = await notifResponse.text()
        console.error("Notifications API error:", errorText)
        throw new Error(`Failed to fetch notifications: ${errorText}`)
      }

      const notifData = await notifResponse.json()
      console.log("Notifications data:", notifData)

      if (notifData.success) {
        setNotifications(notifData.notifications)
        setStats((prev) => ({
          ...prev,
          total: notifData.count,
          unread: notifData.notifications.filter((n: Notification) => n.status !== "read").length,
        }))
      }

      console.log("Fetching payments...")
      const paymentResponse = await fetch(`/api/payments?userId=${userId}`)
      console.log("Payments response status:", paymentResponse.status)

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text()
        console.error("Payments API error:", errorText)
        throw new Error(`Failed to fetch payments: ${errorText}`)
      }

      const paymentData = await paymentResponse.json()
      console.log("Payments data:", paymentData)

      if (paymentData.success) {
        setPayments(paymentData.payments)
        const total = paymentData.payments.reduce((sum: number, p: Payment) => sum + Number.parseFloat(p.amount), 0)
        setStats((prev) => ({ ...prev, totalSpent: total, paymentsCount: paymentData.count }))
      }

      console.log("Data load complete")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("Error loading dashboard data:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function loadPricingModel() {
    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.pricingModel) {
          setPricingModel({
            model: data.pricingModel.pricing_model,
            plan: data.subscription,
          })
        }
      }
    } catch (error) {
      console.error("Error loading pricing model:", error)
    }
  }

  async function handlePlanSelected(model: "pay-per-use" | "subscription", planId?: string, customPrice?: number) {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          pricingModel: model,
          planId,
          perNotificationPrice: customPrice,
        }),
      })

      if (response.ok) {
        setShowPricingSelector(false)
        loadPricingModel()
        alert(`Successfully switched to ${model} model!`)
      }
    } catch (error) {
      console.error("Error updating pricing model:", error)
      alert("Failed to update pricing model")
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" })

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "read" as const, read_at: Math.floor(Date.now() / 1000) } : n,
        ),
      )

      setStats((prev) => ({ ...prev, unread: prev.unread - 1 }))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="p-8 max-w-md border-red-500/20 bg-red-500/5">
          <div className="space-y-4 text-center">
            <div className="text-red-500">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="space-y-2 text-xs text-left bg-muted p-3 rounded">
              <p className="font-semibold">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Check environment variables are set (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)</li>
                <li>Ensure database tables are created (run SQL scripts)</li>
                <li>Check browser console for detailed errors</li>
              </ul>
            </div>
            <Button onClick={loadData} className="w-full">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Notification Dashboard</h1>
          <p className="text-muted-foreground text-pretty">
            Manage your notifications and track payments across Solana and EVM networks
          </p>
        </div>

        {pricingModel && (
          <Card className="p-4 bg-card/40 backdrop-blur-md border-border shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Current Plan:{" "}
                  {pricingModel.model === "subscription"
                    ? pricingModel.plan?.plan_name || "Subscription"
                    : "Pay-Per-Use"}
                </p>
                {pricingModel.model === "subscription" && pricingModel.plan && (
                  <p className="text-xs text-muted-foreground">
                    {pricingModel.plan.notifications_used || 0} / {pricingModel.plan.notification_limit || "∞"}{" "}
                    notifications used
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPricingSelector(true)}
                className="border-border text-foreground hover:bg-muted"
              >
                Change Plan
              </Button>
            </div>
          </Card>
        )}

        {showPricingSelector && (
          <Card className="p-6 border-2 border-primary/50 bg-card/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(220,31,255,0.2)]">
            <PricingSelector userId={userId} onPlanSelected={handlePlanSelected} />
            <Button
              variant="ghost"
              className="w-full mt-4 text-muted-foreground"
              onClick={() => setShowPricingSelector(false)}
            >
              Cancel
            </Button>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Notifications" value={stats.total} icon={Bell} description="All time" />
          <StatsCard
            title="Unread"
            value={stats.unread}
            icon={Activity}
            description="Requires attention"
            className="border-border bg-card/50"
          />
          <StatsCard
            title="Total Spent"
            value={`$${stats.totalSpent.toFixed(4)}`}
            icon={DollarSign}
            description="USDC across all networks"
          />
          <StatsCard title="Payments" value={stats.paymentsCount} icon={Users} description="Total transactions" />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="custom" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted/50 border border-border">
            <TabsTrigger value="custom">Custom MCP</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="trigger">Send</TabsTrigger>
          </TabsList>

          {/* Custom MCP Notifications Tab - Now First */}
          <TabsContent value="custom" className="space-y-4">
            <CustomNotificationCreator userId={userId} userEmail={userEmail} />

            {/* MCP Integration Guide */}
            <Card className="p-6 bg-card/50 border-border backdrop-blur">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">How Custom MCP Notifications Work</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-2 text-pretty">
                  <p>
                    After purchasing a custom notification for $0.99 USDC, you'll receive a unique MCP endpoint that can
                    be integrated with AI assistants and automation tools.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Notifications trigger automatically based on your configured conditions</li>
                    <li>Supports Solana Devnet and Base Sepolia Testnet for payments</li>
                    <li>Use template variables to customize message content dynamically</li>
                    <li>Full MCP protocol support for AI assistant integration</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-border text-foreground hover:bg-muted bg-transparent"
                >
                  <a href="/api/mcp/docs">View MCP Documentation</a>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Recent Notifications</h2>
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted bg-transparent"
              >
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card className="p-12 text-center border-dashed bg-card/50 border-border">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} onMarkRead={handleMarkRead} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Payment History</h2>
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted bg-transparent"
              >
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {payments.length === 0 ? (
                <Card className="p-12 text-center border-dashed bg-card/50 border-border">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No payments yet</p>
                </Card>
              ) : (
                payments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="trigger" className="space-y-4">
            <NotificationTrigger userId={userId} userEmail={userEmail} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
