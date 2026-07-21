import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  UtensilsCrossed,
  BedDouble,
  Star,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { hotelService } from '@/services/hotel.service';
import { roomTypeService } from '@/services/room-type.service';
import { menuItemService } from '@/services/menu-item.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

export default function LandingPage() {
  const hotelsQ = useQuery({ queryKey: ['public', 'hotels'], queryFn: () => hotelService.list() });
  const roomTypesQ = useQuery({ queryKey: ['public', 'roomTypes'], queryFn: () => roomTypeService.list() });
  const menuItemsQ = useQuery({ queryKey: ['public', 'menuItems'], queryFn: () => menuItemService.list() });

  const hotels = (hotelsQ.data?.items ?? []).slice(0, 3);
  const roomTypes = (roomTypesQ.data?.items ?? []).slice(0, 3);
  const menuItems = (menuItemsQ.data?.items ?? []).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none">Aurelia HMS</p>
              <p className="text-2xs text-muted-foreground">Hotel Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" size="sm">Log in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Manage hotels, dining, and bookings — all in one place
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Aurelia HMS brings together room bookings, restaurant management, and guest reviews
            into a single, effortless platform for hotel operators and their guests.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gap-2">Create an account <ArrowRight className="size-4" /></Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">I already have an account</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature overview */}
      <section className="border-y border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="p-6">
              <div className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <CalendarCheck className="size-5" />
              </div>
              <h3 className="font-display text-base font-semibold">Seamless bookings</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Reserve rooms in seconds, track check-ins and check-outs, and manage guest stays
                without the paperwork.
              </p>
            </Card>
            <Card className="p-6">
              <div className="mb-3 grid size-10 place-items-center rounded-lg bg-secondary/10 text-secondary">
                <UtensilsCrossed className="size-5" />
              </div>
              <h3 className="font-display text-base font-semibold">Dining, handled</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Full restaurant menus, categories, and availability — synced with every property
                on the platform.
              </p>
            </Card>
            <Card className="p-6">
              <div className="mb-3 grid size-10 place-items-center rounded-lg bg-warning/10 text-warning">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-display text-base font-semibold">Trusted by guests</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Verified reviews and ratings help every guest choose with confidence, and help
                every property improve.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured hotels */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Featured properties</h2>
            <p className="text-sm text-muted-foreground">A few of the hotels on our platform</p>
          </div>
        </div>
        {hotelsQ.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : hotels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No properties listed yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {hotels.map((hotel, i) => (
              <motion.div key={hotel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden p-0">
                  <div className="aspect-video overflow-hidden">
                    <img src={hotel.imageUrl} alt={hotel.name} className="size-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-sm font-semibold">{hotel.name}</h3>
                      <span className="flex items-center gap-1 text-xs font-semibold text-warning">
                        <Star className="size-3 fill-warning" /> {hotel.rating?.toFixed(1) ?? '—'}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {hotel.city}, {hotel.country}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Sample rooms */}
      <section className="border-t border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold">Rooms guests love</h2>
            <p className="text-sm text-muted-foreground">A glimpse of the accommodations available</p>
          </div>
          {roomTypesQ.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : roomTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms listed yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {roomTypes.map((rt, i) => (
                <motion.div key={rt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden p-0">
                    <div className="aspect-video overflow-hidden">
                      <img src={rt.imageUrl} alt={rt.name} className="size-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BedDouble className="size-3.5" /> {rt.bedType} · {rt.capacity} guests
                      </div>
                      <h3 className="mt-1 font-display text-sm font-semibold">{rt.name}</h3>
                      <p className="mt-1 text-sm font-bold text-primary">
                        {formatCurrency(rt.price)}<span className="text-2xs font-normal text-muted-foreground">/night</span>
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sample dining */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold">Dining on offer</h2>
          <p className="text-sm text-muted-foreground">A taste of what our restaurants serve</p>
        </div>
        {menuItemsQ.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : menuItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dishes listed yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {menuItems.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden p-0">
                  <div className="aspect-video overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-sm font-semibold">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                    <p className="mt-1.5 text-sm font-bold text-primary">{formatCurrency(item.price)}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA footer */}
      <section className="border-t border-border bg-primary/5 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a free account to book a stay, or log in if you're already part of Aurelia HMS.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gap-2">Create an account <ArrowRight className="size-4" /></Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Log in</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <p className="text-center text-2xs text-muted-foreground">© {new Date().getFullYear()} Aurelia HMS. All rights reserved.</p>
      </footer>
    </div>
  );
}