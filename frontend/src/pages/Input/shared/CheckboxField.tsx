interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: string;
  className?: string;
}

/**
 * 统一样式的复选框字段
 */
export function CheckboxField({
  checked,
  onChange,
  label,
  description,
  className = '',
}: CheckboxFieldProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:border-civic-blue/30 hover:bg-civic-blue/5/30 ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-civic-blue focus:ring-civic-blue"
      />
      <span className="text-slate-700">
        {label}
        {description && (
          <span className="ml-1 text-xs text-slate-400">（{description}）</span>
        )}
      </span>
    </label>
  );
}
