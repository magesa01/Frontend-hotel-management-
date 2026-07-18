import { motion } from 'framer-motion';
import { MapPin, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/page-header';
import { ApiState } from '@/components/shared/states';
import { BookingStatusBadge } from '@/components/shared/badges';
import { RatingStars } from '@/components/shared/rating-stars';
import { useReviews } from '@/hooks/resource-hooks';
import { useUserBookings } from '@/hooks/use-bookings';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency, formatDate, timeAgo } from '@/utils/format';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Review } from '@/types';

export function CustomerDashboard() {
  const { user } = useAuth();

  const bookingsQ = useUserBookings(user?.id);
  const allReviewsQ = useReviews();
  const hotelsQ = useHotelsLookup();

  const bookings = bookingsQ.data ?? [];
  const upcoming = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'CHECKED_IN');
  const past = bookings.filter((b) => b.status === 'CHECKED_OUT' || b.status === 'CANCELLED');

  const myReviews = (allReviewsQ.data?.items ?? [])
    .filter((r: Review) => r.userId === user?.id)
    .slice(0, 3);

  const hotelName = (id: string) => hotelsQ.data?.find((h) => h.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Here's what's happening with your stays"
        actions={
          <Link to="/bookings/new">
            <Button size="sm" className="gap-2"><Plus className="size-4" /> Book a stay</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Upcoming stays</p>
          <p className="mt-1 text-2xl font-bold">{upcoming.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Past stays</p>
          <p className="mt-1 text-2xl font-bold">{past.length}</p>
        </Card>
        <Card className="p-4 col-span-2 lg:col-span-1">
          <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Total spent</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {formatCurrency(bookings.reduce((sum, b) => sum + b.totalAmount, 0))}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Upcoming stays</h3>
            <Link to="/bookings" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <ApiState isLoading={bookingsQ.isLoading} isError={bookingsQ.isError} onRetry={bookingsQ.refetch} empty={upcoming.length === 0}>
            <div className="space-y-2">
              {upcoming.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/bookings/${b.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                        <MapPin className="size-3.5 shrink-0 text-muted-foreground" /> {hotelName(b.hotelId)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {formatCurrency(b.totalAmount)}
                      </p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </ApiState>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">My reviews</h3>
            <Link to="/reviews" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <ApiState isLoading={allReviewsQ.isLoading} isError={allReviewsQ.isError} onRetry={allReviewsQ.refetch} empty={myReviews.length === 0}>
            <div className="space-y-3">
              {myReviews.map((review: Review, i: number) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-border/60 p-3"
                >
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-warning text-warning" />
                    <RatingStars value={review.rating} size={11} readonly />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                  <p className="mt-1 text-2xs text-muted-foreground/70">{timeAgo(review.createdAt)}</p>
                </motion.div>
              ))}
            </div>
          </ApiState>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-4 font-display text-base font-semibold">Past stays</h3>
        <ApiState isLoading={bookingsQ.isLoading} isError={bookingsQ.isError} onRetry={bookingsQ.refetch} empty={past.length === 0}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/bookings/${b.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{hotelName(b.hotelId)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(b.checkIn)}</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </Link>
              </motion.div>
            ))}
          </div>
        </ApiState>
      </Card>
    </div>
  );
}