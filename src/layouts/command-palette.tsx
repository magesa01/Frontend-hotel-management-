import { Command as CommandPrimitive } from 'cmdk';
import {
  Building2,
  CalendarRange,
  ClipboardList,
  DoorOpen,
  LayoutDashboard,
  Search,
  Star,
  UtensilsCrossed,
  UserCircle,
  BedDouble,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const PAGES = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Hotels', to: '/hotels', icon: Building2 },
  { label: 'Room Types', to: '/room-types', icon: BedDouble },
  { label: 'Rooms', to: '/rooms', icon: DoorOpen },
  { label: 'Bookings', to: '/bookings', icon: CalendarRange },
  { label: 'Restaurants', to: '/restaurants', icon: UtensilsCrossed },
  { label: 'Menu Items', to: '/menu-items', icon: ClipboardList },
  { label: 'Reviews', to: '/reviews', icon: Star },
  { label: 'Profile', to: '/profile', icon: UserCircle },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const run = (to: string) => {
    navigate(to);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-[50%] top-[20%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 [&>button:last-child]:hidden">
        <CommandPrimitive className="rounded-xl">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 text-muted-foreground" />
            <CommandInput placeholder="Search pages, hotels, bookings…" className="flex-1" />
          </div>
          <CommandList className="max-h-80">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {PAGES.map((page) => (
                <CommandItem key={page.to} value={page.label} onSelect={() => run(page.to)} className="gap-3">
                  <page.icon className="size-4 text-muted-foreground" />
                  <span>{page.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Quick actions">
              <CommandItem value="new hotel" onSelect={() => run('/hotels/new')} className="gap-3">
                <Building2 className="size-4 text-muted-foreground" />
                <span>Create new hotel</span>
              </CommandItem>
              <CommandItem value="new booking" onSelect={() => run('/bookings/new')} className="gap-3">
                <CalendarRange className="size-4 text-muted-foreground" />
                <span>Create new booking</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
