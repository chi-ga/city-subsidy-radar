import { useState, useRef, useEffect, useCallback } from 'react';
import { CITY_NAMES } from '../../../constants';
import type { CityCode } from '../../../constants';

interface CitySelectorProps {
  value?: CityCode;
  onChange: (city: CityCode) => void;
  onClear: () => void;
}

/**
 * 城市选择器
 * 支持搜索过滤，显示已选城市
 */
export function CitySelector({ value, onChange, onClear }: CitySelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSelect = (code: CityCode) => {
    onChange(code);
    setShowDropdown(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
    setSearch('');
  };

  const filteredCities = Object.entries(CITY_NAMES).filter(([, name]) => name.includes(search));

  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <svg className="h-4 w-4 text-civic-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        目标城市
      </label>
      <div className="relative mt-3" ref={dropdownRef}>
        <input
          type="text"
          value={showDropdown ? search : (value ? CITY_NAMES[value] : '')}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setSearch('');
            setShowDropdown(true);
          }}
          placeholder="搜索城市名称..."
          className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm text-ink shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
        />
        {value && !showDropdown && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {showDropdown && (
          <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {filteredCities.length > 0 ? (
              filteredCities.map(([code, name]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelect(code as CityCode)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-civic-blue/5 ${
                    value === code ? 'bg-civic-blue/5 text-civic-blue font-medium' : 'text-slate-700'
                  }`}
                >
                  {name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400">未找到匹配城市</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
