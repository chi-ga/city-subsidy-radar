import { INNOVATION_ABILITY_OPTIONS } from '../../../data/lazyTalent';

interface InnovationAbilityFieldProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

/**
 * 深圳青年人才认定 · 创新能力类
 * 获得国内外奖项或参加学科/科技竞赛取得较好成绩
 */
export function InnovationAbilityField({ value, onChange }: InnovationAbilityFieldProps) {
  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        创新能力类（符合任一即可）
      </label>
      <p className="mt-1 text-xs text-slate-400">
        获得国内外奖项或参加学科/科技竞赛取得较好成绩
      </p>
      <div className="mt-3">
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          >
            <option value="">不符合 / 未选择</option>
            <optgroup label="国内外奖项">
              {INNOVATION_ABILITY_OPTIONS.filter((o) => o.group === '国内外奖项').map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="学科竞赛">
              {INNOVATION_ABILITY_OPTIONS.filter((o) => o.group === '学科竞赛').map((o) => (
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
