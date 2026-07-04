import { CheckboxField } from '../shared/CheckboxField';

interface ThreeCitiesOneDistrictFieldProps {
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}

/**
 * 北京三城一区判断
 * "三城一区"指中关村科学城、怀柔科学城、未来科学城、北京经济技术开发区，可放宽年龄至50周岁
 */
export function ThreeCitiesOneDistrictField({ value, onChange }: ThreeCitiesOneDistrictFieldProps) {
  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        工作区域
        <span className="ml-1 text-xs font-normal text-slate-400">（可选，影响年龄限制）</span>
      </label>
      <p className="mt-1 text-xs text-slate-400">
        "三城一区"指中关村科学城、怀柔科学城、未来科学城、北京经济技术开发区，可放宽年龄至50周岁
      </p>
      <div className="mt-3">
        <CheckboxField
          checked={value === true}
          onChange={(checked) => onChange(checked ? true : undefined)}
          label={'我在"三城一区"工作（中关村科学城/怀柔科学城/未来科学城/北京经济技术开发区）'}
        />
      </div>
    </section>
  );
}
