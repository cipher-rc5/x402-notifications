"use client"

import { Card } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { Bell, DollarSign, Activity, Users } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { NotificationCard } from "@/components/notification-card"
import { PaymentCard } from "@/components/payment-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Notification, Payment } from "@/lib/turso"

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    totalSpent: 0,
    paymentsCount: 0,
  })

  const userId = "test-user-1" // In production, get from auth context

  useEffect(() => {
    console.log("[v0] Dashboard mounted, loading data...")
    loadData()
  }, [])

  async function loadData() {
    try {
      console.log("[v0] Starting data load for userId:", userId)
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching notifications...")
      const notifResponse = await fetch(`/api/notifications?userId=${userId}`)
      console.log("[v0] Notifications response status:", notifResponse.status)

      if (!notifResponse.ok) {
        const errorText = await notifResponse.text()
        console.error("[v0] Notifications API error:", errorText)
        throw new Error(`Failed to fetch notifications: ${errorText}`)
      }

      const notifData = await notifResponse.json()
      console.log("[v0] Notifications data:", notifData)

      if (notifData.success) {
        setNotifications(notifData.notifications)
        setStats((prev) => ({
          ...prev,
          total: notifData.count,
          unread: notifData.notifications.filter((n: Notification) => n.status !== "read").length,
        }))
      }

      console.log("[v0] Fetching payments...")
      const paymentResponse = await fetch(`/api/payments?userId=${userId}`)
      console.log("[v0] Payments response status:", paymentResponse.status)

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text()
        console.error("[v0] Payments API error:", errorText)
        throw new Error(`Failed to fetch payments: ${errorText}`)
      }

      const paymentData = await paymentResponse.json()
      console.log("[v0] Payments data:", paymentData)

      if (paymentData.success) {
        setPayments(paymentData.payments)
        const total = paymentData.payments.reduce((sum: number, p: Payment) => sum + Number.parseFloat(p.amount), 0)
        setStats((prev) => ({
          ...prev,
          totalSpent: total,
          paymentsCount: paymentData.count,
        }))
      }

      console.log("[v0] Data load complete")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[v0] Error loading dashboard data:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "read" as const, read_at: Math.floor(Date.now() / 1000) } : n,
        ),
      )

      setStats((prev) => ({
        ...prev,
        unread: prev.unread - 1,
      }))
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            x402 Notification Dashboard
          </h1>
          <p className="text-muted-foreground text-pretty">
            Manage your notifications and track payments across Solana and EVM networks
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Notifications" value={stats.total} icon={Bell} description="All time" />
          <StatsCard
            title="Unread"
            value={stats.unread}
            icon={Activity}
            description="Requires attention"
            className="border-yellow-500/20 bg-yellow-500/5"
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
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Recent Notifications</h2>
              <Button onClick={loadData} variant="outline" size="sm">
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
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
              <Button onClick={loadData} variant="outline" size="sm">
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {payments.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No payments yet</p>
                </Card>
              ) : (
                payments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* MCP Info Card */}
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">MCP Integration</h3>
            <p className="text-sm text-muted-foreground text-pretty">
              This system supports Model Context Protocol. AI assistants can interface with notifications, payments, and
              user data via the <code className="px-1 py-0.5 rounded bg-muted">/api/mcp</code> endpoint.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/api/mcp/docs">View MCP Documentation</a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
