import { cn } from '@/lib/utils';
import type { BookingStatus, MenuCategory, RoomStatus } from '@/types';

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';

const TONE_CLASSES: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  muted: 'bg-muted text-muted-foreground border-border',
};

export function Badge({ tone = 'muted', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const ROOM_STATUS: Record<RoomStatus, { tone: Tone; label: string }> = {
  AVAILABLE: { tone: 'success', label: 'Available' },
  OCCUPIED: { tone: 'danger', label: 'Occupied' },
};

const BOOKING_STATUS: Record<BookingStatus, { tone: Tone; label: string }> = {
  PENDING: { tone: 'warning', label: 'Pending' },
  CONFIRMED: { tone: 'primary', label: 'Confirmed' },
  CANCELLED: { tone: 'danger', label: 'Cancelled' },
  CHECKED_IN: { tone: 'secondary', label: 'Checked In' },
  CHECKED_OUT: { tone: 'muted', label: 'Checked Out' },
};

const MENU_CATEGORY: Record<MenuCategory, { tone: Tone; label: string }> = {
  BREAKFAST: { tone: 'success', label: 'Breakfast' },
  LUNCH: { tone: 'primary', label: 'Lunch' },
  DINNER: { tone: 'secondary', label: 'Dinner' },
  DRINK: { tone: 'primary', label: 'Drink' },
  SNACK: { tone: 'muted', label: 'Snack' },
};

const ROLE_CONFIG: Record<string, { tone: Tone; label: string }> = {
  SUPER_ADMIN: { tone: 'danger', label: 'Super Admin' },
  HOTEL_ADMIN: { tone: 'primary', label: 'Hotel Admin' },
  RESTAURANT_ADMIN: { tone: 'secondary', label: 'Restaurant Admin' },
  CUSTOMER: { tone: 'muted', label: 'Customer' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const cfg = ROOM_STATUS[status];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = BOOKING_STATUS[status];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

export function MenuCategoryBadge({ category }: { category: MenuCategory }) {
  const cfg = MENU_CATEGORY[category];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] ?? { tone: 'muted' as Tone, label: role };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}