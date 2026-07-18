import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '@/services/room.service';
import type { RoomStatus } from '@/types';

export function useBulkUpdateRooms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: RoomStatus }) =>
      roomService.bulkUpdate(ids, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms', 'list'] }),
  });
}

export function useBulkDeleteRooms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => roomService.bulkDelete(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms', 'list'] }),
  });
}

export function useToggleRoomAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RoomStatus }) =>
      roomService.toggleAvailability(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms', 'list'] }),
  });
}
