import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Paginated, QueryParams } from '@/types';

type EntityWithId = { id: string };

interface CrudService<T extends EntityWithId, CreatePayload, UpdatePayload> {
  list: (params?: QueryParams) => Promise<{ items: T[]; total: number }>;
  getById: (id: string) => Promise<T>;
  create: (payload: CreatePayload) => Promise<T>;
  update: (id: string, payload: UpdatePayload) => Promise<T>;
  remove: (id: string) => Promise<{ id: string }>;
}

function paginateClientSide<T extends EntityWithId>(all: T[], params: QueryParams): Paginated<T> {
  let filtered = all;

  if (params.search) {
    const q = String(params.search).toLowerCase();
    filtered = filtered.filter((item) =>
      Object.values(item as Record<string, unknown>).some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q)
      )
    );
  }

  const reservedKeys = new Set(['page', 'pageSize', 'search', 'sortBy', 'sortDir']);
  for (const [key, value] of Object.entries(params)) {
    if (reservedKeys.has(key) || value === undefined || value === '') continue;
    filtered = filtered.filter((item) => (item as Record<string, unknown>)[key] === value);
  }

  if (params.sortBy) {
    const dir = params.sortDir === 'desc' ? -1 : 1;
    const key = params.sortBy as keyof T;
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

export function makeCrudHooks<
  T extends EntityWithId,
  CreatePayload,
  UpdatePayload = Partial<CreatePayload>,
>(resource: string, service: CrudService<T, CreatePayload, UpdatePayload>) {
  const keys = {
    all: [resource] as const,
    lists: () => [...keys.all, 'list'] as const,
    list: (params: QueryParams) => [...keys.lists(), params] as const,
    details: () => [...keys.all, 'detail'] as const,
    detail: (id: string) => [...keys.details(), id] as const,
  };

  function useList(params: QueryParams = {}) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => service.list(),
      select: (data) => paginateClientSide(data.items, params),
    });
  }

  function useDetail(id: string | undefined) {
    return useQuery({
      queryKey: keys.detail(id ?? ''),
      queryFn: () => service.getById(id!),
      enabled: !!id,
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (payload: CreatePayload) => service.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.lists() }),
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) => service.update(id, payload),
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: keys.lists() });
        qc.invalidateQueries({ queryKey: keys.detail(data.id) });
      },
    });
  }

  function useDelete() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => service.remove(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.lists() }),
    });
  }

  return { keys, useList, useDetail, useCreate, useUpdate, useDelete };
}