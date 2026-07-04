import { INNOVATION_CONTRIBUTION_OPTIONS } from '../../../data/lazyTalent';

interface InnovationContributionFieldProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

/**
 * 深圳青年人才认定 · 创新贡献类
 * 创业人才获投资/任职经历，或在 GitHub/Gitee 平台贡献度达标
 */
export function InnovationContributionField({ value, onChange }: InnovationContributionFieldProps) {
  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        创新贡献类（符合任一即可）
      </label>
      <p className="mt-1 text-xs text-slate-400">
        创业人才获投资/任职经历，或在 GitHub/Gitee 平台贡献度达标
      </p>
      <div className="mt-3">
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          >
            <option value="">不符合 / 未选择</option>
            <optgroup label="创业人才">
              {INNOVATION_CONTRIBUTION_OPTIONS.filter((o) => o.group === '创业人才').map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="代码平台贡献">
              {INNOVATION_CONTRIBUTION_OPTIONS.filter((o) => o.group === '代码平台贡献').map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
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
