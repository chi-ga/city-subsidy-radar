import { useState, useCallback, useRef } from 'react';

/**
 * 泛化异步搜索 Hook，替代 useSchoolSearch / useMajorSearch 的重复代码。
 *
 * @param searchFn 异步搜索函数（返回数组）
 * @param debounceMs 防抖延迟（默认 300ms）
 */
export function useAsyncSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  debounceMs: number = 300
) {
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (query: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (!query || query.length < 1) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      timerRef.current = setTimeout(async () => {
        try {
          const matched = await searchFn(query);
          setResults(matched);
        } catch (error) {
          console.error('搜索失败:', error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, debounceMs);
    },
    [searchFn, debounceMs]
  );

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setResults([]);
    setIsSearching(false);
  }, []);

  return { results, isSearching, search, clear };
}
