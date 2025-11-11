import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type Payment } from '@/lib/turso';
import { cn } from '@/lib/utils';
import { Check, Clock, CreditCard, ExternalLink } from 'lucide-react';

interface PaymentCardProps {
  payment: Payment;
}

export function PaymentCard({ payment }: PaymentCardProps) {
  const getNetworkColor = () => {
    if (payment.network.includes('base')) {
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
    if (payment.network.includes('solana')) {
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
    return 'bg-muted text-muted-foreground';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const truncateHash = (hash?: string) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const getExplorerUrl = (hash?: string) => {
    if (!hash) return '#';
    if (payment.network.includes('base')) {
      return `https://sepolia.basescan.org/tx/${hash}`;
    }
    if (payment.network.includes('solana')) {
      return `https://explorer.solana.com/tx/${hash}?cluster=devnet`;
    }
    return '#';
  };

  return (
    <Card className='p-4 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all'>
      <div className='flex items-start gap-4'>
        <div
          className={cn(
            'rounded-full p-2 border',
            payment.status === 'confirmed' ?
              'bg-green-500/10 text-green-500 border-green-500/20' :
              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
          )}>
          {payment.status === 'confirmed' ? <Check className='h-4 w-4' /> : <Clock className='h-4 w-4' />}
        </div>

        <div className='flex-1 space-y-2'>
          <div className='flex items-start justify-between gap-2'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <span className='text-xl font-bold text-foreground'>${payment.amount}</span>
                <span className='text-sm text-muted-foreground'>{payment.currency}</span>
              </div>
              <p className='text-sm text-muted-foreground'>{payment.resource}</p>
            </div>

            <Badge variant='outline' className={cn('text-xs', getNetworkColor())}>{payment.network}</Badge>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <CreditCard className='h-3 w-3' />
              <span>{truncateHash(payment.transaction_hash)}</span>
            </div>

            {payment.transaction_hash && (
              <Button variant='ghost' size='sm' asChild className='h-7 text-xs'>
                <a href={getExplorerUrl(payment.transaction_hash)} target='_blank' rel='noopener noreferrer'>
                  View
                  <ExternalLink className='ml-1 h-3 w-3' />
                </a>
              </Button>
            )}
          </div>

          <div className='text-xs text-muted-foreground'>{formatDate(payment.created_at)}</div>
        </div>
      </div>
    </Card>
  );
}
