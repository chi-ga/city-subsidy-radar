import type { UserProfile } from '../../../types';
import { CheckboxField } from '../shared/CheckboxField';

const DEGREES = ['专科', '本科', '硕士', '博士'] as const;

interface DegreeSelectorProps {
  value?: string;
  city?: string;
  isFullTime?: boolean;
  hasDoubleDegree?: boolean;
  showFullTime: boolean;
  onChange: (degree: string) => void;
  onFullTimeChange: (isFullTime: boolean | undefined) => void;
  onDoubleDegreeChange: (hasDoubleDegree: boolean | undefined) => void;
  error?: string;
  onBlur: () => void;
}

/**
 * 学历选择器
 * 包含学历下拉、双学位复选框（深圳）、全日制复选框
 */
export function DegreeSelector({
  value,
  city,
  isFullTime,
  hasDoubleDegree,
  showFullTime,
  onChange,
  onFullTimeChange,
  onDoubleDegreeChange,
  error,
  onBlur,
}: DegreeSelectorProps) {
  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        学历
      </label>
      <div className="relative mt-3">
        <select
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value as UserProfile['degree']);
          }}
          onBlur={onBlur}
          className={`block w-full appearance-none rounded-xl border bg-white px-4 py-3.5 pr-10 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20 ${
            error ? 'border-seal-red/30' : 'border-slate-200'
          }`}
        >
          <option value="" disabled>
            请选择学历
          </option>
          {DEGREES.map((degree) => (
            <option key={degree} value={degree}>
              {degree}
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
      {error && <p className="mt-1.5 text-xs text-seal-red">{error}</p>}

      {/* 双学位复选框：仅深圳且本科/硕士时显示 */}
      {city === 'shenzhen' && (value === '本科' || value === '硕士') && (
        <div className="mt-2">
          <CheckboxField
            checked={hasDoubleDegree === true}
            onChange={(checked) => onDoubleDegreeChange(checked ? true : undefined)}
            label="持有双学位"
            description="部分落户补贴要求双学位才给满额"
          />
        </div>
      )}

      {/* 全日制/非全日制复选框：本科及以上时显示 */}
      {value && value !== '专科' && showFullTime && (
        <div className="mt-2">
          <CheckboxField
            checked={isFullTime === true}
            onChange={(checked) => onFullTimeChange(checked ? true : undefined)}
            label="全日制学历"
            description="部分补贴要求全日制学历方可申领"
          />
        </div>
      )}
    </section>
  );
}
