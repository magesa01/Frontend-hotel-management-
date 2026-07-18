import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-gradient">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/dashboard"><Home className="size-4" /> Back to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard"><Compass className="size-4" /> Explore</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
