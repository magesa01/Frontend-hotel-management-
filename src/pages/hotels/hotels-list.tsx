import { motion } from 'framer-motion';
import { Building2, LayoutGrid, MapPin, Plus, Table as TableIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { ApiState, EmptyState } from '@/components/shared/states';
import { RatingBadge } from '@/components/shared/rating-stars';
import { useTableFilters } from '@/hooks/use-table-filters';
import { hotelHooks } from '@/hooks/resource-hooks';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import { useAuth } from '@/contexts/auth-context';
import type { Hotel } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function HotelsList() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const { params, setSearch, setPage, setPageSize, setSort } = useTableFilters({ pageSize: 12 });
  const { useList, useDelete } = hotelHooks;
  const q = useList(params);
  const deleteMut = useDelete();
  const { user } = useAuth();

  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isHotelAdmin = user?.role === 'HOTEL_ADMIN';

  const hotels = useMemo(() => {
    const all = q.data?.items ?? [];
    if (isHotelAdmin) {
      return all.filter((h) => h.id === user?.assignedHotelId);
    }
    return all;
  }, [q.data, isHotelAdmin, user]);

  const { request, dialog } = useConfirmDelete({
    message: () => 'This hotel and its related data will be permanently removed.',
    onConfirm: async (id) => {
      await deleteMut.mutateAsync(id);
    },
    onSuccess: () => q.refetch(),
  });

  const columns: Column<Hotel>[] = [
    {
      key: 'name',
      header: 'Hotel',
      sortable: true,
      cell: (h) => (
        <div className="flex items-center gap-3">
          <img src={h.imageUrl} alt="" className="size-10 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{h.name}</p>
            <p className="truncate text-xs text-muted-foreground">{h.city}, {h.country}</p>
          </div>
        </div>
      ),
    },
    { key: 'location', header: 'Location', sortable: true, cell: (h) => <span className="text-sm text-muted-foreground">{h.location}</span> },
    { key: 'city', header: 'City', sortable: true, cell: (h) => <span className="text-sm">{h.city}</span> },
    { key: 'country', header: 'Country', sortable: true, cell: (h) => <span className="text-sm">{h.country}</span> },
    { key: 'rating', header: 'Rating', sortable: true, cell: (h) => <RatingBadge value={h.rating} /> },
    {
      key: 'actions',
      header: '',
      hideable: false,
      cell: (h) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/hotels/${h.id}`); }}>View</Button>
          {isSuperAdmin && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); request(h.id); }} className="text-danger hover:text-danger">Delete</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hotels"
        description={isHotelAdmin ? 'Your assigned property' : 'Manage your property portfolio'}
        icon={<Building2 className="size-5" />}
        actions={
          <>
            <div className="flex rounded-lg border border-border p-0.5">
              <button onClick={() => setView('grid')} className={cn('grid size-8 place-items-center rounded-md transition-colors', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
                <LayoutGrid className="size-4" />
              </button>
              <button onClick={() => setView('table')} className={cn('grid size-8 place-items-center rounded-md transition-colors', view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
                <TableIcon className="size-4" />
              </button>
            </div>
            {isSuperAdmin && (
              <Button asChild className="gap-2">
                <Link to="/hotels/new"><Plus className="size-4" /> Add hotel</Link>
              </Button>
            )}
          </>
        }
      />

      {view === 'grid' ? (
        <ApiState
          isLoading={q.isLoading}
          isError={q.isError}
          onRetry={q.refetch}
          empty={hotels.length === 0}
          emptyTitle="No hotels yet"
          emptyDescription="Create your first property to get started."
          emptyIcon={<Building2 className="size-7 text-muted-foreground" />}
          emptyAction={isSuperAdmin ? <Button asChild className="gap-2"><Link to="/hotels/new"><Plus className="size-4" /> Add hotel</Link></Button> : undefined}
          skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}</div>}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel, i) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                whileHover={{ y: -3 }}
              >
                <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-soft-lg">
                  <Link to={`/hotels/${hotel.id}`}>
                    <div className="relative aspect-video overflow-hidden">
                      <img src={hotel.imageUrl} alt={hotel.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <RatingBadge value={hotel.rating} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base font-semibold tracking-tight">{hotel.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {hotel.location}, {hotel.city}, {hotel.country}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{hotel.description}</p>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          {q.data && q.data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={params.page === 1} onClick={() => setPage((params.page ?? 1) - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">{params.page} / {q.data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={params.page === q.data.totalPages} onClick={() => setPage((params.page ?? 1) + 1)}>Next</Button>
            </div>
          )}
        </ApiState>
      ) : (
        <DataTable
          columns={columns}
          rows={hotels}
          total={hotels.length}
          page={params.page ?? 1}
          pageSize={params.pageSize ?? 10}
          totalPages={q.data?.totalPages ?? 1}
          search={params.search ?? ''}
          sortBy={params.sortBy}
          sortDir={params.sortDir as 'asc' | 'desc'}
          onSearchChange={setSearch}
          onSortChange={setSort}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRowClick={(h) => navigate(`/hotels/${h.id}`)}
          searchPlaceholder="Search hotels…"
          exportFilename="hotels"
          loading={q.isLoading}
          emptyState={<EmptyState title="No hotels found" description="Try adjusting your search." icon={<Building2 className="size-7 text-muted-foreground" />} />}
        />
      )}
      {dialog}
    </div>
  );
}