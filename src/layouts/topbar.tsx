import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Check,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserCircle,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useBreadcrumbContext } from '@/contexts/breadcrumb-context';
import { initials } from '@/utils/format';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  hotels: 'Hotels',
  'room-types': 'Room Types',
  rooms: 'Rooms',
  bookings: 'Bookings',
  restaurants: 'Restaurants',
  'menu-items': 'Menu Items',
  reviews: 'Reviews',
  profile: 'Profile',
  new: 'New',
  edit: 'Edit',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NOTIFICATIONS = [
  { id: 1, title: 'New booking', body: 'AUR-2045 · Alpine Lodge', time: '12m ago', unread: true, tone: 'primary' },
  { id: 2, title: 'Guest checked in', body: 'Aiko Tanaka · Riviera', time: '1h ago', unread: true, tone: 'success' },
  { id: 3, title: 'Review awaiting', body: 'Manhattan Towers · 4★', time: '3h ago', unread: true, tone: 'warning' },
  { id: 4, title: 'Room maintenance', body: 'G02 · Alpine Lodge', time: '1d ago', unread: false, tone: 'danger' },
] as const;

interface TopbarProps {
  onOpenMobile: () => void;
  onOpenSearch: () => void;
}

export function Topbar({ onOpenMobile, onOpenSearch }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { label: dynamicLabel } = useBreadcrumbContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  const crumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((seg) => {
      if (UUID_RE.test(seg)) {
        return dynamicLabel ?? 'Details';
      }
      return ROUTE_LABELS[seg] ?? seg;
    });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl lg:px-6">
      <button onClick={onOpenMobile} className="grid size-9 place-items-center rounded-lg hover:bg-accent lg:hidden">
        <Menu className="size-5" />
      </button>

      <nav className="hidden items-center gap-1.5 text-sm md:flex">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          Home
        </Link>
        {crumbs.map((crumb, i) => (
          <Fragment key={i}>
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            <span className={cn(i === crumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              {crumb}
            </span>
          </Fragment>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className="group flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent w-56 lg:w-72"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-2xs font-medium sm:inline">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={toggleTheme}
          className="grid size-9 place-items-center rounded-lg border border-border bg-background transition-colors hover:bg-accent"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'light' ? (
              <motion.span key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <Moon className="size-4" />
              </motion.span>
            ) : (
              <motion.span key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Sun className="size-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative grid size-9 place-items-center rounded-lg border border-border bg-background transition-colors hover:bg-accent" aria-label="Notifications">
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-danger text-2xs font-bold text-danger-foreground">
                  {unread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <Badge variant="secondary" className="text-2xs">{unread} new</Badge>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-accent/50 transition-colors">
                  <span className={cn('mt-1.5 size-2 shrink-0 rounded-full',
                    n.tone === 'primary' && 'bg-primary',
                    n.tone === 'success' && 'bg-success',
                    n.tone === 'warning' && 'bg-warning',
                    n.tone === 'danger' && 'bg-danger',
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-0.5 text-2xs text-muted-foreground/70">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-2.5 text-xs font-medium text-primary hover:bg-primary/5">
              <Check className="size-3.5" /> Mark all as read
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent">
              <Avatar className="size-8 border border-border">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-2xs font-semibold text-primary">
                  {user ? initials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-xs font-semibold">{user?.name}</p>
                <p className="text-2xs text-muted-foreground">{user?.role.toLowerCase()}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-2xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <UserCircle className="mr-2 size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Settings className="mr-2 size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger focus:text-danger" onClick={logout}>
              <LogOut className="mr-2 size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}