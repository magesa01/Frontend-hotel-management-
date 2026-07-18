import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface BreadcrumbContextValue {
  label: string | null;
  setLabel: (label: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [label, setLabelState] = useState<string | null>(null);
  const setLabel = useCallback((l: string | null) => setLabelState(l), []);
  return (
    <BreadcrumbContext.Provider value={{ label, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbContext(): BreadcrumbContextValue {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumbContext must be used within BreadcrumbProvider');
  return ctx;
}