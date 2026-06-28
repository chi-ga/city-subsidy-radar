import { useCallback } from 'react';
import { useAsyncSearch } from './useAsyncSearch';
import { searchMajorsAsync } from '../data/lazyMajors';
import type { MajorItem } from '../data/lazyMajors';

/**
 * 专业搜索 Hook（基于泛化 useAsyncSearch）
 */
export function useMajorSearch(debounceMs: number = 300) {
  const searchFn = useCallback((query: string) => searchMajorsAsync(query), []);
  return useAsyncSearch<MajorItem>(searchFn, debounceMs);
}
