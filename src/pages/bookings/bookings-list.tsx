import { CalendarRange, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/states';
import { useTableFilters } from '@/hooks/use-table-filters';
import { useBookings, useDeleteBooking } from '@/hooks/use-bookings';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import type { Booking, BookingStatus } from '@/types';
import { BookingStatusBadge } from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/utils/format';

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'CHECKED_IN', label: 'Checked In' },
  { value: 'CHECKED_OUT', label: 'Checked Out' },
];

export default function BookingsList() {
  const { params, setSearch, setPage, setPageSize, setSort, setFilter } = useTableFilters({ pageSize: 15 });
  const q = useBookings(params);
  const deleteMut = useDeleteBooking();
  const hotelsQ = useHotelsLookup();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const hotelName = (id: string) => hotelsQ.data?.find((h) => h.id === id)?.name ?? '—';

  const { request, dialog } = useConfirmDelete({
    message: () => 'This booking will be permanently cancelled and removed.',
    onConfirm: async (id) => { await deleteMut.mutateAsync(id); },
    onSuccess: () => q.refetch(),
  });

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setFilter('status', value || undefined);
  };

  const columns: Column<Booking>[] = [
    { key: 'reference', header: 'Reference', sortable: true, cell: (b) => <span className="font-mono text-sm font-semibold">{b.reference}</span> },
    { key: 'guestName', header: 'Guest', sortable: true, cell: (b) => (
      <div>
        <p className="text-sm font-medium">{b.guestName}</p>
        <p className="text-2xs text-muted-foreground">{b.guestEmail}</p>
      </div>
    )},
    { key: 'hotelId', header: 'Hotel', sortable: true, cell: (b) => <span className="text-sm text-muted-foreground">{hotelName(b.hotelId)}</span> },
    { key: 'checkIn', header: 'Check-in', sortable: true, cell: (b) => <span className="text-sm">{formatDate(b.checkIn)}</span> },
    { key: 'checkOut', header: 'Check-out', sortable: true, cell: (b) => <span className="text-sm">{formatDate(b.checkOut)}</span> },
    { key: 'nights', header: 'Nights', sortable: true, cell: (b) => <span className="text-sm">{b.nights}</span> },
    { key: 'totalAmount', header: 'Total', sortable: true, cell: (b) => <span className="text-sm font-semibold">{formatCurrency(b.totalAmount)}</span> },
    { key: 'status', header: 'Status', sortable: true, cell: (b) => <BookingStatusBadge status={b.status} /> },
    { key: 'actions', header: '', hideable: false, cell: (b) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/bookings/${b.id}`); }}><Eye className="size-3.5" /> View</Button>
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); request(b.id); }}>Cancel</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Bookings" description="Manage reservations and guest stays" icon={<CalendarRange className="size-5" />}
        actions={<Button asChild className="gap-2"><Link to="/bookings/new"><Plus className="size-4" /> New booking</Link></Button>}
      />
      <DataTable columns={columns} rows={q.data?.items ?? []} total={q.data?.total ?? 0} page={params.page ?? 1} pageSize={params.pageSize ?? 15} totalPages={q.data?.totalPages ?? 1}
        search={params.search ?? ''} sortBy={params.sortBy} sortDir={params.sortDir as 'asc'|'desc'} onSearchChange={setSearch} onSortChange={setSort} onPageChange={setPage} onPageSizeChange={setPageSize}
        onRowClick={(b) => navigate(`/bookings/${b.id}`)} searchPlaceholder="Search by reference, guest…" exportFilename="bookings" loading={q.isLoading}
        toolbarActions={
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        }
        emptyState={<EmptyState title="No bookings found" description="Try adjusting your search or filters." icon={<CalendarRange className="size-7 text-muted-foreground" />} />}
      />
      {dialog}
    </div>
  );
}
