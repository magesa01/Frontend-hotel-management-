import { useEffect, useState } from 'react';
import type { QueryParams } from '@/types';

const DEFAULTS: QueryParams = { page: 1, pageSize: 10, search: '', sortBy: '', sortDir: 'asc' };

export function useTableFilters(initial?: Partial<QueryParams>) {
  const [params, setParams] = useState<QueryParams>({ ...DEFAULTS, ...initial });

  const update = (patch: Partial<QueryParams>) => setParams((prev) => ({ ...prev, ...patch }));

  const setSearch = (search: string) => update({ search, page: 1 });
  const setPage = (page: number) => update({ page });
  const setPageSize = (pageSize: number) => update({ pageSize, page: 1 });
  const setSort = (sortBy: string) =>
    setParams((prev) => ({
      ...prev,
      sortBy,
      sortDir: prev.sortBy === sortBy && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
  const setFilter = (key: string, value: string | undefined) => update({ [key]: value, page: 1 });

  // Reset to page 1 when search changes externally
  useEffect(() => {
    if (params.search === undefined) update({ search: '' });
  }, []);

  return { params, update, setSearch, setPage, setPageSize, setSort, setFilter };
}
