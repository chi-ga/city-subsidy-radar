import { CITY_NAMES } from '../../../constants';
import { getLocationsForCity } from '../../../data';
import type { CityCode } from '../../../constants';

interface DistrictSelectorProps {
  city?: CityCode;
  value?: string;
  onChange: (district: string | undefined) => void;
}

/**
 * 区域选择器
 * 根据城市动态加载区域列表
 */
export function DistrictSelector({ city, value, onChange }: DistrictSelectorProps) {
  const districts = city ? getLocationsForCity(city) : [];

  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        目标区域
        <span className="ml-1 text-xs font-normal text-slate-400">（可选）</span>
      </label>
      <div className="mt-3">
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
            className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          >
            <option value="">不限（全市）</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
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
        <p className="mt-1.5 text-xs text-slate-400">
          {city
            ? `当前展示 ${CITY_NAMES[city]} 下辖区/县的补贴，可按需进一步筛选。`
            : '可先选区再选城市；选区后只展示该区+市级政策。'}
        </p>
      </div>
    </section>
  );
}
