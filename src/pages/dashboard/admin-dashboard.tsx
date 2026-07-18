import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarRange,
  ClipboardList,
  DollarSign,
  DoorOpen,
  LogIn,
  LogOut,
  Plus,
  ShieldPlus,
  Star,
  UtensilsCrossed,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ApiState } from '@/components/shared/states';
import { RatingStars } from '@/components/shared/rating-stars';
import { useDashboardStats, useOccupancyTrend, useRatingDistribution, useRevenueTrend, useBookingSources } from '@/hooks/use-dashboard';
import { useActivities } from '@/hooks/use-users';
import { useReviews } from '@/hooks/resource-hooks';
import { useHotelsLookup } from '@/hooks/use-relations';
import { formatCompact, formatCurrency, timeAgo } from '@/utils/format';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ACTIVITY_ICON = {
  BOOKING: CalendarRange,
  CHECK_IN: LogIn,
  CHECK_OUT: LogOut,
  REVIEW: Star,
  HOTEL: Building2,
  ROOM: DoorOpen,
  CANCEL: Activity,
} as const;

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-5))'];

const ACTIVITY_TONE: Record<string, string> = {
  BOOKING: 'bg-primary/10 text-primary',
  CHECK_IN: 'bg-success/10 text-success',
  CHECK_OUT: 'bg-secondary/10 text-secondary',
  REVIEW: 'bg-warning/10 text-warning',
  HOTEL: 'bg-primary/10 text-primary',
  ROOM: 'bg-secondary/10 text-secondary',
  CANCEL: 'bg-danger/10 text-danger',
};

export function AdminDashboard() {
  const statsQ = useDashboardStats();
  const occupancyQ = useOccupancyTrend();
  const revenueQ = useRevenueTrend();
  const sourcesQ = useBookingSources();
  const ratingsQ = useRatingDistribution();
  const activitiesQ = useActivities(5);
  const reviewsQ = useReviews();
  const hotelsQ = useHotelsLookup();

  const stats = statsQ.data;
  const occupancyData = occupancyQ.data ?? [];
  const revenueData = revenueQ.data ?? [];
  const sourceData = sourcesQ.data ?? [];
  const ratingData = ratingsQ.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Real-time performance across every hotel and restaurant"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/managers">
              <Button variant="outline" size="sm" className="gap-2"><ShieldPlus className="size-4" /> New admin</Button>
            </Link>
            <Link to="/hotels/new">
              <Button size="sm" className="gap-2"><Plus className="size-4" /> New hotel</Button>
            </Link>
          </div>
        }
      />

      <ApiState isLoading={statsQ.isLoading} isError={statsQ.isError} onRetry={statsQ.refetch}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard index={0} label="Total Hotels" value={stats?.totalHotels ?? 0} icon={Building2} accent="primary" trend={{ value: 12, positive: true }} />
          <StatCard index={1} label="Total Rooms" value={stats?.totalRooms ?? 0} icon={DoorOpen} accent="secondary" trend={{ value: 8, positive: true }} />
          <StatCard index={2} label="Available" value={stats?.availableRooms ?? 0} icon={BedDouble} accent="success" />
          <StatCard index={3} label="Occupied" value={stats?.occupiedRooms ?? 0} icon={BedDouble} accent="warning" />
          <StatCard index={4} label="Bookings" value={stats?.bookings ?? 0} icon={CalendarRange} accent="primary" trend={{ value: 18, positive: true }} />
          <StatCard index={5} label="Pending" value={stats?.pendingBookings ?? 0} icon={Activity} accent="warning" />
          <StatCard index={6} label="Checked-in Guests" value={stats?.checkedInGuests ?? 0} icon={Users} accent="secondary" />
          <StatCard index={7} label="Revenue" value={formatCompact(stats?.revenue ?? 0)} icon={DollarSign} accent="success" trend={{ value: 23, positive: true }} />
          <StatCard index={8} label="Restaurants" value={stats?.restaurants ?? 0} icon={UtensilsCrossed} accent="primary" />
          <StatCard index={9} label="Menu Items" value={stats?.menuItems ?? 0} icon={ClipboardList} accent="secondary" />
          <StatCard index={10} label="Reviews" value={stats?.reviews ?? 0} icon={Star} accent="warning" />
          <StatCard index={11} label="Room Types" value={stats?.totalRoomTypes ?? 0} icon={BedDouble} accent="primary" />
        </div>
      </ApiState>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Revenue trend</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue across all properties</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              <ArrowUpRight className="size-3" /> 23%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Booking sources</h3>
            <p className="text-xs text-muted-foreground">Where guests book from</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {sourceData.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="flex-1 text-muted-foreground">{s.label}</span>
                <span className="font-semibold">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Occupancy this week</h3>
            <p className="text-xs text-muted-foreground">Daily occupancy vs available rooms</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="occupancy" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="available" fill="hsl(var(--muted-foreground) / 0.3)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold">Recent activity</h3>
          <div className="space-y-1">
            {activitiesQ.data?.map((act: { id: string; type: string; title: string; description: string; actor: string; timestamp: string }, i: number) => {
              const Icon = ACTIVITY_ICON[act.type as keyof typeof ACTIVITY_ICON] ?? Activity;
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
                >
                  <div className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg', ACTIVITY_TONE[act.type] ?? 'bg-muted text-muted-foreground')}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{act.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{act.description}</p>
                    <p className="mt-0.5 text-2xs text-muted-foreground/70">{timeAgo(act.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold">Properties</h3>
            <p className="text-xs text-muted-foreground">Every hotel on the platform</p>
          </div>
          <Link to="/admin/properties" className="text-xs font-medium text-primary hover:underline">Manage all</Link>
        </div>
        <ApiState isLoading={hotelsQ.isLoading} isError={hotelsQ.isError} onRetry={hotelsQ.refetch} empty={hotelsQ.data?.length === 0}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hotelsQ.data?.map((hotel, i) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/hotels/${hotel.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{hotel.name}</p>
                    <p className="text-2xs text-muted-foreground">View details</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </ApiState>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Latest reviews</h3>
            <Link to="/reviews" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <ApiState isLoading={reviewsQ.isLoading} isError={reviewsQ.isError} onRetry={reviewsQ.refetch} empty={reviewsQ.data?.items.length === 0}>
            <div className="space-y-3">
              {reviewsQ.data?.items.slice(0, 4).map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-lg border border-border/60 p-3"
                >
                  <Avatar className="size-9 border border-border">
                    <AvatarImage src={review.authorAvatarUrl} />
                    <AvatarFallback className="text-2xs font-semibold">{review.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{review.authorName}</p>
                      <RatingStars value={review.rating} size={12} readonly />
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                    <p className="mt-1 text-2xs text-muted-foreground/70">{timeAgo(review.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ApiState>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold">Rating distribution</h3>
          <div className="space-y-3">
            {ratingData.map((r) => {
              const max = Math.max(...ratingData.map((x) => x.count), 1);
              return (
                <div key={r.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="size-3 fill-warning text-warning" /> {r.label}
                    </span>
                    <span className="text-muted-foreground">{r.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(r.count / max) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-warning to-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 p-4 text-center">
            <p className="text-3xl font-bold text-gradient">4.8</p>
            <p className="mt-1 text-xs text-muted-foreground">Average rating across properties</p>
            <div className="mt-2 flex justify-center">
              <RatingStars value={4.8} size={14} readonly />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}