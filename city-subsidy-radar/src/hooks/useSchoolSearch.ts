import { useCallback } from 'react';
import { useAsyncSearch } from './useAsyncSearch';
import { searchSchoolsAsync } from '../data/lazySchools';
import type { School } from '../types';

/**
 * 院校搜索 Hook（基于泛化 useAsyncSearch）
 */
export function useSchoolSearch(debounceMs: number = 300) {
  const searchFn = useCallback((query: string) => searchSchoolsAsync(query), []);
  return useAsyncSearch<School>(searchFn, debounceMs);
}
