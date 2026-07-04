import type { UserProfile } from '../../../types';

interface IdentityTypeFieldProps {
  value?: UserProfile['identityType'];
  onChange: (value: UserProfile['identityType']) => void;
}

/**
 * 身份类型选择器
 * 用于匹配港澳台/外籍专属补贴（如前海港澳青年政策）
 * 仅前海等有港澳台专属政策的区域显示
 */
export function IdentityTypeField({ value, onChange }: IdentityTypeFieldProps) {
  return (
    <section className="animate-fade-slide-in">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        身份类型
        <span className="ml-1 text-xs font-normal text-slate-400">
          （用于匹配港澳台/外籍专属补贴）
        </span>
      </label>
      <p className="mt-1 text-xs text-slate-400">
        部分补贴（如前海港澳青年）仅限港澳台居民申领
      </p>
      <div className="mt-3">
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) =>
              onChange((e.target.value || undefined) as UserProfile['identityType'])
            }
            className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          >
            <option value="">内地居民（默认）</option>
            <option value="港澳居民">港澳居民</option>
            <option value="台湾居民">台湾居民</option>
            <option value="外籍人士">外籍人士</option>
          </select>
          <svg
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
