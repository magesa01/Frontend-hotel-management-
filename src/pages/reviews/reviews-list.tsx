import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/states';
import { RatingStars, RatingBadge } from '@/components/shared/rating-stars';
import { useTableFilters } from '@/hooks/use-table-filters';
import { useReviews, useDeleteReview } from '@/hooks/resource-hooks';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import type { Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { parseISO } from 'date-fns';

export default function ReviewsList() {
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const { params, setSearch, setPage, setPageSize, setSort } = useTableFilters({ pageSize: 12, sortBy: 'createdAt', sortDir: 'desc' });
  const allReviewsQ = useReviews();
  const deleteMut = useDeleteReview();
  const hotelsQ = useHotelsLookup();
  const hotelName = (id: string) => hotelsQ.data?.find((h) => h.id === id)?.name ?? '—';

  const { request, dialog } = useConfirmDelete({
    message: () => 'This review will be permanently removed.',
    onConfirm: async (id) => { await deleteMut.mutateAsync(id); },
    onSuccess: () => allReviewsQ.refetch(),
  });

  const filteredSorted = useMemo(() => {
    let items = allReviewsQ.data?.items ?? [];

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (r) => r.authorName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q)
      );
    }

    if (params.sortBy) {
      const dir = params.sortDir === 'desc' ? -1 : 1;
      const key = params.sortBy as keyof Review;
      items = [...items].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av === bv) return 0;
        return (av as any) > (bv as any) ? dir : -dir;
      });
    }

    return items;
  }, [allReviewsQ.data, params.search, params.sortBy, params.sortDir]);

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const avgRating = filteredSorted.length ? filteredSorted.reduce((s, r) => s + r.rating, 0) / filteredSorted.length : 0;

  const columns: Column<Review>[] = [
    { key: 'authorName', header: 'Author', sortable: true, cell: (r) => (
      <div className="flex items-center gap-2"><Avatar className="size-8"><AvatarImage src={r.authorAvatarUrl} /><AvatarFallback className="text-2xs">{r.authorName.slice(0,2).toUpperCase()}</AvatarFallback></Avatar><span className="text-sm font-medium">{r.authorName}</span></div>
    )},
    { key: 'hotelId', header: 'Hotel', sortable: true, cell: (r) => <span className="text-sm text-muted-foreground">{hotelName(r.hotelId)}</span> },
    { key: 'rating', header: 'Rating', sortable: true, cell: (r) => <RatingStars value={r.rating} size={14} readonly /> },
    { key: 'comment', header: 'Comment', cell: (r) => <span className="line-clamp-2 text-sm text-muted-foreground">{r.comment}</span> },
    { key: 'createdAt', header: 'Date', sortable: true, cell: (r) => <span className="text-sm text-muted-foreground">{format(parseISO(r.createdAt), 'MMM d, yyyy')}</span> },
    { key: 'actions', header: '', hideable: false, cell: (r) => <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); request(r.id); }}>Delete</Button> },
  ];

  return (
    <div>
      <PageHeader title="Reviews" description="Guest feedback across all properties" icon={<Star className="size-5" />}
        actions={<div className="flex rounded-lg border border-border p-0.5">
          <button onClick={() => setView('cards')} className={view === 'cards' ? 'rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground' : 'rounded-md px-3 py-1 text-xs text-muted-foreground'}>Cards</button>
          <button onClick={() => setView('table')} className={view === 'table' ? 'rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground' : 'rounded-md px-3 py-1 text-xs text-muted-foreground'}>Table</button>
        </div>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Average rating</p>
          <p className="mt-2 font-display text-3xl font-bold text-gradient">{avgRating.toFixed(1)}</p>
          <div className="mt-1"><RatingStars value={avgRating} size={14} readonly /></div>
        </Card>
        <Card className="p-5">
          <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Total reviews</p>
          <p className="mt-2 font-display text-3xl font-bold">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">5-star reviews</p>
          <p className="mt-2 font-display text-3xl font-bold text-success">{filteredSorted.filter((r) => r.rating === 5).length}</p>
          <p className="mt-1 flex items-center gap-1 text-2xs text-success"><TrendingUp className="size-3" /> High satisfaction</p>
        </Card>
      </div>

      {view === 'cards' ? (
        allReviewsQ.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />)}</div>
        : pageItems.length === 0 ? <EmptyState title="No reviews yet" icon={<Star className="size-7 text-muted-foreground" />} />
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((r, i) => (
              <motion.div key={r.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <Card className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 border border-border"><AvatarImage src={r.authorAvatarUrl} /><AvatarFallback className="text-2xs font-semibold">{r.authorName.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.authorName}</p>
                      <p className="truncate text-2xs text-muted-foreground">{hotelName(r.hotelId)}</p>
                    </div>
                    <RatingBadge value={r.rating} />
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{r.comment}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-2xs text-muted-foreground/70">{format(parseISO(r.createdAt), 'MMM d, yyyy')}</p>
                    <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => request(r.id)}>Delete</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
      ) : (
        <DataTable columns={columns} rows={pageItems} total={total} page={page} pageSize={pageSize} totalPages={totalPages}
          search={params.search ?? ''} sortBy={params.sortBy} sortDir={params.sortDir as 'asc'|'desc'} onSearchChange={setSearch} onSortChange={setSort} onPageChange={setPage} onPageSizeChange={setPageSize}
          searchPlaceholder="Search reviews…" exportFilename="reviews" loading={allReviewsQ.isLoading}
          emptyState={<EmptyState title="No reviews found" icon={<Star className="size-7 text-muted-foreground" />} />} />
      )}
      {dialog}
    </div>
  );
}