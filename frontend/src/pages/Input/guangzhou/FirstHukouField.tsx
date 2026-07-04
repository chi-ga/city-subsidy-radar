interface FirstHukouFieldProps {
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}

/**
 * 广州黄埔首次入户判断
 * 黄埔入户奖励要求首次入户广州且入户黄埔区
 * 仅黄埔区显示
 */
export function FirstHukouField({ value, onChange }: FirstHukouFieldProps) {
  return (
    <section className="animate-fade-slide-in">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        入户情况
      </label>
      <p className="mt-1 text-xs text-slate-400">
        黄埔入户奖励要求首次入户广州且入户黄埔区
      </p>
      <div className="mt-3">
        <div className="relative">
          <select
            value={value === true ? 'yes' : value === false ? 'no' : ''}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === 'yes' ? true : v === 'no' ? false : undefined);
            }}
            className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          >
            <option value="" disabled>
              请选择入户情况
            </option>
            <option value="yes">首次入户广州（从外地迁入黄埔区）</option>
            <option value="no">广州户籍迁入黄埔区 / 原本就是黄埔区户籍</option>
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
