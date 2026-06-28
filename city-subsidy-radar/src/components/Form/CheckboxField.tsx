interface CheckboxFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/**
 * 通用 Checkbox 卡片字段
 * 包含 label + checkbox + 可选描述
 */
export function CheckboxField({
  label,
  description,
  checked,
  onChange,
  className = '',
}: CheckboxFieldProps) {
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-slate-700">
          {label}
          {description && (
            <span className="ml-1 text-xs text-slate-400">{description}</span>
          )}
        </span>
      </label>
    </div>
  );
}
