import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Phone } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiState } from '@/components/shared/states';
import { RatingStars, RatingBadge } from '@/components/shared/rating-stars';
import { MenuCategoryBadge } from '@/components/shared/badges';
import { useRestaurant } from '@/hooks/resource-hooks';
import { useHotelsLookup, useMenuByRestaurant } from '@/hooks/use-relations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const q = useRestaurant(id);
  const hotelsQ = useHotelsLookup();
  const menuQ = useMenuByRestaurant(id);

  const restaurant = q.data;
  const hotelName = (hid: string) => hotelsQ.data?.find((h) => h.id === hid)?.name ?? '—';

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate('/restaurants')}><ArrowLeft className="size-4" /> Back to restaurants</Button>
      <ApiState isLoading={q.isLoading} isError={q.isError} onRetry={q.refetch}>
        {restaurant && (
          <>
            <div className="relative mb-6 overflow-hidden rounded-2xl">
              <img src={restaurant.imageUrl} alt={restaurant.name} className="h-56 w-full object-cover lg:h-72" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">{restaurant.name}</h1>
                    <p className="mt-1 text-sm text-primary-foreground/80">{restaurant.cuisine} · {hotelName(restaurant.hotelId)}</p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <RatingBadge value={restaurant.rating} className="bg-white/20 text-white border-white/30" />
                    <Button asChild variant="secondary" size="sm"><Link to={`/restaurants/${restaurant.id}/edit`}>Edit</Link></Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="mb-4 p-5">
                  <h3 className="mb-2 font-display text-base font-semibold">About</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{restaurant.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm"><Clock className="size-4 text-muted-foreground" /> {restaurant.openingHours}</div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="size-4 text-muted-foreground" /> {restaurant.phone}</div>
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold">Menu items</h3>
                    <Button asChild variant="outline" size="sm"><Link to="/menu-items/new">Add item</Link></Button>
                  </div>
                  <ApiState isLoading={menuQ.isLoading} isError={menuQ.isError} onRetry={menuQ.refetch} empty={menuQ.data?.length === 0} emptyTitle="No menu items" emptyDescription="Add dishes to this restaurant.">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {menuQ.data?.map((item, i) => (
                        <motion.div key={item.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="flex gap-3 rounded-lg border border-border/60 p-3">
                          <img src={item.imageUrl} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{item.name}</p><MenuCategoryBadge category={item.category} /></div>
                            <p className="mt-0.5 line-clamp-2 text-2xs text-muted-foreground">{item.description}</p>
                            <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(item.price)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ApiState>
                </Card>
              </div>

              <div>
                <Card className="p-5">
                  <h3 className="mb-3 font-display text-base font-semibold">Rating</h3>
                  <div className="text-center">
                    <p className="font-display text-4xl font-bold text-gradient">{restaurant.rating}</p>
                    <div className="mt-2 flex justify-center"><RatingStars value={restaurant.rating} size={18} readonly /></div>
                    <p className="mt-2 text-xs text-muted-foreground">Based on guest reviews</p>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </ApiState>
    </div>
  );
}