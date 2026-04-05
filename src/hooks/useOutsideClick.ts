import { useEffect } from 'react';

export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback, enabled]);
}
