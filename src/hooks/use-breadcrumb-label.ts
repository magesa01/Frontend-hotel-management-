import { useEffect } from 'react';
import { useBreadcrumbContext } from '@/contexts/breadcrumb-context';

/** Call from any detail page once its data loads to replace the raw URL id in the breadcrumb. */
export function useBreadcrumbLabel(label: string | undefined) {
  const { setLabel } = useBreadcrumbContext();
  useEffect(() => {
    setLabel(label ?? null);
    return () => setLabel(null); // reset when leaving the page
  }, [label, setLabel]);
}