import { useState, useRef, useEffect, useCallback } from 'react';
import { useSchoolSearch } from '../../../hooks';
import { deduplicateLevels } from '../../../constants';
import type { SchoolLevel } from '../../../constants';

interface SchoolSelectorProps {
  value: string;
  schoolLevel: SchoolLevel[];
  onChange: (school: string, levels: SchoolLevel[]) => void;
  showSchoolLevel: boolean;
}

/**
 * 学校搜索选择器
 * 支持实时搜索，显示学校层次标签（985/211/双一流）
 */
export function SchoolSelector({
  value,
  schoolLevel,
  onChange,
  showSchoolLevel,
}: SchoolSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { results, isSearching, search, clear } = useSchoolSearch();

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleInput = (inputValue: string) => {
    onChange(inputValue, []);
    if (inputValue.length >= 1) {
      search(inputValue);
      setShowDropdown(true);
    } else {
      clear();
      setShowDropdown(false);
    }
  };

  const handleSelect = (schoolName: string, levels: SchoolLevel[]) => {
    onChange(schoolName, deduplicateLevels(levels));
    clear();
    setShowDropdown(false);
  };

  // 分离国内层次和世界排名
  const domestic = schoolLevel.filter((l) => ['985', '211', '双一流'].includes(l));
  const rankings = schoolLevel.filter((l) => /前\d+/.test(l));

  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        毕业院校
      </label>
      <div className="relative mt-3" ref={dropdownRef}>
        <input
          type="text"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            if (value && value.length >= 1 && results.length > 0) setShowDropdown(true);
          }}
          placeholder="输入院校名称，如：北京大学"
          className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
        />
        {showSchoolLevel && schoolLevel.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {domestic.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {domestic.map((level) => (
                  <span
                    key={level}
                    className="inline-flex items-center rounded-md bg-civic-blue/5 px-2 py-0.5 text-xs font-medium text-civic-blue ring-1 ring-civic-blue/10"
                  >
                    {level}
                  </span>
                ))}
              </div>
            )}
            {rankings.length > 0 && (
              <>
                {domestic.length > 0 && <span className="text-xs text-slate-300">·</span>}
                <div className="flex flex-wrap gap-1.5">
                  {rankings.map((level) => (
                    <span
                      key={level}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {level}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {showDropdown && (isSearching || results.length > 0) && (
          <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {isSearching ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-civic-blue border-t-transparent" />
                搜索中...
              </div>
            ) : (
              results.map((school) => (
                <button
                  key={school.id}
                  onClick={() => handleSelect(school.name, school.levels)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-paper"
                >
                  <span className="font-medium text-slate-800">{school.name}</span>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                    {(() => {
                      const levels = deduplicateLevels(school.levels);
                      const domestic = levels.filter((l) => ['985', '211', '双一流'].includes(l));
                      const rankingOrder = ['前100', '前150', '前200', '前300', '前500'];
                      const rankings = levels.filter((l) => /前\d+/.test(l));
                      const bestRanking = rankingOrder
                        .map((suffix) => rankings.find((r) => r.endsWith(suffix)))
                        .find(Boolean);
                      return (
                        <>
                          {domestic.slice(0, 2).map((level) => (
                            <span
                              key={level}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500"
                            >
                              {level}
                            </span>
                          ))}
                          {bestRanking && (
                            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600">
                              世界{bestRanking.match(/前\d+/)?.[0] ?? ''}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
