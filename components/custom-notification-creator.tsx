'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, Sparkles, Wallet } from 'lucide-react';
import { useState } from 'react';

interface CustomNotificationCreatorProps {
  userId: string;
  userEmail: string;
}

export function CustomNotificationCreator({ userId, userEmail }: CustomNotificationCreatorProps) {
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('payment_received');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [network, setNetwork] = useState<'base-sepolia' | 'solana-devnet'>('base-sepolia');
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<{ success: boolean, message: string, mcpEndpoint?: string } | null>(null);

  const handlePayment = async () => {
    setPaying(true);
    setResult(null);

    try {
      // Simulate x402 payment of $0.99 USDC
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, network, amount: '0.99', resource: `custom-notification-${Date.now()}` })
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.success) {
        setResult({ success: false, message: 'Payment failed. Please try again.' });
        return;
      }

      // After payment, create the custom notification
      await handleCreateNotification(paymentData.paymentId);
    } catch (error) {
      console.error('Payment error:', error);
      setResult({ success: false, message: 'Network error during payment. Please try again.' });
    } finally {
      setPaying(false);
    }
  };

  const handleCreateNotification = async (paymentId: string) => {
    setCreating(true);

    try {
      // Create MCP session for this custom notification
      const sessionResponse = await fetch('/api/mcp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, metadata: { notificationName: name, condition, subject, message, paymentId } })
      });

      const sessionData = await sessionResponse.json();

      if (sessionResponse.ok && sessionData.success) {
        const mcpEndpoint = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mcp?token=${sessionData.sessionToken}`;

        setResult({ success: true, message: 'Custom notification created successfully!', mcpEndpoint });

        // Reset form
        setName('');
        setSubject('');
        setMessage('');
      } else {
        setResult({ success: false, message: sessionData.error || 'Failed to create notification' });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setCreating(false);
    }
  };

  const handlePurchase = () => {
    if (!name || !subject || !message) {
      setResult({ success: false, message: 'Please fill in all fields' });
      return;
    }

    handlePayment();
  };

  return (
    <Card className='p-6 space-y-6 border-primary/20 bg-linear-to-br from-primary/5 to-primary/10'>
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-[#03E1FF]' />
            <h3 className='text-lg font-semibold'>Create Custom Notification</h3>
          </div>
          <p className='text-sm text-muted-foreground text-pretty'>
            Configure custom notifications with specific trigger conditions for your MCP endpoint.
          </p>
        </div>
        <Badge variant='secondary' className='text-base font-bold'>$0.99 USDC</Badge>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='custom-name'>Notification Name</Label>
          <Input id='custom-name' placeholder='e.g., Payment Alert System' value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='trigger-condition'>Trigger Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id='trigger-condition'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='payment_received'>Payment Received</SelectItem>
              <SelectItem value='payment_threshold'>Payment Threshold Exceeded</SelectItem>
              <SelectItem value='daily_summary'>Daily Summary</SelectItem>
              <SelectItem value='weekly_report'>Weekly Report</SelectItem>
              <SelectItem value='api_event'>API Event Triggered</SelectItem>
              <SelectItem value='custom_webhook'>Custom Webhook</SelectItem>
            </SelectContent>
          </Select>
          <p className='text-xs text-muted-foreground'>The condition that will trigger this notification via your MCP endpoint</p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='custom-subject'>Subject Template</Label>
          <Input
            id='custom-subject'
            placeholder='Use {{variable}} for dynamic values'
            value={subject}
            onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='custom-message'>Message Template</Label>
          <Textarea
            id='custom-message'
            placeholder='Enter message template with {{variables}}...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4} />
          <p className='text-xs text-muted-foreground'>Available variables: {`{{amount}}, {{network}}, {{timestamp}}, {{userId}}`}</p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='payment-network'>Payment Network</Label>
          <Select value={network} onValueChange={(v) => setNetwork(v as typeof network)}>
            <SelectTrigger id='payment-network'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='base-sepolia'>Base Sepolia Testnet</SelectItem>
              <SelectItem value='solana-devnet'>Solana Devnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handlePurchase} disabled={creating || paying} className='w-full gap-2' size='lg'>
          <Wallet className='h-5 w-5' />
          {paying ? 'Processing Payment...' : creating ? 'Creating...' : 'Pay $0.99 & Create'}
        </Button>

        {result && (
          <Alert className={result.success ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}>
            {result.success ? <CheckCircle2 className='h-5 w-5 text-green-600' /> : <AlertCircle className='h-5 w-5 text-red-600' />}
            <AlertDescription className='ml-2 space-y-2'>
              <p>{result.message}</p>
              {result.mcpEndpoint && (
                <div className='mt-3 p-3 rounded bg-muted'>
                  <p className='text-xs font-semibold mb-1'>Your MCP Endpoint:</p>
                  <code className='text-xs break-all'>{result.mcpEndpoint}</code>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-2 w-full bg-transparent'
                    onClick={() => navigator.clipboard.writeText(result.mcpEndpoint!)}>
                    Copy to Clipboard
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}
