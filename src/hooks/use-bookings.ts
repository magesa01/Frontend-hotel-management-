import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import type { Booking, BookingStatus, Paginated, QueryParams } from '@/types';

const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...bookingKeys.lists(), params] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  byUser: (id: string) => [...bookingKeys.all, 'user', id] as const,
  byHotel: (id: string) => [...bookingKeys.all, 'hotel', id] as const,
};

// Backend /bookings returns everything with no filtering — so we filter,
// sort, and paginate client-side once the full list arrives.
function paginateBookings(all: Booking[], params: QueryParams): Paginated<Booking> {
  let filtered = all;

  if (params.hotelId) {
    filtered = filtered.filter((b) => b.hotelId === params.hotelId);
  }
  if (params.userId) {
    filtered = filtered.filter((b) => b.userId === params.userId);
  }
  if (params.search) {
    const q = String(params.search).toLowerCase();
    filtered = filtered.filter(
      (b) => b.guestName.toLowerCase().includes(q) || b.reference.toLowerCase().includes(q)
    );
  }

  if (params.sortBy) {
    const dir = params.sortDir === 'desc' ? -1 : 1;
    const key = params.sortBy as keyof Booking;
    filtered = [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av === bv) return 0;
      return (av as any) > (bv as any) ? dir : -dir;
    });
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? (filtered.length || 1);
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return {
    items: pageItems,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  };
}

export function useBookings(params: QueryParams = {}) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingService.list(),
    select: (data) => paginateBookings(data.items, params),
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => bookingService.getById(id!),
    enabled: !!id,
  });
}

export function useUserBookings(userId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.byUser(userId ?? ''),
    queryFn: () => bookingService.listByUser(userId!),
    enabled: !!userId,
  });
}

export function useHotelBookings(hotelId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.byHotel(hotelId ?? ''),
    queryFn: () => bookingService.listByHotel(hotelId!),
    enabled: !!hotelId,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof bookingService.create>[0]) => bookingService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.lists() }),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingService.updateStatus(id, status),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
    },
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Booking> }) =>
      bookingService.update(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
    },
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.lists() }),
  });
}