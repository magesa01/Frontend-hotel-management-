import { useEffect } from 'react';

export function useKeyCombo(combo: string, handler: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const parts = combo.toLowerCase().split('+');
      const needMeta = parts.includes('cmd') || parts.includes('ctrl');
      const key = parts[parts.length - 1];
      if ((needMeta && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key) || (!needMeta && e.key.toLowerCase() === key)) {
        e.preventDefault();
        handler();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combo, handler]);
}
