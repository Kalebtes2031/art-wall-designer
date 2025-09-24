/**
 * Creates a debounced version of a function that delays invoking until after `wait` milliseconds
 * have elapsed since the last time it was invoked.
 *
 * @param fn - The function to debounce
 * @param wait - The delay in milliseconds
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
