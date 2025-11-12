import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number, label: string };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, description, trend, className }: StatsCardProps) {
  return (
    <Card className={cn('p-6 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all', className)}>
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>{title}</p>
          <p className='text-2xl font-bold text-foreground'>{value}</p>
          {description && <p className='text-xs text-muted-foreground'>{description}</p>}
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trend.value > 0 ? 'text-green-500' : 'text-red-500')}>
              <span>{trend.value > 0 ? '+' : ''} {trend.value}%</span>
              <span className='text-muted-foreground'>{trend.label}</span>
            </div>
          )}
        </div>

        <div className='rounded-full p-3 bg-primary/10 text-primary border border-primary/20'>
          <Icon className='h-6 w-6' />
        </div>
      </div>
    </Card>
  );
}
