import { motion } from 'framer-motion';
import { ArrowLeft, CalendarRange, Check, CheckCircle2, Clock, LogIn, LogOut, Mail, MapPin, User, X, XCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/page-header';
import { ApiState } from '@/components/shared/states';
import { BookingStatusBadge } from '@/components/shared/badges';
import { useBooking, useUpdateBookingStatus } from '@/hooks/use-bookings';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useBreadcrumbLabel } from '@/hooks/use-breadcrumb-label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate, formatDateTime, nightsBetween } from '@/utils/format';
import { toast } from 'sonner';
import type { BookingStatus } from '@/types';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const q = useBooking(id);
  const hotelsQ = useHotelsLookup();
  const statusMut = useUpdateBookingStatus();

  const booking = q.data;
  useBreadcrumbLabel(booking?.reference);

  const hotelName = (hid: string) => hotelsQ.data?.find((h) => h.id === hid)?.name ?? '—';

  const changeStatus = (status: BookingStatus, label: string) => {
    statusMut.mutate({ id: id!, status }, { onSuccess: () => { toast.success(`Booking ${label.toLowerCase()}`); q.refetch(); } });
  };

  const TIMELINE = [
    { icon: Clock, label: 'Booking placed', date: booking?.createdAt, done: true, tone: 'bg-primary/10 text-primary' },
    { icon: CheckCircle2, label: 'Confirmed', date: booking?.status !== 'PENDING' ? booking?.updatedAt : undefined, done: booking && booking.status !== 'PENDING' && booking.status !== 'CANCELLED', tone: 'bg-success/10 text-success' },
    { icon: LogIn, label: 'Checked in', date: booking?.status === 'CHECKED_IN' || booking?.status === 'CHECKED_OUT' ? booking?.updatedAt : undefined, done: booking?.status === 'CHECKED_IN' || booking?.status === 'CHECKED_OUT', tone: 'bg-secondary/10 text-secondary' },
    { icon: LogOut, label: 'Checked out', date: booking?.status === 'CHECKED_OUT' ? booking?.updatedAt : undefined, done: booking?.status === 'CHECKED_OUT', tone: 'bg-muted text-muted-foreground' },
  ] as const;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate('/bookings')}><ArrowLeft className="size-4" /> Back to bookings</Button>
      <ApiState isLoading={q.isLoading} isError={q.isError} onRetry={q.refetch}>
        {booking && (
          <>
            <PageHeader title={booking.reference} description={`${booking.guestName} · ${nightsBetween(booking.checkIn, booking.checkOut)} nights`}
              icon={<CalendarRange className="size-5" />}
              actions={
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <Button asChild variant="outline" size="sm"><Link to={`/bookings/${booking.id}/edit`}>Edit</Link></Button>
                </div>
              }
            />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Guest info */}
                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-semibold">Guest information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow icon={User} label="Guest name" value={booking.guestName} />
                    <InfoRow icon={Mail} label="Email" value={booking.guestEmail} />
                    <InfoRow icon={MapPin} label="Hotel" value={hotelName(booking.hotelId)} />
                    <InfoRow icon={CalendarRange} label="Guests" value={`${booking.guests} guest(s)`} />
                  </div>
                  {booking.notes && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                      <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
                      <p className="mt-1 text-sm">{booking.notes}</p>
                    </div>
                  )}
                </Card>

                {/* Stay details */}
                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-semibold">Stay details</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <InfoBox label="Check-in" value={formatDate(booking.checkIn)} />
                    <InfoBox label="Check-out" value={formatDate(booking.checkOut)} />
                    <InfoBox label="Nights" value={`${booking.nights}`} />
                    <InfoBox label="Total" value={formatCurrency(booking.totalAmount)} highlight />
                  </div>
                </Card>

                {/* Timeline */}
                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-semibold">Booking timeline</h3>
                  <div className="space-y-1">
                    {TIMELINE.map((step, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`grid size-9 place-items-center rounded-full ${step.done ? step.tone : 'bg-muted text-muted-foreground/40'}`}>
                            <step.icon className="size-4" />
                          </div>
                          {i < TIMELINE.length - 1 && <div className={`my-1 w-0.5 flex-1 ${step.done ? 'bg-primary/30' : 'bg-border'}`} style={{ minHeight: 24 }} />}
                        </div>
                        <div className="pb-4">
                          <p className={`text-sm font-medium ${step.done ? '' : 'text-muted-foreground/50'}`}>{step.label}</p>
                          {step.date && <p className="text-2xs text-muted-foreground">{formatDateTime(step.date)}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Actions sidebar */}
              <div className="space-y-4">
                <Card className="p-5">
                  <h3 className="mb-3 font-display text-base font-semibold">Actions</h3>
                  <div className="space-y-2">
                    {booking.status === 'PENDING' && (
                      <Button className="w-full gap-2" onClick={() => changeStatus('CONFIRMED', 'confirmed')} disabled={statusMut.isPending}><Check className="size-4" /> Confirm booking</Button>
                    )}
                    {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                      <Button variant="success" className="w-full gap-2" onClick={() => changeStatus('CHECKED_IN', 'checked in')} disabled={statusMut.isPending}><LogIn className="size-4" /> Check in</Button>
                    )}
                    {booking.status === 'CHECKED_IN' && (
                      <Button variant="secondary" className="w-full gap-2" onClick={() => changeStatus('CHECKED_OUT', 'checked out')} disabled={statusMut.isPending}><LogOut className="size-4" /> Check out</Button>
                    )}
                    {booking.status !== 'CANCELLED' && booking.status !== 'CHECKED_OUT' && (
                      <Button variant="outline" className="w-full gap-2 border-danger/30 text-danger hover:bg-danger/10" onClick={() => changeStatus('CANCELLED', 'cancelled')} disabled={statusMut.isPending}><XCircle className="size-4" /> Cancel booking</Button>
                    )}
                    {(booking.status === 'CANCELLED' || booking.status === 'CHECKED_OUT') && (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                        {booking.status === 'CANCELLED' ? <X className="size-4" /> : <Check className="size-4" />}
                        This booking is {booking.status.toLowerCase().replace('_', ' ')}.
                      </div>
                    )}
                  </div>
                </Card>
                <Card className="p-5">
                  <h3 className="mb-2 font-display text-base font-semibold">Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Rate / night</dt><dd className="font-semibold">{formatCurrency(booking.totalAmount / booking.nights)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Nights</dt><dd className="font-semibold">{booking.nights}</dd></div>
                    <div className="flex justify-between border-t border-border pt-2"><dt className="font-medium">Total</dt><dd className="font-bold text-primary">{formatCurrency(booking.totalAmount)}</dd></div>
                  </dl>
                </Card>
              </div>
            </div>
          </>
        )}
      </ApiState>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></div>
      <div className="min-w-0"><p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold">{value}</p></div>
    </div>
  );
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-primary/5' : 'bg-muted/40'}`}>
      <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-bold ${highlight ? 'text-primary' : ''}`}>{value}</p>
    </div>
  );
}