import type { UserProfile } from '../../../types';

const GRADUATION_OPTIONS = [
  { value: 'within_2_years' as const, label: '毕业2年内' },
  { value: 'over_2_years' as const, label: '毕业2年以上' },
];

interface PersonalInfoSectionProps {
  age?: number;
  graduationYear?: UserProfile['graduationYear'];
  showAge: boolean;
  showGraduationYear: boolean;
  fieldErrors: Record<string, string>;
  onAgeChange: (age: number | undefined) => void;
  onGraduationYearChange: (year: UserProfile['graduationYear']) => void;
  onBlur: (field: string, value: any) => void;
  clearFieldError: (field: string) => void;
}

/**
 * 个人情况区域
 * 包含年龄输入和毕业年份选择
 */
export function PersonalInfoSection({
  age,
  graduationYear,
  showAge,
  showGraduationYear,
  fieldErrors,
  onAgeChange,
  onGraduationYearChange,
  onBlur,
  clearFieldError,
}: PersonalInfoSectionProps) {
  if (!showAge && !showGraduationYear) return null;

  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        个人情况
      </label>
      <div
        className={`mt-3 grid gap-4 ${showAge && showGraduationYear ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {showAge && (
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">年龄</label>
            <input
              type="number"
              value={age ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  onAgeChange(undefined);
                  return;
                }
                const v = Number(raw);
                if (Number.isNaN(v)) return;
                onAgeChange(v);
                clearFieldError('age');
              }}
              onBlur={() => onBlur('age', age)}
              placeholder="18-50"
              min={18}
              max={50}
              className={`block w-full rounded-xl border bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-civic-blue/20 ${
                fieldErrors.age ? 'border-seal-red/30' : 'border-slate-200'
              }`}
            />
            {fieldErrors.age && <p className="mt-1.5 text-xs text-seal-red">{fieldErrors.age}</p>}
          </div>
        )}
        {showGraduationYear && (
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">毕业年份</label>
            <div className="relative">
              <select
                value={graduationYear || ''}
                onChange={(e) =>
                  onGraduationYearChange(
                    (e.target.value || undefined) as UserProfile['graduationYear']
                  )
                }
                className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
              >
                <option value="" disabled>
                  请选择
                </option>
                {GRADUATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
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
      </div>
    </section>
  );
}
