import { ClipboardList, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/states';
import { useTableFilters } from '@/hooks/use-table-filters';
import { useMenuItems, useDeleteMenuItem } from '@/hooks/resource-hooks';
import { useRestaurantsLookup } from '@/hooks/use-relations';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import { MenuCategoryBadge } from '@/components/shared/badges';
import type { MenuItem, MenuCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/format';

const CATEGORIES: MenuCategory[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'DRINK', 'SNACK'];

export default function MenuItemsList() {
  const { params, setSearch, setPage, setPageSize, setSort, setFilter } = useTableFilters({ pageSize: 15 });
  const q = useMenuItems();
  const deleteMut = useDeleteMenuItem();
  const restaurantsQ = useRestaurantsLookup();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const restaurantName = (id: string) => restaurantsQ.data?.find((r) => r.id === id)?.name ?? '—';

  const { request, dialog } = useConfirmDelete({
    message: () => 'This menu item will be permanently removed.',
    onConfirm: async (id) => { await deleteMut.mutateAsync(id); },
    onSuccess: () => q.refetch(),
  });

  const handleCategoryFilter = (value: string) => { setCategoryFilter(value); setFilter('category', value || undefined); };

  const filteredSorted = useMemo(() => {
    let items = q.data?.items ?? [];

    if (categoryFilter) {
      items = items.filter((m) => m.category === categoryFilter);
    }

    if (params.search) {
      const s = params.search.toLowerCase();
      items = items.filter(
        (m) => m.name.toLowerCase().includes(s) || m.description?.toLowerCase().includes(s)
      );
    }

    if (params.sortBy) {
      const dir = params.sortDir === 'desc' ? -1 : 1;
      const key = params.sortBy as keyof MenuItem;
      items = [...items].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av === bv) return 0;
        return (av as any) > (bv as any) ? dir : -dir;
      });
    }

    return items;
  }, [q.data, categoryFilter, params.search, params.sortBy, params.sortDir]);

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 15;
  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<MenuItem>[] = [
    { key: 'name', header: 'Item', sortable: true, cell: (m) => (
      <div className="flex items-center gap-3"><img src={m.imageUrl} alt="" className="size-10 rounded-lg object-cover" /><div><p className="text-sm font-semibold">{m.name}</p><p className="line-clamp-1 text-2xs text-muted-foreground">{m.description}</p></div></div>
    )},
    { key: 'restaurantId', header: 'Restaurant', sortable: true, cell: (m) => <span className="text-sm text-muted-foreground">{restaurantName(m.restaurantId)}</span> },
    { key: 'category', header: 'Category', sortable: true, cell: (m) => <MenuCategoryBadge category={m.category} /> },
    { key: 'price', header: 'Price', sortable: true, cell: (m) => <span className="text-sm font-semibold">{formatCurrency(m.price)}</span> },
    { key: 'isAvailable', header: 'Available', sortable: true, cell: (m) => <span className={m.isAvailable ? 'text-success text-sm font-medium' : 'text-muted-foreground text-sm'}>{m.isAvailable ? 'Yes' : 'No'}</span> },
    { key: 'actions', header: '', hideable: false, cell: (m) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/menu-items/${m.id}/edit`); }}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); request(m.id); }}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Menu Items" description="Manage dishes across restaurants" icon={<ClipboardList className="size-5" />}
        actions={<Button asChild className="gap-2"><Link to="/menu-items/new"><Plus className="size-4" /> Add item</Link></Button>}
      />
      <DataTable columns={columns} rows={pageItems} total={total} page={page} pageSize={pageSize} totalPages={totalPages}
        search={params.search ?? ''} sortBy={params.sortBy} sortDir={params.sortDir as 'asc'|'desc'} onSearchChange={setSearch} onSortChange={setSort} onPageChange={setPage} onPageSizeChange={setPageSize}
        onRowClick={(m) => navigate(`/menu-items/${m.id}/edit`)} searchPlaceholder="Search menu items…" exportFilename="menu-items" loading={q.isLoading}
        toolbarActions={
          <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>)}</SelectContent>
          </Select>
        }
        emptyState={<EmptyState title="No menu items found" icon={<ClipboardList className="size-7 text-muted-foreground" />} />}
      />
      {dialog}
    </div>
  );
}