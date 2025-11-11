'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type Notification } from '@/lib/turso';
import { cn } from '@/lib/utils';
import { Bell, CheckCircle2, Clock, Eye, XCircle } from 'lucide-react';

interface NotificationCardProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const getStatusIcon = () => {
    switch (notification.status) {
      case 'delivered':
      case 'sent':
        return <CheckCircle2 className='h-4 w-4' />;
      case 'failed':
        return <XCircle className='h-4 w-4' />;
      case 'pending':
        return <Clock className='h-4 w-4' />;
      case 'read':
        return <Eye className='h-4 w-4' />;
      default:
        return <Bell className='h-4 w-4' />;
    }
  };

  const getStatusColor = () => {
    switch (notification.status) {
      case 'delivered':
      case 'sent':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'read':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-lg border-border/50 backdrop-blur-sm',
        notification.status === 'read' && 'opacity-60'
      )}>
      <div className='flex items-start gap-4'>
        <div className={cn('rounded-full p-2 border', getStatusColor())}>{getStatusIcon()}</div>

        <div className='flex-1 space-y-2'>
          <div className='flex items-start justify-between gap-2'>
            <div className='space-y-1'>
              <h4 className='font-semibold text-foreground'>{notification.title}</h4>
              <p className='text-sm text-muted-foreground'>{notification.message}</p>
            </div>

            <Badge variant='outline' className='text-xs shrink-0'>{notification.channel}</Badge>
          </div>

          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>{formatDate(notification.created_at)}</span>

            {notification.status !== 'read' && onMarkRead && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onMarkRead(notification.id)}
                className='h-7 text-xs'>
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
