import type { UserProfile } from '../../../types';

interface HuaduImportStatusFieldProps {
  value?: UserProfile['huaduImportStatus'];
  onChange: (value: UserProfile['huaduImportStatus']) => void;
}

/**
 * 广州花都引进时间状态
 * 花都区引进人才要求2023年1月1日后新引进
 * 仅花都区显示
 */
export function HuaduImportStatusField({ value, onChange }: HuaduImportStatusFieldProps) {
  return (
    <section className="animate-fade-slide-in">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        引进时间
      </label>
      <p className="mt-1 text-xs text-slate-400">
        花都区引进人才要求2023年1月1日后新引进
      </p>
      <div className="mt-3">
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => onChange((e.target.value || undefined) as UserProfile['huaduImportStatus'])}
            className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          >
            <option value="" disabled>
              请选择引进时间
            </option>
            <option value="after_2023">2023年1月1日后新引进花都区</option>
            <option value="before_2023">2023年1月1日前已在花都工作</option>
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
