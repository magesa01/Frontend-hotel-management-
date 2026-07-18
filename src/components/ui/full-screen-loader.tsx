import { Hotel } from 'lucide-react';

export function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary-600 text-primary-foreground shadow-glow">
            <Hotel className="size-7" />
          </div>
          <span className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-pulse-ring" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
