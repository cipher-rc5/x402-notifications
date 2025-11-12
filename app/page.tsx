import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, Code2, Database, Globe, Wallet, Zap } from "lucide-react"
import Link from "next/link"
import { NotificationFlowDiagram } from "@/components/notification-flow-diagram"

export default function HomePage() {
  console.log("HomePage rendering")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DC1FFF] text-white text-sm font-semibold shadow-lg">
            <Zap className="h-4 w-4" />
            <span>Powered by x402 Protocol</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-balance text-white">
            AI-Native Notification System with Flexible Pricing
          </h1>

          <p className="text-lg text-slate-200 text-pretty max-w-2xl mx-auto leading-relaxed">
            Create custom notification endpoints for AI assistants through{" "}
            <span className="text-[#00FFA3] font-semibold">Model Context Protocol</span>. Choose between pay-per-use
            micropayments or subscription plans—powered by{" "}
            <span className="text-[#00FFA3] font-semibold">Solana and Ethereum</span>.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="font-semibold bg-[#DC1FFF] hover:bg-[#DC1FFF]/90 text-white shadow-lg">
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-slate-700 text-white hover:bg-slate-800 bg-transparent"
            >
              <Link href="/api/mcp/docs">API Docs</Link>
            </Button>
          </div>
        </div>

        <div className="mb-16">
          <NotificationFlowDiagram />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 bg-slate-900/50 border-slate-800 hover:shadow-xl hover:border-slate-700 transition-all backdrop-blur">
            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-[#00FFA3]">MCP Integration</h3>
            <p className="text-sm text-slate-300">
              AI assistants like Claude Desktop can trigger notifications programmatically through Model Context
              Protocol endpoints with custom conditions.
            </p>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800 hover:shadow-xl hover:border-slate-700 transition-all backdrop-blur">
            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-[#00FFA3]">Flexible Pricing Models</h3>
            <p className="text-sm text-slate-300">
              Choose between pay-per-use micropayments with x402 protocol or subscription plans starting at $9.99/month.
              Support for Base Sepolia and Solana Devnet with seamless payment flows.
            </p>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800 hover:shadow-xl hover:border-slate-700 transition-all backdrop-blur">
            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-[#00FFA3]">Multi-Channel Delivery</h3>
            <p className="text-sm text-slate-300">
              Notifications sent via email, SMS, push, in-app, voice, and Slack through NotificationAPI with guaranteed
              delivery and retry logic.
            </p>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800 hover:shadow-xl hover:border-slate-700 transition-all backdrop-blur">
            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-[#00FFA3]">Edge-Optimized Storage</h3>
            <p className="text-sm text-slate-300">
              Turso database with libSQL provides global distribution and sub-10ms queries for notification history,
              payment records, and subscription tracking.
            </p>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800 hover:shadow-xl hover:border-slate-700 transition-all backdrop-blur">
            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-[#00FFA3]">Condition-Based Triggers</h3>
            <p className="text-sm text-slate-300">
              Configure notifications to fire on payment thresholds, daily summaries, webhooks, or custom API events
              with template variables and usage limits per plan.
            </p>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800 hover:shadow-xl hover:border-slate-700 transition-all backdrop-blur">
            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-[#00FFA3]">Modern Tech Stack</h3>
            <p className="text-sm text-slate-300">
              Built with Next.js 16, Bun runtime, shadcn/ui components, and Tailwind CSS v4 for maximum performance and
              developer experience.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-8 md:p-12 bg-slate-900/80 border-[#00FFA3]/30 border-2 text-center shadow-2xl">
          <h2 className="text-xl font-bold mb-4 text-[#00FFA3]">Start Building Your AI Notification System</h2>
          <p className="text-slate-200 mb-6 max-w-xl mx-auto">
            Configure custom notification endpoints in minutes. Choose your pricing model: pay-per-use for flexibility
            or subscriptions for predictable costs. Integrate with Claude, GPT, or any MCP-compatible AI assistant.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-[#DC1FFF] hover:bg-[#DC1FFF]/90 text-white shadow-lg">
              <Link href="/dashboard">Access Dashboard</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-slate-700 text-white hover:bg-slate-800 bg-transparent"
            >
              <Link href="/api/mcp/docs">View Docs</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
