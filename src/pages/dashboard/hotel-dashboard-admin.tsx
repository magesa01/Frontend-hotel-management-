import { motion } from 'framer-motion';
import { BedDouble, Building2, CalendarRange, ClipboardList, DoorOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ApiState } from '@/components/shared/states';
import { RatingStars } from '@/components/shared/rating-stars';
import { BookingStatusBadge } from '@/components/shared/badges';
import { useHotelBookings } from '@/hooks/use-bookings';
import { useReviews } from '@/hooks/resource-hooks';
import { roomService } from '@/services/room.service';
import { useAuth } from '@/contexts/auth-context';
import { formatDate, timeAgo } from '@/utils/format';
import type { Booking, Review } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function HotelAdminDashboard() {
  const { user } = useAuth();
  const hotelId = user?.assignedHotelId;

  const bookingsQ = useHotelBookings(hotelId);
  const roomsQ = useQuery({
    queryKey: ['rooms', 'hotel', hotelId],
    queryFn: () => roomService.listByHotel(hotelId!),
    enabled: !!hotelId,
  });
  const allReviewsQ = useReviews();

  if (!hotelId) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-warning/10 text-warning">
            <Building2 className="size-6" />
          </div>
          <h2 className="font-display text-lg font-semibold">No hotel assigned yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven't been assigned to a hotel. Contact your Super Admin to get access.
          </p>
        </Card>
      </div>
    );
  }

  const rooms = roomsQ.data ?? [];
  const statusCounts = {
    AVAILABLE: rooms.filter((r) => r.status === 'AVAILABLE').length,
    OCCUPIED: rooms.filter((r) => r.status === 'OCCUPIED').length,
  };
  const occupancyRate = rooms.length ? Math.round((statusCounts.OCCUPIED / rooms.length) * 100) : 0;

  const bookings = (bookingsQ.data ?? []).slice(0, 5);
  const hotelReviews = (allReviewsQ.data?.items ?? [])
    .filter((r: Review) => r.hotelId === hotelId)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My hotel"
        description="Day-to-day operations for your hotel"
        actions={
          <Link to="/bookings/new">
            <Button size="sm" className="gap-2"><CalendarRange className="size-4" /> New booking</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Occupancy rate" value={`${occupancyRate}%`} icon={DoorOpen} accent="primary" />
        <StatCard index={1} label="Available rooms" value={statusCounts.AVAILABLE} icon={BedDouble} accent="success" />
        <StatCard index={2} label="Occupied rooms" value={statusCounts.OCCUPIED} icon={BedDouble} accent="warning" />
        <StatCard index={3} label="Total rooms" value={rooms.length} icon={ClipboardList} accent="secondary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Upcoming check-ins</h3>
            <Link to="/bookings" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <ApiState isLoading={bookingsQ.isLoading} isError={bookingsQ.isError} onRetry={bookingsQ.refetch} empty={bookings.length === 0}>
            <div className="space-y-2">
              {bookings.map((b: Booking, i: number) => (
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
                      <p className="truncate text-sm font-semibold">{b.guestName} · {b.reference}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.guests} guest(s)
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
          <h3 className="mb-4 font-display text-base font-semibold">Room status</h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className={cn('flex items-center gap-2 font-medium',
                  status === 'AVAILABLE' && 'text-success',
                  status === 'OCCUPIED' && 'text-warning',
                )}>
                  <span className={cn('size-2 rounded-full',
                    status === 'AVAILABLE' && 'bg-success',
                    status === 'OCCUPIED' && 'bg-warning',
                  )} />
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
          <Link to="/rooms" className="mt-4 block text-center text-xs font-medium text-primary hover:underline">
            Manage rooms
          </Link>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Recent reviews</h3>
          <Link to="/reviews" className="text-xs font-medium text-primary hover:underline">View all</Link>
        </div>
        <ApiState isLoading={allReviewsQ.isLoading} isError={allReviewsQ.isError} onRetry={allReviewsQ.refetch} empty={hotelReviews.length === 0}>
          <div className="grid gap-3 sm:grid-cols-2">
            {hotelReviews.map((review: Review, i: number) => (
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