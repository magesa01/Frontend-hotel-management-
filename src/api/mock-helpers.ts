import type { Paginated, QueryParams } from '@/types';

/** Simulated network latency range (ms). */
const LATENCY_MIN = 180;
const LATENCY_MAX = 520;

export function delay<T>(value: T, ms?: number): Promise<T> {
  const d = ms ?? Math.floor(Math.random() * (LATENCY_MAX - LATENCY_MIN)) + LATENCY_MIN;
  return new Promise((resolve) => setTimeout(() => resolve(value), d));
}

export function notFound(message = 'Resource not found'): Error {
  const err = new Error(message);
  (err as any).status = 404;
  (err as any).isApiError = true;
  return err;
}

export function badRequest(message = 'Validation failed'): Error {
  const err = new Error(message);
  (err as any).status = 400;
  (err as any).isApiError = true;
  return err;
}

export function toPaginated<T>(
  items: T[],
  params: QueryParams,
  searchFields: (keyof T)[]
): Paginated<T> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 10);
  const search = params.search?.trim().toLowerCase();
  const sortBy = params.sortBy as keyof T | undefined;
  const sortDir = params.sortDir === 'desc' ? 'desc' : 'asc';

  let result = [...items];

  if (search) {
    result = result.filter((row) =>
      searchFields.some((field) =>
        String(row[field] ?? '')
          .toLowerCase()
          .includes(search)
      )
    );
  }

  // Extra equality filters (any param key matching a T field, excluding reserved keys)
  const reserved = new Set(['page', 'pageSize', 'search', 'sortBy', 'sortDir']);
  for (const [key, value] of Object.entries(params)) {
    if (reserved.has(key) || value === undefined || value === '') continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result = result.filter((row) => String((row as any)[key]) === String(value));
    }
  }

  if (sortBy) {
    result.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paged = result.slice(start, start + pageSize);

  return { items: paged, total, page: safePage, pageSize, totalPages };
}
