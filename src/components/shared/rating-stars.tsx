import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  max?: 5;
  size?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function RatingStars({ value, max = 5, size = 16, readonly, onChange, className }: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        const star = (
          <Star
            style={{ width: size, height: size }}
            className={cn(
              'transition-colors',
              filled ? 'fill-warning text-warning' : 'fill-transparent text-muted-foreground/30'
            )}
          />
        );
        if (readonly || !onChange) return <span key={i}>{star}</span>;
        return (
          <button key={i} type="button" onClick={() => onChange(i + 1)} className="transition-transform hover:scale-110">
            {star}
          </button>
        );
      })}
    </div>
  );
}

export function RatingBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md bg-warning/10 px-1.5 py-0.5 text-xs font-semibold text-warning', className)}>
      <Star className="size-3 fill-warning" />
      {value.toFixed(1)}
    </span>
  );
}
