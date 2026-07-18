import { Link } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-danger/10">
          <ShieldX className="size-8 text-danger" />
        </div>
        <p className="font-display text-6xl font-bold text-gradient">403</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Access denied</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          You don't have permission to access this page. Contact an administrator if you believe this is an error.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard"><Home className="size-4" /> Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
