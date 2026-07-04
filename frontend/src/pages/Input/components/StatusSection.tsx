import type { UserProfile } from '../../../types';

const HOUSEHOLD_OPTIONS = ['已落户', '未落户'] as const;
const EMPLOYMENT_OPTIONS = ['已就业', '未就业'] as const;

interface StatusSectionProps {
  city?: string;
  employmentStatus?: UserProfile['employmentStatus'];
  householdStatus?: UserProfile['householdStatus'];
  firstShenzhenEmploymentDate?: string;
  showHousehold: boolean;
  showEmployment: boolean;
  onHouseholdChange: (status: UserProfile['householdStatus']) => void;
  onEmploymentChange: (status: UserProfile['employmentStatus']) => void;
  onFirstShenzhenEmploymentChange: (date: string | undefined) => void;
}

/**
 * 当前状态区域
 * 包含落户状态、就业状态、深圳首次就业时间
 */
export function StatusSection({
  city,
  employmentStatus,
  householdStatus,
  firstShenzhenEmploymentDate,
  showHousehold,
  showEmployment,
  onHouseholdChange,
  onEmploymentChange,
  onFirstShenzhenEmploymentChange,
}: StatusSectionProps) {
  if (!showHousehold && !showEmployment) return null;

  return (
    <section className="animate-fade-slide-in">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        当前状态
      </label>
      <div
        className={`mt-3 grid gap-4 ${showHousehold && showEmployment ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {showHousehold && (
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">落户状态</label>
            <div className="relative">
              <select
                value={householdStatus || ''}
                onChange={(e) => onHouseholdChange(e.target.value as UserProfile['householdStatus'])}
                className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
              >
                <option value="" disabled>
                  请选择落户状态
                </option>
                {HOUSEHOLD_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
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
        )}
        {showEmployment && (
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">就业状态</label>
            <div className="relative">
              <select
                value={employmentStatus || ''}
                onChange={(e) => {
                  const newStatus = e.target.value as UserProfile['employmentStatus'];
                  onEmploymentChange(newStatus);
                  // 切回未就业时清空首次在深时间
                  if (newStatus === '未就业') {
                    onFirstShenzhenEmploymentChange(undefined);
                  }
                }}
                className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
              >
                <option value="" disabled>
                  请选择就业状态
                </option>
                {EMPLOYMENT_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
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
        )}

        {/* 深圳：首次在深就业创业时间 */}
        {city === 'shenzhen' && employmentStatus === '已就业' && (
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-medium text-slate-500">
              首次在深就业创业时间
              <span className="ml-1 text-[10px] font-normal text-slate-400">
                （用于匹配 2026 青年人才新政）
              </span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: '2026-01-01', label: '2026年1月1日后第一次在深圳工作', desc: '符合新政' },
                { value: '2025-12-31', label: '2026年1月1日前已在深圳工作过', desc: '不符合新政' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFirstShenzhenEmploymentChange(opt.value || undefined)}
                  className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    firstShenzhenEmploymentDate === opt.value
                      ? 'border-civic-blue bg-civic-blue/5 text-civic-blue'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-civic-blue/30 hover:bg-paper'
                  }`}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="mt-1 text-xs opacity-80">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
