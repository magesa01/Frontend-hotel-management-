import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive?: boolean };
  accent?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'chart';
  index?: number;
}

const ACCENT_MAP: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  chart: 'bg-chart-4/10 text-chart-4',
};

export function StatCard({ label, value, icon: Icon, trend, accent = 'primary', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden p-5 shadow-soft-sm transition-shadow hover:shadow-soft-md">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
          <div className={cn('grid size-10 shrink-0 place-items-center rounded-xl', ACCENT_MAP[accent])}>
            <Icon className="size-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold',
                trend.positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              )}
            >
              {trend.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
        <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
      </Card>
    </motion.div>
  );
}
