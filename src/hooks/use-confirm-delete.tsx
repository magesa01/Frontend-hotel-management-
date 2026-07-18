import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

interface UseConfirmDeleteOptions {
  title?: string;
  message: (id: string) => string;
  confirmLabel?: string;
  onConfirm: (id: string) => Promise<void> | void;
  onSuccess?: (id: string) => void;
}

export function useConfirmDelete({
  title = 'Delete item',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onSuccess,
}: UseConfirmDeleteOptions) {
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = (id: string) => {
    setTargetId(id);
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      await onConfirm(targetId);
      toast.success('Item deleted successfully');
      onSuccess?.(targetId);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const dialog = (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={targetId ? message(targetId) : ''}
      confirmLabel={confirmLabel}
      destructive
      loading={loading}
      onConfirm={handleConfirm}
    />
  );

  return { request, dialog };
}
