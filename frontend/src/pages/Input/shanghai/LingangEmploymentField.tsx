import { CheckboxField } from '../shared/CheckboxField';

interface LingangEmploymentFieldProps {
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}

/**
 * 上海临港首次就业判断
 * 临港安家补贴要求在临港新片区产城融合区首次就业和居住
 * 仅浦东新区显示
 */
export function LingangEmploymentField({ value, onChange }: LingangEmploymentFieldProps) {
  return (
    <section className="animate-fade-slide-in">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        是否首次在临港就业
      </label>
      <p className="mt-1 text-xs text-slate-400">
        临港安家补贴要求在临港新片区产城融合区首次就业和居住
      </p>
      <div className="mt-3">
        <CheckboxField
          checked={value === true}
          onChange={(checked) => onChange(checked ? true : undefined)}
          label="是，我是第一次在临港新片区工作和居住"
        />
      </div>
    </section>
  );
}
