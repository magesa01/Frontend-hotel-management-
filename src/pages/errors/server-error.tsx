import { Link } from 'react-router-dom';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ServerErrorPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-danger/10">
          <ServerCrash className="size-8 text-danger" />
        </div>
        <p className="font-display text-6xl font-bold text-gradient">500</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Server error</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Something went wrong on our end. Our team has been notified. Please try again shortly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/dashboard"><Home className="size-4" /> Back to dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" /> Reload page
          </Button>
        </div>
      </div>
    </div>
  );
}
