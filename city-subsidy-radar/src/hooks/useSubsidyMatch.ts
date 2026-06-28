import { useCallback } from 'react';
import { matchAllSubsidies, applyDistrictFilter, filterByTier } from '../utils';
import { getSubsidiesByCity, getAllSubsidies } from '../data';
import type { UserProfile, MatchResult, Subsidy } from '../types';
import type { CityCode } from '../constants';

export function useSubsidyMatch() {
  /** 主匹配：仅 tier 1 + 2（大众普惠 + 细分追问） */
  const match = useCallback((user: UserProfile): MatchResult => {
    const all = user.city
      ? getSubsidiesByCity(user.city)
      : getAllSubsidies();
    const filtered = applyDistrictFilter(all, user.district);
    const subsidies = filterByTier(filtered, [1, 2]);
    return matchAllSubsidies(user, subsidies);
  }, []);

  /** 多城对比：仅匹配 tier 1（大众普惠层）
   *  原因：对比模式只收集 5 个硬性基础问题，tier 2 的细分追问条件
   *  （企业类型、人才认定、创新创业等）未收集，避免大量高金额政策误匹配。
   */
  const matchMultipleCities = useCallback(
    (user: UserProfile, cities: CityCode[]): Record<string, MatchResult> => {
      const results: Record<string, MatchResult> = {};
      cities.forEach((city) => {
        const cityUser = { ...user, city };
        const citySubsidies = getSubsidiesByCity(city);
        const filtered = applyDistrictFilter(citySubsidies, user.district);
        const subsidies = filterByTier(filtered, [1]);
        results[city] = matchAllSubsidies(cityUser, subsidies);
      });
      return results;
    },
    []
  );

  /** 获取 tier 3 专业通道政策（不参与自动匹配，仅展示入口） */
  const getProfessionalChannels = useCallback((user: UserProfile): Subsidy[] => {
    const all = user.city
      ? getSubsidiesByCity(user.city)
      : getAllSubsidies();
    const filtered = applyDistrictFilter(all, user.district);
    return filterByTier(filtered, [3]);
  }, []);

  return { match, matchMultipleCities, getProfessionalChannels };
}
