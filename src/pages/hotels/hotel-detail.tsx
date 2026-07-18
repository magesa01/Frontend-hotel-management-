import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Pencil, Star, BedDouble, CalendarRange } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiState, EmptyState } from '@/components/shared/states';
import { RatingBadge } from '@/components/shared/rating-stars';
import { hotelHooks } from '@/hooks/resource-hooks';
import { useRoomTypesByHotel, useRestaurantsByHotel } from '@/hooks/use-relations';
import { useHotelBookings } from '@/hooks/use-bookings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/format';
import { BookingStatusBadge } from '@/components/shared/badges';

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useDetail } = hotelHooks;
  const q = useDetail(id);
  const roomTypesQ = useRoomTypesByHotel(id);
  const restaurantsQ = useRestaurantsByHotel(id);
  const bookingsQ = useHotelBookings(id);

  const hotel = q.data;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate('/hotels')}>
        <ArrowLeft className="size-4" /> Back to hotels
      </Button>

      <ApiState isLoading={q.isLoading} isError={q.isError} error={q.error} onRetry={q.refetch}>
        {hotel && (
          <>
            <div className="relative mb-6 overflow-hidden rounded-2xl">
              <img src={hotel.imageUrl} alt={hotel.name} className="h-64 w-full object-cover lg:h-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">{hotel.name}</h1>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-primary-foreground/80">
                      <MapPin className="size-4" /> {hotel.location}, {hotel.city}, {hotel.country}
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <RatingBadge value={hotel.rating} className="bg-white/20 text-white border-white/30" />
                    <Button asChild variant="secondary" size="sm" className="gap-2">
                      <Link to={`/hotels/${hotel.id}/edit`}><Pencil className="size-4" /> Edit</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rooms">Room Types</TabsTrigger>
                    <TabsTrigger value="dining">Dining</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <Card className="p-5">
                      <h3 className="font-display text-base font-semibold">About this hotel</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hotel.description}</p>
                      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <Detail label="Rating" value={`${hotel.rating} / 5`} />
                        <Detail label="City" value={hotel.city} />
                        <Detail label="Country" value={hotel.country} />
                        <Detail label="Added" value={formatDate(hotel.createdAt)} />
                      </dl>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rooms" className="mt-4">
                    <ApiState isLoading={roomTypesQ.isLoading} isError={roomTypesQ.isError} onRetry={roomTypesQ.refetch} empty={roomTypesQ.data?.length === 0} emptyTitle="No room types" emptyDescription="Add room types to this hotel.">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {roomTypesQ.data?.map((rt, i) => (
                          <motion.div key={rt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className="flex overflow-hidden p-0">
                              <img src={rt.imageUrl} alt="" className="w-28 shrink-0 object-cover" />
                              <div className="p-3">
                                <p className="text-sm font-semibold">{rt.name}</p>
                                <p className="text-2xs text-muted-foreground">{rt.bedType} · {rt.capacity} guests · {rt.sizeSqm}m²</p>
                                <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(rt.price)}<span className="text-2xs font-normal text-muted-foreground">/night</span></p>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </ApiState>
                  </TabsContent>

                  <TabsContent value="dining" className="mt-4">
                    <ApiState isLoading={restaurantsQ.isLoading} isError={restaurantsQ.isError} onRetry={restaurantsQ.refetch} empty={restaurantsQ.data?.length === 0} emptyTitle="No restaurants" emptyDescription="Add dining options to this hotel.">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {restaurantsQ.data?.map((r, i) => (
                          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className="overflow-hidden p-0">
                              <img src={r.imageUrl} alt="" className="aspect-video w-full object-cover" />
                              <div className="p-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold">{r.name}</p>
                                  <RatingBadge value={r.rating} />
                                </div>
                                <p className="text-2xs text-muted-foreground">{r.cuisine} · {r.openingHours}</p>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </ApiState>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-4">
                    <Card className="p-5">
                      <h3 className="mb-3 font-display text-base font-semibold">Guest reviews</h3>
                      <EmptyState title="Reviews are managed centrally" description="Visit the Reviews page to see all feedback for this property." icon={<Star className="size-7 text-muted-foreground" />} action={<Button asChild variant="outline" size="sm"><Link to="/reviews">Go to reviews</Link></Button>} />
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar — bookings */}
              <div>
                <Card className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarRange className="size-4 text-primary" />
                    <h3 className="font-display text-base font-semibold">Recent bookings</h3>
                  </div>
                  <ApiState isLoading={bookingsQ.isLoading} isError={bookingsQ.isError} onRetry={bookingsQ.refetch} empty={bookingsQ.data?.length === 0} emptyTitle="No bookings yet">
                    <div className="space-y-2">
                      {bookingsQ.data?.slice(0, 5).map((b) => (
                        <Link key={b.id} to={`/bookings/${b.id}`} className="block rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/30 hover:bg-accent/40">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold">{b.reference}</p>
                            <BookingStatusBadge status={b.status} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{b.guestName}</p>
                          <p className="mt-0.5 text-2xs text-muted-foreground/70">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                        </Link>
                      ))}
                    </div>
                  </ApiState>
                </Card>

                <Card className="mt-4 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <BedDouble className="size-4 text-secondary" />
                    <h3 className="font-display text-base font-semibold">Quick stats</h3>
                  </div>
                  <dl className="space-y-2">
                    <Detail label="Room types" value={`${roomTypesQ.data?.length ?? 0}`} />
                    <Detail label="Restaurants" value={`${restaurantsQ.data?.length ?? 0}`} />
                    <Detail label="Bookings" value={`${bookingsQ.data?.length ?? 0}`} />
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
    </div>
  );
}
