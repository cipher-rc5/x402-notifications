import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, Code2, Globe, Shield, Wallet, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  console.log('HomePage rendering');

  return (
    <div className='min-h-screen bg-linear-to-br from-background via-background to-primary/10'>
      <div className='container mx-auto px-6 py-16 max-w-6xl'>
        {/* Hero Section */}
        <div className='text-center space-y-6 mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium'>
            <Zap className='h-4 w-4' />
            <span>Powered by x402 Protocol</span>
          </div>

          <h1 className='text-5xl md:text-6xl font-bold text-balance bg-linear-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent'>
            Next-Gen Notification System
          </h1>

          <p className='text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed'>
            Multi-channel notifications with blockchain payments across Solana and EVM networks. Built for the future with MCP integration.
          </p>

          <div className='flex items-center justify-center gap-4 pt-4'>
            <Button size='lg' asChild className='font-semibold'>
              <Link href='/dashboard'>Launch Dashboard</Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/api/mcp/docs'>API Docs</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
          <Card className='p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all'>
            <div className='rounded-full w-12 h-12 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4'>
              <Bell className='h-6 w-6 text-blue-500' />
            </div>
            <h3 className='text-lg font-semibold mb-2 text-foreground'>Multi-Channel</h3>
            <p className='text-sm text-muted-foreground'>
              Send notifications via email, SMS, push, in-app, voice, and Slack with NotificationAPI integration.
            </p>
          </Card>

          <Card className='p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all'>
            <div className='rounded-full w-12 h-12 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4'>
              <Wallet className='h-6 w-6 text-purple-500' />
            </div>
            <h3 className='text-lg font-semibold mb-2 text-foreground'>Blockchain Payments</h3>
            <p className='text-sm text-muted-foreground'>
              x402 payment protocol supporting Base, Base Sepolia, Solana Devnet, and Solana Testnet.
            </p>
          </Card>

          <Card className='p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all'>
            <div className='rounded-full w-12 h-12 bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4'>
              <Shield className='h-6 w-6 text-green-500' />
            </div>
            <h3 className='text-lg font-semibold mb-2 text-foreground'>Turso Database</h3>
            <p className='text-sm text-muted-foreground'>
              Edge-optimized SQLite storage with libSQL for blazing fast queries and global distribution.
            </p>
          </Card>

          <Card className='p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all'>
            <div className='rounded-full w-12 h-12 bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4'>
              <Code2 className='h-6 w-6 text-orange-500' />
            </div>
            <h3 className='text-lg font-semibold mb-2 text-foreground'>MCP Protocol</h3>
            <p className='text-sm text-muted-foreground'>
              Model Context Protocol integration allows AI assistants to interface with the system programmatically.
            </p>
          </Card>

          <Card className='p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all'>
            <div className='rounded-full w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4'>
              <Zap className='h-6 w-6 text-cyan-500' />
            </div>
            <h3 className='text-lg font-semibold mb-2 text-foreground'>Bun Runtime</h3>
            <p className='text-sm text-muted-foreground'>
              Built with Bun for ultra-fast package management, builds, and runtime performance.
            </p>
          </Card>

          <Card className='p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all'>
            <div className='rounded-full w-12 h-12 bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4'>
              <Globe className='h-6 w-6 text-pink-500' />
            </div>
            <h3 className='text-lg font-semibold mb-2 text-foreground'>Modern Stack</h3>
            <p className='text-sm text-muted-foreground'>
              Next.js 16, React 19, shadcn/ui, Lucide icons, and Tailwind CSS v4 for a cutting-edge developer experience.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className='p-8 md:p-12 border-primary/20 bg-linear-to-r from-primary/5 to-primary/10 text-center'>
          <h2 className='text-3xl font-bold mb-4 text-foreground'>Ready to get started?</h2>
          <p className='text-muted-foreground mb-6 max-w-xl mx-auto'>
            Access the dashboard with micropayments via x402 or integrate the MCP API into your AI workflows.
          </p>
          <div className='flex items-center justify-center gap-4'>
            <Button size='lg' asChild>
              <Link href='/dashboard'>Access Dashboard</Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/api/mcp'>View API</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
