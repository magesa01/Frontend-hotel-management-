import { AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Download,
  Eye,
  EyeOff,
  Search,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCsv } from '@/utils/csv';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
  hideable?: boolean;
  exportValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  search: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSearchChange: (v: string) => void;
  onSortChange: (key: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  searchPlaceholder?: string;
  toolbarActions?: React.ReactNode;
  exportFilename?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  rowSelection?: {
    selectedIds: string[];
    onToggle: (id: string) => void;
    onToggleAll: (ids: string[]) => void;
  };
  emptyState?: React.ReactNode;
}

const PAGE_SIZES = [10, 20, 50];

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  total,
  page,
  pageSize,
  totalPages,
  search,
  sortBy,
  sortDir,
  onSearchChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  searchPlaceholder = 'Search…',
  toolbarActions,
  exportFilename = 'export',
  loading,
  onRowClick,
  rowSelection,
  emptyState,
}: DataTableProps<T>) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visibleColumns = useMemo(() => columns.filter((c) => !hidden.has(c.key)), [columns, hidden]);

  const toggleColumn = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleExport = () => {
    exportToCsv(
      exportFilename,
      rows,
      visibleColumns.map((c) => ({ key: (c.exportValue ? c.exportValue(rows[0]) : '') as never, label: c.header }))
    );
  };

  const allSelected = rowSelection && rows.length > 0 && rows.every((r) => rowSelection.selectedIds.includes(r.id));
  const someSelected = rowSelection && rowSelection.selectedIds.length > 0 && !allSelected;

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="surface-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {toolbarActions}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="size-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns
                .filter((c) => c.hideable !== false)
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={!hidden.has(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  >
                    {col.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={rows.length === 0}>
            <Download className="size-4" /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        <div className="max-h-[640px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border">
              <TableRow className="hover:bg-transparent">
                {rowSelection && (
                  <TableHead className="w-10 pl-4">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border accent-primary"
                      checked={!!allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = !!someSelected;
                      }}
                      onChange={() =>
                        allSelected
                          ? rowSelection.onToggleAll([])
                          : rowSelection.onToggleAll(rows.map((r) => r.id))
                      }
                    />
                  </TableHead>
                )}
                {visibleColumns.map((col) => {
                  const isSorted = sortBy === col.key;
                  return (
                    <TableHead key={col.key} className={cn(col.className)}>
                      {col.sortable ? (
                        <button
                          onClick={() => onSortChange(col.key)}
                          className="inline-flex items-center gap-1 font-semibold transition-colors hover:text-foreground"
                        >
                          {col.header}
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3 text-muted-foreground/50" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {(rowSelection ? [null, ...visibleColumns] : visibleColumns).map((col, j) => (
                      <TableCell key={j} className={col?.className}>
                        <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={visibleColumns.length + (rowSelection ? 1 : 0)} className="py-16">
                    {emptyState ?? <DefaultEmpty />}
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence initial={false}>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        'group transition-colors',
                        onRowClick && 'cursor-pointer',
                        rowSelection?.selectedIds.includes(row.id) && 'bg-primary/5'
                      )}
                    >
                      {rowSelection && (
                        <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="size-4 rounded border-border accent-primary"
                            checked={rowSelection.selectedIds.includes(row.id)}
                            onChange={() => rowSelection.onToggle(row.id)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map((col) => (
                        <TableCell key={col.key} className={cn(col.className)}>
                          {col.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer / pagination */}
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {total > 0 ? `${rangeStart}–${rangeEnd} of ${total}` : 'No results'}
          </span>
          {onPageSizeChange && (
            <div className="flex items-center gap-1.5">
              <span>·</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded border border-border bg-background px-1.5 py-0.5 text-xs"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>{s} / page</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="size-8 p-0" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-2 text-xs font-medium tabular-nums">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" className="size-8 p-0" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DefaultEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted">
        <EyeOff className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No results found</p>
      <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
    </div>
  );
}
