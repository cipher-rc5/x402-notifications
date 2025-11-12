import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, Code2, Globe, Shield, Wallet, Zap } from "lucide-react"
import Link from "next/link"
import { NotificationFlowDiagram } from "@/components/notification-flow-diagram"

export default function HomePage() {
  console.log("HomePage rendering")

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/10">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>Powered by x402 Protocol</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-balance bg-linear-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
            AI-Native Notification System with Blockchain Micropayments
          </h1>

          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            Create custom notification endpoints for AI assistants through Model Context Protocol. User customizable
            message pricing via Solana or Ethereum testnets—pay as you go with no subscriptions or lock-in.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="font-semibold">
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/api/mcp/docs">API Docs</Link>
            </Button>
          </div>
        </div>

        <div className="mb-16">
          <NotificationFlowDiagram />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <div className="rounded-full w-12 h-12 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <Code2 className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-foreground">MCP Integration</h3>
            <p className="text-sm text-muted-foreground">
              AI assistants like Claude Desktop can trigger notifications programmatically through Model Context
              Protocol endpoints with custom conditions.
            </p>
          </Card>

          <Card className="p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <div className="rounded-full w-12 h-12 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-foreground">Pay-Per-Use Model</h3>
            <p className="text-sm text-muted-foreground">
              x402 micropayments with user customizable pricing per notification. Support for Base Sepolia and Solana
              Devnet testnets with seamless payment flows.
            </p>
          </Card>

          <Card className="p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <div className="rounded-full w-12 h-12 bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-foreground">Multi-Channel Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Notifications sent via email, SMS, push, in-app, voice, and Slack through NotificationAPI with guaranteed
              delivery and retry logic.
            </p>
          </Card>

          <Card className="p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <div className="rounded-full w-12 h-12 bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-foreground">Edge-Optimized Storage</h3>
            <p className="text-sm text-muted-foreground">
              Turso database with libSQL provides global distribution and sub-10ms queries for notification history and
              payment records.
            </p>
          </Card>

          <Card className="p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <div className="rounded-full w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-foreground">Condition-Based Triggers</h3>
            <p className="text-sm text-muted-foreground">
              Configure notifications to fire on payment thresholds, daily summaries, webhooks, or custom API events
              with template variables.
            </p>
          </Card>

          <Card className="p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <div className="rounded-full w-12 h-12 bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-pink-500" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-foreground">Modern Tech Stack</h3>
            <p className="text-sm text-muted-foreground">
              Built with Next.js 16, Bun runtime, shadcn/ui components, and Tailwind CSS v4 for maximum performance and
              developer experience.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-8 md:p-12 border-primary/20 bg-linear-to-r from-primary/5 to-primary/10 text-center">
          <h2 className="text-xl font-bold mb-4 text-foreground">Start Building Your AI Notification System</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Configure custom notification endpoints in minutes. Integrate with Claude, GPT, or any MCP-compatible AI
            assistant to automate your workflows.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">Access Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/api/mcp/docs">View Docs</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
