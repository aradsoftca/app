import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for debouncing a value.
 * Returns the debounced version of the input value.
 * 
 * Usage:
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 *   
 *   useEffect(() => {
 *     // Only fires 300ms after user stops typing
 *     fetchResults(debouncedSearch);
 *   }, [debouncedSearch]);
 * 
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {*} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for creating a debounced callback function.
 * 
 * Usage:
 *   const debouncedSearch = useDebouncedCallback((term) => {
 *     apiService.search(term);
 *   }, 500);
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} The debounced callback
 */
export function useDebouncedCallback(callback, delay = 300) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  callbackRef.current = callback;

  const debouncedFn = useCallback((...args) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}

export default useDebounce;
