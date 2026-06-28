import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile } from '../types';

interface UserState {
  /** 用户问卷数据（持久化到 sessionStorage，替代原 formCache） */
  profile: Partial<UserProfile>;
  /** 更新部分字段（合并写入） */
  setProfile: (profile: Partial<UserProfile>) => void;
  /** 整体重置为空表单 */
  resetProfile: () => void;
}

const initialProfile: Partial<UserProfile> = {
  city: undefined,
  school: '',
  schoolLevel: [],
  degree: undefined,
  major: '',
  age: undefined as unknown as number,
  graduationYear: undefined,
  householdStatus: undefined,
  employmentStatus: undefined,
};

/**
 * userStore 使用 persist 中间件持久化到 sessionStorage，
 * 兼容旧版 formCache 的缓存键名 'subsidy-radar-form-cache'。
 *
 * 迁移策略：首次加载时若新键不存在但旧键存在，自动迁移旧数据。
 */
function migrateOldCache(): Partial<UserProfile> | undefined {
  try {
    const OLD_KEY = 'subsidy-radar-form-cache';
    const oldRaw = sessionStorage.getItem(OLD_KEY);
    if (oldRaw) {
      const oldData = JSON.parse(oldRaw) as Partial<UserProfile>;
      // 清理旧缓存，避免重复迁移
      sessionStorage.removeItem(OLD_KEY);
      return oldData;
    }
  } catch {
    // 静默失败
  }
  return undefined;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: { ...initialProfile },
      setProfile: (profile) =>
        set((state) => ({
          profile: { ...state.profile, ...profile },
        })),
      resetProfile: () => set({ profile: { ...initialProfile } }),
    }),
    {
      name: 'subsidy-radar-user-profile',
      storage: createJSONStorage(() => sessionStorage),
      // 迁移：版本 0 → 1，从旧 formCache 键迁移
      version: 1,
      migrate: (_persistedState: unknown, version: number) => {
        if (version === 0) {
          const oldData = migrateOldCache();
          if (oldData) {
            return { profile: { ...initialProfile, ...oldData } } as UserState;
          }
        }
        return _persistedState as UserState;
      },
    }
  )
);
