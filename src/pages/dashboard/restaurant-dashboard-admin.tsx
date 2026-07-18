import { motion } from 'framer-motion';
import { Building2, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ApiState } from '@/components/shared/states';
import { RatingStars } from '@/components/shared/rating-stars';
import { useReviews } from '@/hooks/resource-hooks';
import { menuItemService } from '@/services/menu-item.service';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency, timeAgo } from '@/utils/format';
import type { MenuItem, Review } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RestaurantAdminDashboard() {
  const { user } = useAuth();
  const restaurantId = user?.assignedRestaurantId;

  const menuItemsQ = useQuery({
    queryKey: ['menuItems', 'restaurant', restaurantId],
    queryFn: () => menuItemService.listByRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });
  const allReviewsQ = useReviews();

  if (!restaurantId) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-warning/10 text-warning">
            <UtensilsCrossed className="size-6" />
          </div>
          <h2 className="font-display text-lg font-semibold">No restaurant assigned yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven't been assigned to a restaurant. Contact your Super Admin to get access.
          </p>
        </Card>
      </div>
    );
  }

  const menuItems = menuItemsQ.data ?? [];
  const available = menuItems.filter((m) => m.isAvailable).length;
  const unavailable = menuItems.length - available;
  const categories = new Set(menuItems.map((m) => m.category)).size;

  // Reviews hazina uhusiano na restaurant kwenye database (zinahusiana na hotel pekee),
  // kwa hiyo hatuwezi kuzichuja kwa restaurantId - tunaonyesha empty kwa sasa.
  const restaurantReviews: Review[] = [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My restaurant"
        description="Day-to-day operations for your restaurant"
        actions={
          <Link to="/menu-items/new">
            <Button size="sm" className="gap-2"><UtensilsCrossed className="size-4" /> Add item</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Menu items" value={menuItems.length} icon={ClipboardList} accent="primary" />
        <StatCard index={1} label="Available" value={available} icon={UtensilsCrossed} accent="success" />
        <StatCard index={2} label="Unavailable" value={unavailable} icon={UtensilsCrossed} accent="warning" />
        <StatCard index={3} label="Categories" value={categories} icon={Building2} accent="secondary" />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold">Menu overview</h3>
            <p className="text-xs text-muted-foreground">All items on your menu</p>
          </div>
          <Link to="/menu-items" className="text-xs font-medium text-primary hover:underline">Manage menu</Link>
        </div>
        <ApiState isLoading={menuItemsQ.isLoading} isError={menuItemsQ.isError} onRetry={menuItemsQ.refetch} empty={menuItems.length === 0}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.slice(0, 9).map((item: MenuItem, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{formatCurrency(item.price)}</p>
                  <p className={cn('text-2xs', item.isAvailable ? 'text-success' : 'text-danger')}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ApiState>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Recent reviews</h3>
          <Link to="/reviews" className="text-xs font-medium text-primary hover:underline">View all</Link>
        </div>
        <ApiState isLoading={allReviewsQ.isLoading} isError={allReviewsQ.isError} onRetry={allReviewsQ.refetch} empty={restaurantReviews.length === 0}>
          <div className="grid gap-3 sm:grid-cols-2">
            {restaurantReviews.map((review: Review, i: number) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{review.authorName}</p>
                  <RatingStars value={review.rating} size={12} readonly />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                <p className="mt-1 text-2xs text-muted-foreground/70">{timeAgo(review.createdAt)}</p>
              </motion.div>
            ))}
          </div>
        </ApiState>
      </Card>
    </div>
  );
}