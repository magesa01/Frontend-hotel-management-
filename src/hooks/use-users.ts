import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User } from '@/types';

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id!),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      userService.update(id, payload),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['users', data.id] }),
  });
}

export function useActivities(limit = 6) {
  return useQuery({ queryKey: ['activities', limit], queryFn: () => userService.getActivities(limit) });
}
