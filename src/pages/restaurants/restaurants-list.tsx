import { motion } from 'framer-motion';
import { Clock, Phone, Plus, UtensilsCrossed } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/states';
import { useTableFilters } from '@/hooks/use-table-filters';
import { useRestaurants, useDeleteRestaurant } from '@/hooks/resource-hooks';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import { useAuth } from '@/contexts/auth-context';
import { RatingBadge } from '@/components/shared/rating-stars';
import type { Restaurant } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RestaurantsList() {
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const { params, setSearch, setPage, setPageSize, setSort } = useTableFilters({ pageSize: 12 });
  const q = useRestaurants();
  const deleteMut = useDeleteRestaurant();
  const hotelsQ = useHotelsLookup();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hotelName = (id: string) => hotelsQ.data?.find((h) => h.id === id)?.name ?? '—';

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isHotelAdmin = user?.role === 'HOTEL_ADMIN';
  const isRestaurantAdmin = user?.role === 'RESTAURANT_ADMIN';

  const { request, dialog } = useConfirmDelete({
    message: () => 'This restaurant will be permanently removed.',
    onConfirm: async (id) => { await deleteMut.mutateAsync(id); },
    onSuccess: () => q.refetch(),
  });

  const scoped = useMemo(() => {
    let items = q.data?.items ?? [];
    if (isHotelAdmin) {
      items = items.filter((r) => r.hotelId === user?.assignedHotelId);
    } else if (isRestaurantAdmin) {
      items = items.filter((r) => r.id === user?.assignedRestaurantId);
    }
    return items;
  }, [q.data, isHotelAdmin, isRestaurantAdmin, user]);

  const filteredSorted = useMemo(() => {
    let items = scoped;

    if (params.search) {
      const s = params.search.toLowerCase();
      items = items.filter(
        (r) => r.name.toLowerCase().includes(s) || r.cuisine?.toLowerCase().includes(s)
      );
    }

    if (params.sortBy) {
      const dir = params.sortDir === 'desc' ? -1 : 1;
      const key = params.sortBy as keyof Restaurant;
      items = [...items].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av === bv) return 0;
        return (av as any) > (bv as any) ? dir : -dir;
      });
    }

    return items;
  }, [scoped, params.search, params.sortBy, params.sortDir]);

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const canEdit = (r: Restaurant) => {
    if (isSuperAdmin || isHotelAdmin) return true;
    if (isRestaurantAdmin) return r.id === user?.assignedRestaurantId;
    return false;
  };

  const columns: Column<Restaurant>[] = [
    { key: 'name', header: 'Restaurant', sortable: true, cell: (r) => (
      <div className="flex items-center gap-3"><img src={r.imageUrl} alt="" className="size-10 rounded-lg object-cover" /><div><p className="text-sm font-semibold">{r.name}</p><p className="text-2xs text-muted-foreground">{r.cuisine}</p></div></div>
    )},
    { key: 'hotelId', header: 'Hotel', sortable: true, cell: (r) => <span className="text-sm text-muted-foreground">{hotelName(r.hotelId)}</span> },
    { key: 'cuisine', header: 'Cuisine', sortable: true, cell: (r) => <span className="text-sm">{r.cuisine}</span> },
    { key: 'openingHours', header: 'Hours', cell: (r) => <span className="text-sm text-muted-foreground">{r.openingHours}</span> },
    { key: 'rating', header: 'Rating', sortable: true, cell: (r) => <RatingBadge value={r.rating} /> },
    { key: 'actions', header: '', hideable: false, cell: (r) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/restaurants/${r.id}`); }}>View</Button>
        {canEdit(r) && (
          <>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/restaurants/${r.id}/edit`); }}>Edit</Button>
            {isSuperAdmin && (
              <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); request(r.id); }}>Delete</Button>
            )}
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Restaurants" description={isHotelAdmin ? 'Dining venues in your hotel' : isRestaurantAdmin ? 'Your restaurant' : 'Manage dining venues across properties'} icon={<UtensilsCrossed className="size-5" />}
        actions={<>
          <div className="flex rounded-lg border border-border p-0.5">
            <button onClick={() => setView('cards')} className={view === 'cards' ? 'rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground' : 'rounded-md px-3 py-1 text-xs text-muted-foreground'}>Cards</button>
            <button onClick={() => setView('table')} className={view === 'table' ? 'rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground' : 'rounded-md px-3 py-1 text-xs text-muted-foreground'}>Table</button>
          </div>
          {(isSuperAdmin || isHotelAdmin) && (
            <Button asChild className="gap-2"><Link to="/restaurants/new"><Plus className="size-4" /> Add restaurant</Link></Button>
          )}
        </>}
      />
      {view === 'cards' ? (
        <ApiStateCards q={q} items={pageItems}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((r, i) => (
              <motion.div key={r.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} whileHover={{y:-3}}>
                <Card className="overflow-hidden p-0">
                  <Link to={`/restaurants/${r.id}`}>
                    <div className="relative aspect-video overflow-hidden">
                      <img src={r.imageUrl} alt="" className="size-full object-cover transition-transform duration-500 hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                      <RatingBadge value={r.rating} className="absolute right-2 top-2" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-sm font-semibold">{r.name}</h3>
                      <p className="text-2xs text-muted-foreground">{r.cuisine} · {hotelName(r.hotelId)}</p>
                      <div className="mt-2 flex items-center gap-3 text-2xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {r.openingHours}</span>
                        <span className="flex items-center gap-1"><Phone className="size-3" /> {r.phone}</span>
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </ApiStateCards>
      ) : (
        <DataTable columns={columns} rows={pageItems} total={total} page={page} pageSize={pageSize} totalPages={totalPages}
          search={params.search ?? ''} sortBy={params.sortBy} sortDir={params.sortDir as 'asc'|'desc'} onSearchChange={setSearch} onSortChange={setSort} onPageChange={setPage} onPageSizeChange={setPageSize}
          onRowClick={(r) => navigate(`/restaurants/${r.id}`)} searchPlaceholder="Search restaurants…" exportFilename="restaurants" loading={q.isLoading}
          emptyState={<EmptyState title="No restaurants found" icon={<UtensilsCrossed className="size-7 text-muted-foreground" />} />} />
      )}
      {dialog}
    </div>
  );
}

function ApiStateCards({ q, items, children }: { q: any; items: Restaurant[]; children: React.ReactNode }) {
  if (q.isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />)}</div>;
  if (q.isError) return <div className="py-16 text-center text-sm text-muted-foreground">Failed to load restaurants.</div>;
  if (items.length === 0) return <EmptyState title="No restaurants yet" description="Add a dining venue to get started." icon={<UtensilsCrossed className="size-7 text-muted-foreground" />} />;
  return <>{children}</>;
}