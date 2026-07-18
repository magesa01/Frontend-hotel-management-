import { motion } from 'framer-motion';
import { BedDouble, DoorOpen, MapPin, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { ApiState, EmptyState } from '@/components/shared/states';
import { useTableFilters } from '@/hooks/use-table-filters';
import { roomTypeHooks } from '@/hooks/resource-hooks';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import type { RoomType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import { useHotelsLookup } from '@/hooks/use-relations';

export default function RoomTypesList() {
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const { params, setSearch, setPage, setPageSize, setSort } = useTableFilters({ pageSize: 12 });
  const { useList, useDelete } = roomTypeHooks;
  const q = useList(params);
  const deleteMut = useDelete();
  const navigate = useNavigate();
  const hotelsQ = useHotelsLookup();
  const hotelName = (id: string) => hotelsQ.data?.find((h) => h.id === id)?.name ?? '—';

  const { request, dialog } = useConfirmDelete({
    message: () => 'This room type will be permanently removed.',
    onConfirm: async (id) => { await deleteMut.mutateAsync(id); },
    onSuccess: () => q.refetch(),
  });

  const columns: Column<RoomType>[] = [
    { key: 'name', header: 'Name', sortable: true, cell: (rt) => (
      <div className="flex items-center gap-3">
        <img src={rt.imageUrl} alt="" className="size-10 rounded-lg object-cover" />
        <span className="text-sm font-semibold">{rt.name}</span>
      </div>
    )},
    { key: 'hotelId', header: 'Hotel', sortable: true, cell: (rt) => <span className="text-sm text-muted-foreground">{hotelName(rt.hotelId)}</span> },
    { key: 'price', header: 'Price/night', sortable: true, cell: (rt) => <span className="text-sm font-semibold">{formatCurrency(rt.price)}</span> },
    { key: 'capacity', header: 'Capacity', sortable: true, cell: (rt) => <span className="text-sm">{rt.capacity} guests</span> },
    { key: 'bedType', header: 'Bed', sortable: true, cell: (rt) => <span className="text-sm">{rt.bedType}</span> },
    { key: 'sizeSqm', header: 'Size', sortable: true, cell: (rt) => <span className="text-sm">{rt.sizeSqm} m²</span> },
    { key: 'actions', header: '', hideable: false, cell: (rt) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/room-types/${rt.id}/edit`); }}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); request(rt.id); }}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Room Types" description="Manage room configurations across properties" icon={<BedDouble className="size-5" />}
        actions={<>
          <div className="flex rounded-lg border border-border p-0.5">
            <button onClick={() => setView('cards')} className={view === 'cards' ? 'rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground' : 'rounded-md px-3 py-1 text-xs text-muted-foreground'}>Cards</button>
            <button onClick={() => setView('table')} className={view === 'table' ? 'rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground' : 'rounded-md px-3 py-1 text-xs text-muted-foreground'}>Table</button>
          </div>
          <Button asChild className="gap-2"><Link to="/room-types/new"><Plus className="size-4" /> Add room type</Link></Button>
        </>}
      />
      {view === 'cards' ? (
        <ApiState isLoading={q.isLoading} isError={q.isError} onRetry={q.refetch} empty={q.data?.items.length === 0} emptyTitle="No room types yet" emptyAction={<Button asChild className="gap-2"><Link to="/room-types/new"><Plus className="size-4" /> Add room type</Link></Button>}
          skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />)}</div>}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {q.data?.items.map((rt, i) => (
              <motion.div key={rt.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} whileHover={{y:-3}}>
                <Card className="overflow-hidden p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={rt.imageUrl} alt="" className="size-full object-cover" />
                    <span className="absolute right-2 top-2 rounded-md bg-foreground/60 px-2 py-0.5 text-2xs font-semibold text-background backdrop-blur">{rt.sizeSqm} m²</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-sm font-semibold">{rt.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-2xs text-muted-foreground"><MapPin className="size-3" /> {hotelName(rt.hotelId)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-2xs text-muted-foreground">
                        <span className="flex items-center gap-1"><DoorOpen className="size-3" /> {rt.bedType}</span>
                        <span>{rt.capacity} guests</span>
                      </div>
                      <p className="font-bold text-primary">{formatCurrency(rt.price)}<span className="text-2xs font-normal text-muted-foreground">/nt</span></p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/room-types/${rt.id}/edit`)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => request(rt.id)}>Delete</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ApiState>
      ) : (
        <DataTable columns={columns} rows={q.data?.items ?? []} total={q.data?.total ?? 0} page={params.page ?? 1} pageSize={params.pageSize ?? 10} totalPages={q.data?.totalPages ?? 1}
          search={params.search ?? ''} sortBy={params.sortBy} sortDir={params.sortDir as 'asc'|'desc'} onSearchChange={setSearch} onSortChange={setSort} onPageChange={setPage} onPageSizeChange={setPageSize}
          onRowClick={(rt) => navigate(`/room-types/${rt.id}/edit`)} searchPlaceholder="Search room types…" exportFilename="room-types" loading={q.isLoading}
          emptyState={<EmptyState title="No room types found" icon={<BedDouble className="size-7 text-muted-foreground" />} />} />
      )}
      {dialog}
    </div>
  );
}
