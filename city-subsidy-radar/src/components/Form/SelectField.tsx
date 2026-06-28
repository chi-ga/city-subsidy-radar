import type { ReactNode } from 'react';

interface SelectFieldProps {
  label: string;
  labelHint?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

/**
 * 通用 Select 下拉选择字段
 * 包含 label + chevron 图标 + 可选描述 + 错误提示
 */
export function SelectField({
  label,
  labelHint,
  description,
  value,
  onChange,
  onBlur,
  disabled,
  error,
  children,
  className = '',
}: SelectFieldProps) {
  return (
    <section className={className}>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        {label}
        {labelHint && (
          <span className="ml-1 text-xs font-normal text-slate-400">{labelHint}</span>
        )}
      </label>
      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
      <div className="mt-3">
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            className={`block w-full appearance-none rounded-xl border bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${
              error ? 'border-red-300' : 'border-slate-200'
            }`}
          >
            {children}
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
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    </section>
  );
}
