import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Hotel, LogOut, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_SECTIONS } from './nav-config';
import { useAuth } from '@/contexts/auth-context';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { cn } from '@/lib/utils';
import type { NavItem } from './nav-config';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const { data: stats } = useDashboardStats();
  const location = useLocation();

  const filtered = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || hasRole(...item.roles)),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 264 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      >
        <SidebarBrand collapsed={collapsed} />
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
          {filtered.map((section) => (
            <div key={section.title} className="mb-5">
              {!collapsed && (
                <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <SidebarLink
                    key={item.to}
                    item={item}
                    collapsed={collapsed}
                    active={location.pathname.startsWith(item.to)}
                    badge={item.badgeKey ? stats?.[item.badgeKey] : undefined}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <SidebarFooter collapsed={collapsed} userName={user?.name} onLogout={logout} />
        <CollapseToggle collapsed={collapsed} onToggle={onToggleCollapse} />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed left-0 top-0 z-50 flex h-screen w-[264px] flex-col border-r border-sidebar-border bg-sidebar lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
              <SidebarBrand collapsed={false} compact />
              <button onClick={onCloseMobile} className="rounded-lg p-2 hover:bg-sidebar-accent">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-2">
              {filtered.map((section) => (
                <div key={section.title} className="mb-5">
                  <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </p>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          onClick={onCloseMobile}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-soft-sm'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent'
                            )
                          }
                        >
                          <item.icon className="size-[18px] shrink-0" />
                          <span>{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <SidebarFooter collapsed={false} userName={user?.name} onLogout={logout} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarBrand({ collapsed, compact }: { collapsed: boolean; compact?: boolean }) {
  return (
    <div className={cn('flex h-16 items-center gap-3 border-b border-sidebar-border px-4', compact && 'border-0 px-0')}>
      <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary-600 text-primary-foreground shadow-glow">
        <Hotel className="size-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="font-display text-base font-bold tracking-tight text-sidebar-foreground">Aurelia HMS</p>
          <p className="text-2xs text-muted-foreground">Hotel Management</p>
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  item,
  collapsed,
  active,
  badge,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  badge?: number;
}) {
  return (
    <li>
      <NavLink
        to={item.to}
        title={collapsed ? item.label : undefined}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
          active
            ? 'bg-primary text-primary-foreground shadow-soft-sm'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <item.icon className="size-[18px] shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        {!collapsed && badge != null && badge > 0 && (
          <span className="rounded-full bg-warning px-1.5 py-0.5 text-2xs font-bold text-warning-foreground">
            {badge}
          </span>
        )}
      </NavLink>
    </li>
  );
}

function SidebarFooter({ collapsed, userName, onLogout }: { collapsed: boolean; userName?: string; onLogout: () => void }) {
  return (
    <div className="border-t border-sidebar-border p-3">
      {!collapsed && (
        <p className="truncate px-3 pb-2 text-xs text-muted-foreground">Signed in as {userName}</p>
      )}
      <button
        onClick={onLogout}
        title={collapsed ? 'Sign out' : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger'
        )}
      >
        <LogOut className="size-[18px] shrink-0" />
        {!collapsed && <span>Sign out</span>}
      </button>
    </div>
  );
}

function CollapseToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="absolute -right-3 top-20 z-10 grid size-6 place-items-center rounded-full border border-border bg-card shadow-soft-sm transition-colors hover:bg-accent"
      aria-label="Toggle sidebar"
    >
      <ChevronLeft className={cn('size-3.5 transition-transform', collapsed && 'rotate-180')} />
    </button>
  );
}
