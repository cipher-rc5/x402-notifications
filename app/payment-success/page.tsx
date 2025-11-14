'use client';
import { CodeBlock } from '@/components/code-block';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Copy, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = searchParams.get('userId') || 'unknown';
  const amount = searchParams.get('amount') || '0';
  const network = searchParams.get('network') || 'base-sepolia';
  const txHash = searchParams.get('txHash') || '';

  const mcpEndpoint = typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '';

  useEffect(() => {
    // Simulate fetching session token (in production, this comes from the webhook response)
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'createSession', params: { userId } })
        });

        const data = await response.json();
        if (data.success) {
          setSessionToken(data.data.sessionToken);
          localStorage.setItem('mcp_session_token', data.data.sessionToken);
          localStorage.setItem('x402_payment_complete', 'true');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
        // Auto-redirect to dashboard after 2 seconds with userId to bypass x402 check
        setTimeout(() => {
          router.push(`/dashboard?userId=${encodeURIComponent(userId)}`);
        }, 2000);
      }
    };

    fetchSession();
  }, [userId, router]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-green-500/5'>
        <div className='animate-pulse text-muted-foreground'>Setting up your MCP endpoint...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-background via-background to-green-500/5'>
      <div className='container mx-auto px-4 py-12 max-w-4xl space-y-8'>
        {/* Success Header */}
        <div className='text-center space-y-4'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/20 mb-4'>
            <CheckCircle2 className='h-10 w-10 text-green-600' />
          </div>
          <h1 className='text-3xl font-bold text-balance'>Payment Successful!</h1>
          <p className='text-lg text-muted-foreground'>Your x402 payment has been confirmed</p>
        </div>

        {/* Payment Details */}
        <Card className='p-6 space-y-4 border-green-500/20 bg-green-500/5'>
          <h2 className='text-xl font-semibold'>Transaction Details</h2>
          <div className='grid gap-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Amount:</span>
              <span className='font-mono font-semibold'>{amount} USDC</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Network:</span>
              <span className='font-mono'>{network}</span>
            </div>
            {txHash && (
              <div className='flex justify-between items-center gap-2'>
                <span className='text-muted-foreground'>Transaction:</span>
                <div className='flex items-center gap-2'>
                  <span className='font-mono text-xs truncate max-w-[200px]'>{txHash}</span>
                  <Button onClick={() => handleCopy(txHash)} variant='ghost' size='icon' className='h-6 w-6'>
                    {copied ? <CheckCircle2 className='h-3 w-3 text-green-600' /> : <Copy className='h-3 w-3' />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* MCP Endpoint Ready */}
        {sessionToken && (
          <>
            <Alert className='border-primary/20 bg-primary/5'>
              <Sparkles className='h-5 w-5 text-primary' />
              <AlertDescription className='ml-2'>
                <strong>Your custom MCP endpoint is now active!</strong>{' '}
                Use it to integrate notifications into AI assistants like Claude Desktop.
              </AlertDescription>
            </Alert>

            <Card className='p-6 space-y-4'>
              <h2 className='text-xl font-semibold'>Your MCP Notification Link</h2>
              <p className='text-sm text-muted-foreground'>
                This unique endpoint allows AI assistants to send notifications and manage your account programmatically.
              </p>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-semibold text-muted-foreground'>Endpoint URL</span>
                    <Button onClick={() => handleCopy(mcpEndpoint)} variant='ghost' size='sm'>
                      {copied ? <CheckCircle2 className='h-4 w-4 text-green-600 mr-2' /> : <Copy className='h-4 w-4 mr-2' />}
                      Copy
                    </Button>
                  </div>
                  <div className='p-3 rounded-lg bg-muted border border-border font-mono text-sm break-all'>{mcpEndpoint}</div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-semibold text-muted-foreground'>Session Token</span>
                    <Button onClick={() => handleCopy(sessionToken)} variant='ghost' size='sm'>
                      {copied ? <CheckCircle2 className='h-4 w-4 text-green-600 mr-2' /> : <Copy className='h-4 w-4 mr-2' />}
                      Copy
                    </Button>
                  </div>
                  <div className='p-3 rounded-lg bg-muted border border-border font-mono text-sm break-all'>{sessionToken}</div>
                  <p className='text-xs text-muted-foreground'>Valid for 24 hours</p>
                </div>
              </div>
            </Card>

            {/* Quick Setup Guide */}
            <Card className='p-6 space-y-4'>
              <h3 className='text-lg font-semibold'>Quick Setup for MCP Clients</h3>
              <p className='text-sm text-muted-foreground'>Add this configuration to your MCP-compatible AI assistant:</p>

              <CodeBlock
                language='json'
                filename='mcp_config.json'
                code={JSON.stringify(
                  { mcpServers: { 'x402-notifications': { url: mcpEndpoint, auth: { type: 'bearer', token: sessionToken } } } },
                  null,
                  2
                )} />
            </Card>

            {/* Next Steps */}
            <Card className='p-6 space-y-4 border-primary/20 bg-primary/5'>
              <h3 className='text-lg font-semibold'>Next Steps</h3>
              <div className='space-y-3'>
                <div className='flex items-start gap-3'>
                  <div className='rounded-full w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0'>
                    1
                  </div>
                  <div>
                    <p className='font-semibold'>View your profile</p>
                    <p className='text-sm text-muted-foreground'>Access your MCP endpoint details and integration examples</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='rounded-full w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0'>
                    2
                  </div>
                  <div>
                    <p className='font-semibold'>Read the documentation</p>
                    <p className='text-sm text-muted-foreground'>Explore all available API methods and TypeScript examples</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='rounded-full w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0'>
                    3
                  </div>
                  <div>
                    <p className='font-semibold'>Test your integration</p>
                    <p className='text-sm text-muted-foreground'>Use the API playground to send test notifications</p>
                  </div>
                </div>
              </div>

              <div className='flex gap-3 pt-4'>
                <Button asChild className='flex-1'>
                  <Link href='/profile'>View Profile</Link>
                </Button>
                <Button asChild variant='outline' className='flex-1 bg-transparent'>
                  <Link href='/api/mcp/docs'>
                    API Docs <ExternalLink className='ml-2 h-4 w-4' />
                  </Link>
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Back to Dashboard */}
        <div className='text-center'>
          <Button asChild variant='outline' size='lg'>
            <Link href={`/dashboard?userId=${encodeURIComponent(userId)}`}>Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
