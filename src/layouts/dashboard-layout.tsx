import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CommandPalette } from './command-palette';
import { useKeyCombo } from '@/hooks/use-key-combo';
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useKeyCombo('cmd+k', () => setSearchOpen((p) => !p));

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <BreadcrumbProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={() => setCollapsed((p) => !p)}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div
          className="flex min-h-screen flex-col transition-[padding] duration-300"
          style={{ paddingLeft: undefined }}
        >
          <div className="lg:pl-[var(--sidebar-w)]" style={{ ['--sidebar-w' as string]: collapsed ? '76px' : '264px' }}>
            <Topbar onOpenMobile={() => setMobileOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
            <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
                    <Outlet />
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </BreadcrumbProvider>
  );
}