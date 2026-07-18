import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title = 'Nothing here yet', description = 'Get started by creating your first item.', icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-muted">
        {icon ?? <Inbox className="size-7 text-muted-foreground" />}
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message = 'An unexpected error occurred while loading this content.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-danger/10">
        <AlertTriangle className="size-7 text-danger" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      )}
    </div>
  );
}

interface ApiStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  children: ReactNode;
  skeleton?: ReactNode;
}

export function ApiState({
  isLoading,
  isError,
  error,
  onRetry,
  empty,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  children,
  skeleton,
}: ApiStateProps) {
  if (isLoading) return <>{skeleton ?? <DefaultSkeleton />}</>;
  if (isError) {
    const message = error instanceof Error ? error.message : undefined;
    return <ErrorState message={message} onRetry={onRetry} />;
  }
  if (empty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} action={emptyAction} />;
  }
  return <>{children}</>;
}

function DefaultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export function ServerErrorState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="grid size-20 place-items-center rounded-3xl bg-danger/10">
        <ServerCrash className="size-9 text-danger" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold">Server error</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          We're having trouble reaching the server. Please try again in a moment.
        </p>
      </div>
    </div>
  );
}
