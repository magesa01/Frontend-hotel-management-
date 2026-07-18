import {
  LayoutDashboard,
  Building2,
  BedDouble,
  DoorOpen,
  CalendarRange,
  UtensilsCrossed,
  ClipboardList,
  Star,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: UserRole[];
  badgeKey?: 'pendingBookings';
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Hotels', to: '/hotels', icon: Building2, roles: ['ADMIN', 'MANAGER'] },
      { label: 'Room Types', to: '/room-types', icon: BedDouble, roles: ['ADMIN', 'MANAGER'] },
      { label: 'Rooms', to: '/rooms', icon: DoorOpen, roles: ['ADMIN', 'MANAGER'] },
      { label: 'Bookings', to: '/bookings', icon: CalendarRange },
    ],
  },
  {
    title: 'Dining',
    items: [
      { label: 'Restaurants', to: '/restaurants', icon: UtensilsCrossed },
      { label: 'Menu Items', to: '/menu-items', icon: ClipboardList, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'Guest',
    items: [
      { label: 'Reviews', to: '/reviews', icon: Star },
      { label: 'Profile', to: '/profile', icon: UserCircle },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);
