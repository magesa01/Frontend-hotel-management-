import { motion } from 'framer-motion';
import { ArrowUp, DoorOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/states';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useTableFilters } from '@/hooks/use-table-filters';
import { roomHooks } from '@/hooks/resource-hooks';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useBulkDeleteRooms, useBulkUpdateRooms, useToggleRoomAvailability } from '@/hooks/use-rooms-bulk';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import type { Room, RoomStatus } from '@/types';
import { RoomStatusBadge } from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const STATUSES: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'];

export default function RoomsList() {
  const { params, setSearch, setPage, setPageSize, setSort } = useTableFilters({ pageSize: 20 });
  const { useList, useDelete } = roomHooks;
  const q = useList(params);
  const deleteMut = useDelete();
  const toggleMut = useToggleRoomAvailability();
  const bulkDeleteMut = useBulkDeleteRooms();
  const bulkUpdateMut = useBulkUpdateRooms();
  const hotelsQ = useHotelsLookup();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<RoomStatus>('AVAILABLE');
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const hotelName = (id: string) => hotelsQ.data?.find((h) => h.id === id)?.name ?? '—';

  const { request, dialog } = useConfirmDelete({
    message: () => 'This room will be permanently removed.',
    onConfirm: async (id) => { await deleteMut.mutateAsync(id); },
    onSuccess: () => q.refetch(),
  });

  const toggleStatus = (room: Room) => {
    const next: RoomStatus = room.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
    toggleMut.mutate({ id: room.id, status: next }, {
      onSuccess: () => { toast.success(`Room ${room.roomNumber} marked ${next.toLowerCase()}`); q.refetch(); },
    });
  };

  const handleBulkDelete = async () => {
    await bulkDeleteMut.mutateAsync(selected);
    toast.success(`${selected.length} rooms deleted`);
    setSelected([]);
    setBulkDeleteOpen(false);
    q.refetch();
  };

  const handleBulkUpdate = async () => {
    await bulkUpdateMut.mutateAsync({ ids: selected, status: bulkStatus });
    toast.success(`${selected.length} rooms updated to ${bulkStatus.toLowerCase()}`);
    setSelected([]);
    q.refetch();
  };

  const columns: Column<Room>[] = [
    { key: 'roomNumber', header: 'Room', sortable: true, cell: (r) => <span className="font-mono text-sm font-semibold">{r.roomNumber}</span> },
    { key: 'hotelId', header: 'Hotel', sortable: true, cell: (r) => <span className="text-sm text-muted-foreground">{hotelName(r.hotelId)}</span> },
    { key: 'floor', header: 'Floor', sortable: true, cell: (r) => <span className="text-sm">{r.floor}</span> },
    { key: 'status', header: 'Status', sortable: true, cell: (r) => <RoomStatusBadge status={r.status} /> },
    { key: 'actions', header: '', hideable: false, cell: (r) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleStatus(r); }} disabled={toggleMut.isPending}>
          Toggle
        </Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/rooms/${r.id}/edit`); }}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); request(r.id); }}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Rooms" description="Manage individual rooms and availability" icon={<DoorOpen className="size-5" />}
        actions={<Button asChild className="gap-2"><Link to="/rooms/new"><Plus className="size-4" /> Add room</Link></Button>}
      />

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <span className="text-sm font-semibold text-primary">{selected.length} selected</span>
          <div className="flex items-center gap-2">
            <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as RoomStatus)}>
              <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.toLowerCase().replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="gap-2" onClick={handleBulkUpdate} disabled={bulkUpdateMut.isPending}><ArrowUp className="size-3.5" /> Bulk update</Button>
          </div>
          <Button size="sm" variant="outline" className="gap-2 border-danger/30 text-danger hover:bg-danger/10" onClick={() => setBulkDeleteOpen(true)} disabled={bulkDeleteMut.isPending}><Trash2 className="size-3.5" /> Bulk delete</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
        </motion.div>
      )}

      <DataTable columns={columns} rows={q.data?.items ?? []} total={q.data?.total ?? 0} page={params.page ?? 1} pageSize={params.pageSize ?? 20} totalPages={q.data?.totalPages ?? 1}
        search={params.search ?? ''} sortBy={params.sortBy} sortDir={params.sortDir as 'asc'|'desc'} onSearchChange={setSearch} onSortChange={setSort} onPageChange={setPage} onPageSizeChange={setPageSize}
        onRowClick={(r) => navigate(`/rooms/${r.id}/edit`)} searchPlaceholder="Search rooms…" exportFilename="rooms" loading={q.isLoading}
        rowSelection={{ selectedIds: selected, onToggle: (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]), onToggleAll: setSelected }}
        emptyState={<EmptyState title="No rooms found" icon={<DoorOpen className="size-7 text-muted-foreground" />} />}
      />

      <ConfirmDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen} title="Delete selected rooms" description={`This will permanently delete ${selected.length} rooms.`} confirmLabel="Delete all" destructive loading={bulkDeleteMut.isPending} onConfirm={handleBulkDelete} />
      {dialog}
    </div>
  );
}
