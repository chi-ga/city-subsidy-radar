/**
 * @deprecated 此模块已废弃，表单缓存已合并到 userStore（persist 中间件）。
 * 以下函数保留向后兼容，内部委托给 userStore。
 * 迁移完成后应删除此文件，直接使用 useUserStore。
 */
import { useUserStore } from '../stores/userStore';
import type { UserProfile } from '../types';

/** @deprecated 使用 useUserStore.setProfile 替代 */
export function saveFormCache(data: Partial<UserProfile>): void {
  try {
    useUserStore.getState().setProfile(data);
  } catch {
    // 静默失败
  }
}

/** @deprecated 使用 useUserStore.profile 替代 */
export function loadFormCache(): Partial<UserProfile> | null {
  try {
    const profile = useUserStore.getState().profile;
    // 如果 profile 是空对象（所有字段 undefined），返回 null
    const hasData = Object.values(profile).some(
      (v) => v !== undefined && v !== '' && v !== null && !(Array.isArray(v) && v.length === 0)
    );
    return hasData ? profile : null;
  } catch {
    return null;
  }
}

/** @deprecated 使用 useUserStore.resetProfile 替代 */
export function clearFormCache(): void {
  try {
    useUserStore.getState().resetProfile();
  } catch {
    // 静默失败
  }
}
