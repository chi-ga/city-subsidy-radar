import type { TopStudentPlanBase } from '../../../data/lazyTalent';

interface TopStudentPlanFieldProps {
  bases: TopStudentPlanBase[];
  school: string;
  value?: string;
  inTopStudentPlan?: boolean;
  onChange: (baseName: string | undefined, inPlan: boolean) => void;
}

/**
 * 深圳青年人才认定 · 拔尖计划基地选择
 * 仅当用户所在学校有拔尖计划基地时显示
 */
export function TopStudentPlanField({
  bases,
  school,
  value,
  onChange,
}: TopStudentPlanFieldProps) {
  if (bases.length === 0) return null;

  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        是否入选国家高校拔尖创新人才计划
        <span className="ml-1 text-xs font-normal text-slate-400">
          （{school} 设有拔尖计划基地）
        </span>
      </label>
      <div className="mt-3">
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v || undefined, !!v);
            }}
            className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          >
            <option value="">未入选 / 未选择</option>
            {bases.map((b) => (
              <option key={`${b.university}-${b.seq}`} value={b.base_name}>
                {b.base_name} · {b.category}
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
    </section>
  );
}
