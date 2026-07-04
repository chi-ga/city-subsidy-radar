import type { UserProfile } from '../../../types';

interface ReturneeStatusFieldProps {
  value?: UserProfile['returneeStatus'];
  onChange: (value: UserProfile['returneeStatus']) => void;
}

/**
 * 上海留学回国时间状态
 * 留学回国人员落户要求回国后两年内来沪工作
 * 仅境外高校显示
 */
export function ReturneeStatusField({ value, onChange }: ReturneeStatusFieldProps) {
  return (
    <section className="animate-fade-slide-in">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        留学回国时间
      </label>
      <p className="mt-1 text-xs text-slate-400">
        留学回国人员落户要求回国后两年内来沪工作
      </p>
      <div className="mt-3">
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => onChange((e.target.value || undefined) as UserProfile['returneeStatus'])}
            className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          >
            <option value="" disabled>
              请选择回国时间
            </option>
            <option value="within_2_years">回国2年内</option>
            <option value="over_2_years">回国2年以上</option>
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
