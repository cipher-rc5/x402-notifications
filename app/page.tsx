import { NotificationFlowDiagram } from '@/components/notification-flow-diagram';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, Code2, Database, Globe, Wallet, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  console.log('HomePage rendering');

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 py-16 max-w-6xl'>
        {/* Hero Section */}
        <div className='text-center space-y-6 mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 text-foreground text-sm font-semibold shadow-lg'>
            <Zap className='h-4 w-4 text-primary' />
            <span>Powered by x402 Protocol</span>
          </div>

          <h1 className='text-3xl md:text-4xl font-bold text-balance text-foreground'>
            AI-Native Notification System with Flexible Pricing
          </h1>

          <p className='text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed'>
            Create custom notification endpoints for AI assistants through{' '}
            <span className='text-[#00FFA3] font-semibold'>Model Context Protocol</span>. Choose between pay-per-use micropayments or
            subscription plans—powered by <span className='text-[#00FFA3] font-semibold'>Solana and Ethereum</span>.
          </p>

          <div className='flex items-center justify-center gap-4 pt-4'>
            <Button
              size='lg'
              asChild
              className='font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(220,31,255,0.3)] hover:shadow-[0_0_30px_rgba(220,31,255,0.5)] transition-all'>
              <Link href='/dashboard'>Launch Dashboard</Link>
            </Button>
            <Button size='lg' variant='outline' asChild className='transition-all bg-transparent'>
              <Link href='/api/mcp/docs'>API Docs</Link>
            </Button>
          </div>
        </div>

        <div className='mb-16'>
          <NotificationFlowDiagram />
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
          <Card className='p-6 bg-card/40 backdrop-blur-md border-border hover:bg-card/60 hover:shadow-xl hover:border-border/80 transition-all duration-300'>
            <div className='rounded-full w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(168,85,247,0.4)]'>
              <Code2 className='h-6 w-6 text-white' />
            </div>
            <h3 className='text-base font-semibold mb-2 text-[#00FFA3]'>MCP Integration</h3>
            <p className='text-sm text-muted-foreground'>
              AI assistants like Claude Desktop can trigger notifications programmatically through Model Context Protocol endpoints with
              custom conditions.
            </p>
          </Card>

          <Card className='p-6 bg-card/40 backdrop-blur-md border-border hover:bg-card/60 hover:shadow-xl hover:border-border/80 transition-all duration-300'>
            <div className='rounded-full w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(236,72,153,0.4)]'>
              <Wallet className='h-6 w-6 text-white' />
            </div>
            <h3 className='text-base font-semibold mb-2 text-[#00FFA3]'>Flexible Pricing Models</h3>
            <p className='text-sm text-muted-foreground'>
              Choose between pay-per-use micropayments with x402 protocol or subscription plans starting at $9.99/month. Support for Base
              Sepolia and Solana Devnet with seamless payment flows.
            </p>
          </Card>

          <Card className='p-6 bg-card/40 backdrop-blur-md border-border hover:bg-card/60 hover:shadow-xl hover:border-border/80 transition-all duration-300'>
            <div className='rounded-full w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(6,182,212,0.4)]'>
              <Bell className='h-6 w-6 text-white' />
            </div>
            <h3 className='text-base font-semibold mb-2 text-[#00FFA3]'>Multi-Channel Delivery</h3>
            <p className='text-sm text-muted-foreground'>
              Notifications sent via email, SMS, push, in-app, voice, and Slack through NotificationAPI with guaranteed delivery and retry
              logic.
            </p>
          </Card>

          <Card className='p-6 bg-card/40 backdrop-blur-md border-border hover:bg-card/60 hover:shadow-xl hover:border-border/80 transition-all duration-300'>
            <div className='rounded-full w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(249,115,22,0.4)]'>
              <Database className='h-6 w-6 text-white' />
            </div>
            <h3 className='text-base font-semibold mb-2 text-[#00FFA3]'>Edge-Optimized Storage</h3>
            <p className='text-sm text-muted-foreground'>
              Turso database with libSQL provides global distribution and sub-10ms queries for notification history, payment records, and
              subscription tracking.
            </p>
          </Card>

          <Card className='p-6 bg-card/40 backdrop-blur-md border-border hover:bg-card/60 hover:shadow-xl hover:border-border/80 transition-all duration-300'>
            <div className='rounded-full w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(59,130,246,0.4)]'>
              <Zap className='h-6 w-6 text-white' />
            </div>
            <h3 className='text-base font-semibold mb-2 text-[#00FFA3]'>Condition-Based Triggers</h3>
            <p className='text-sm text-muted-foreground'>
              Configure notifications to fire on payment thresholds, daily summaries, webhooks, or custom API events with template variables
              and usage limits per plan.
            </p>
          </Card>

          <Card className='p-6 bg-card/40 backdrop-blur-md border-border hover:bg-card/60 hover:shadow-xl hover:border-border/80 transition-all duration-300'>
            <div className='rounded-full w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(16,185,129,0.4)]'>
              <Globe className='h-6 w-6 text-white' />
            </div>
            <h3 className='text-base font-semibold mb-2 text-[#00FFA3]'>Modern Tech Stack</h3>
            <p className='text-sm text-muted-foreground'>
              Built with Next.js 16, Bun runtime, shadcn/ui components, and Tailwind CSS v4 for maximum performance and developer
              experience.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className='p-8 md:p-12 bg-card/50 backdrop-blur-md border-border text-center shadow-2xl'>
          <h2 className='text-xl font-bold mb-4 text-foreground'>Start Building Your AI Notification System</h2>
          <p className='text-muted-foreground mb-6 max-w-xl mx-auto'>
            Configure custom notification endpoints in minutes. Choose your pricing model: pay-per-use for flexibility or subscriptions for
            predictable costs. Integrate with Claude, GPT, or any MCP-compatible AI assistant.
          </p>
          <div className='flex items-center justify-center gap-4'>
            <Button
              size='lg'
              asChild
              className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(220,31,255,0.3)] hover:shadow-[0_0_30px_rgba(220,31,255,0.5)] transition-all'>
              <Link href='/dashboard'>Access Dashboard</Link>
            </Button>
            <Button size='lg' variant='outline' asChild className='transition-all bg-transparent'>
              <Link href='/api/mcp/docs'>View Docs</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
