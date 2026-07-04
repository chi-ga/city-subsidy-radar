import { CheckboxField } from '../shared/CheckboxField';

interface STEMFieldProps {
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}

/**
 * 深圳青年人才认定 · STEM 判断
 * 仅境外高校显示，用户需自行确认专业是否属于 STEM 范畴
 */
export function STEMField({ value, onChange }: STEMFieldProps) {
  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        所学专业是否属于 STEM（科学/技术/工程/数学）
      </label>
      <p className="mt-1 text-xs text-slate-400">
        境外高校需自行确认专业是否属于 STEM 范畴
      </p>
      <div className="mt-3">
        <CheckboxField
          checked={value === true}
          onChange={(checked) => onChange(checked ? true : undefined)}
          label="是，我的专业属于 STEM（科学/技术/工程/数学）"
        />
      </div>
    </section>
  );
}
