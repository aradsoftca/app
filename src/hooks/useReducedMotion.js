import { useState, useEffect } from 'react';

/**
 * Hook to detect prefers-reduced-motion media query
 * Returns true when the user prefers reduced motion
 */
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mq.matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

export default useReducedMotion;
