import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, MatchResult } from '../types';
import type { CityCode } from '../constants';
import { CITY_NAMES } from '../constants';

/** 查询类型 */
export type QueryType = 'single' | 'compare';

/** profile 快照：仅保留恢复查询所需的核心字段 */
export interface ProfileSnapshot {
  city?: CityCode;
  school: string;
  degree?: UserProfile['degree'];
  major: string;
  age: number;
  graduationYear?: UserProfile['graduationYear'];
  householdStatus?: UserProfile['householdStatus'];
  employmentStatus?: UserProfile['employmentStatus'];
  district?: string;
}

/** 结果摘要 */
export interface ResultSummary {
  matchedCount: number;
  totalAmount: number;
  topSubsidyNames: string[];
  nearMissCount: number;
}

/** 对比排名条目 */
export interface CompareRankingEntry {
  city: CityCode;
  cityName: string;
  totalAmount: number;
  matchedCount: number;
}

/** 历史记录 */
export interface HistoryRecord {
  id: string;
  createdAt: number;
  queryType: QueryType;
  profileSnapshot: ProfileSnapshot;
  resultSummary: ResultSummary;
  /** 仅 compare 类型使用 */
  compareRanking?: CompareRankingEntry[];
}

const MAX_RECORDS = 20;
const STORAGE_KEY = 'subsidy-radar-history';

/**
 * 根据 profile 核心字段生成指纹，用于去重。
 * 相同指纹视为同一查询，不重复写入。
 */
function makeFingerprint(snapshot: ProfileSnapshot): string {
  return [
    snapshot.city ?? '',
    snapshot.school ?? '',
    snapshot.degree ?? '',
    snapshot.major ?? '',
    snapshot.age ?? '',
    snapshot.graduationYear ?? '',
    snapshot.householdStatus ?? '',
    snapshot.employmentStatus ?? '',
    snapshot.district ?? '',
  ].join('|');
}

/** 从完整 profile 提取快照（只存核心字段） */
export function extractSnapshot(profile: Partial<UserProfile>): ProfileSnapshot {
  return {
    city: profile.city,
    school: profile.school ?? '',
    degree: profile.degree,
    major: profile.major ?? '',
    age: profile.age ?? 0,
    graduationYear: profile.graduationYear,
    householdStatus: profile.householdStatus,
    employmentStatus: profile.employmentStatus,
    district: profile.district,
  };
}

/** 从单城市 MatchResult 提取摘要 */
export function summarizeSingleResult(result: MatchResult): ResultSummary {
  const matched = result.subsidies.filter((s) => s.matched && s.matchedAmount > 0);
  return {
    matchedCount: matched.length,
    totalAmount: result.totalAmount,
    topSubsidyNames: matched.slice(0, 3).map((s) => s.subsidy.name),
    nearMissCount: result.nearMissItems?.length ?? 0,
  };
}

/** 从多城市对比结果提取排名 */
export function buildCompareRanking(
  compareResults: Record<string, MatchResult>
): CompareRankingEntry[] {
  return Object.entries(compareResults)
    .map(([city, result]) => ({
      city: city as CityCode,
      cityName: CITY_NAMES[city as CityCode] ?? city,
      totalAmount: result.totalAmount,
      matchedCount: result.subsidies.filter((s) => s.matched).length,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

/** 从对比结果中取汇总信息 */
export function summarizeCompareResult(
  compareResults: Record<string, MatchResult>
): ResultSummary {
  const ranking = buildCompareRanking(compareResults);
  const topCity = ranking[0];
  const allMatched = Object.values(compareResults).reduce(
    (sum, r) => sum + r.subsidies.filter((s) => s.matched).length,
    0
  );
  const topResult = topCity ? compareResults[topCity.city] : null;
  return {
    matchedCount: allMatched,
    totalAmount: topCity?.totalAmount ?? 0,
    topSubsidyNames: topResult
      ? topResult.subsidies
          .filter((s) => s.matched && s.matchedAmount > 0)
          .slice(0, 3)
          .map((s) => s.subsidy.name)
      : [],
    nearMissCount: 0,
  };
}

interface HistoryState {
  records: HistoryRecord[];
  addRecord: (record: Omit<HistoryRecord, 'id' | 'createdAt'>) => void;
  removeRecord: (id: string) => void;
  clearHistory: () => void;
  exportHistory: () => void;
}

/** 安全写入 localStorage：失败时删最旧 5 条重试 */
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    // 配额超限或写入失败，尝试清理后重试
    return false;
  }
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (record) => {
        const { records } = get();
        const fingerprint = makeFingerprint(record.profileSnapshot);

        // 去重：相同指纹移除旧记录，保留新记录
        const filtered = records.filter(
          (r) => makeFingerprint(r.profileSnapshot) !== fingerprint
        );

        const newRecord: HistoryRecord = {
          ...record,
          id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
        };

        let next = [newRecord, ...filtered];

        // 超出上限删除最旧
        if (next.length > MAX_RECORDS) {
          next = next.slice(0, MAX_RECORDS);
        }

        set({ records: next });
      },

      removeRecord: (id) => {
        set({ records: get().records.filter((r) => r.id !== id) });
      },

      clearHistory: () => set({ records: [] }),

      exportHistory: () => {
        const { records } = get();
        const data = {
          exportedAt: new Date().toISOString(),
          app: '城市补贴雷达',
          totalRecords: records.length,
          records: records,
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subsidy-history-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => {
        // 自定义 storage 包装：写入失败时自动删最旧 5 条重试
        const nativeStorage = localStorage;
        return {
          getItem: (name: string) => nativeStorage.getItem(name),
          setItem: (name: string, value: string) => {
            if (safeSetItem(name, value)) return;
            // 第一次失败：读取当前持久化数据，删最旧 5 条后重试
            try {
              const raw = nativeStorage.getItem(name);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.state?.records?.length > 5) {
                  parsed.state.records = parsed.state.records.slice(0, -5);
                  const trimmed = JSON.stringify(parsed);
                  if (safeSetItem(name, trimmed)) return;
                }
              }
            } catch {
              // 解析失败，忽略
            }
            // 最终兜底：清空重试
            try {
              nativeStorage.setItem(name, value);
            } catch {
              // 彻底失败，静默
            }
          },
          removeItem: (name: string) => nativeStorage.removeItem(name),
        };
      }),
    }
  )
);
