import { useState, useRef, useEffect, useCallback } from 'react';
import { useMajorSearch } from '../../../hooks';
import { checkShenzhenKeyIndustryMajor } from '../../../data';
import { getCachedFlatMajors } from '../../../data/lazyMajors';
import { isDoubleFirstClassDiscipline, loadDoubleFirstClassDisciplines } from '../../../data/lazyTalent';

interface MajorSelectorProps {
  value: string;
  city?: string;
  degree?: string;
  school?: string;
  majorFirstLevelDiscipline?: string;
  majorInShenzhenKeyIndustry?: boolean;
  keyIndustryMatchSource: 'major' | 'discipline' | null;
  keyIndustryMatchedDiscipline?: string;
  doubleFirstClassMatch?: boolean;
  onChange: (major: string, firstLevel?: string) => void;
  onKeyIndustryChange: (matchSource: 'major' | 'discipline' | null, matchedDiscipline?: string) => void;
  onDoubleFirstClassChange: (match: boolean | undefined) => void;
}

/**
 * 专业搜索选择器
 * 支持实时搜索，深圳显示重点产业目录和双一流学科匹配状态
 */
export function MajorSelector({
  value,
  city,
  degree,
  school,
  majorFirstLevelDiscipline,
  majorInShenzhenKeyIndustry,
  keyIndustryMatchSource,
  keyIndustryMatchedDiscipline,
  doubleFirstClassMatch,
  onChange,
  onKeyIndustryChange,
  onDoubleFirstClassChange,
}: MajorSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { results, isSearching, search, clear } = useMajorSearch();

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
    onChange(inputValue);
    onKeyIndustryChange(null, undefined);
    if (inputValue.length >= 1) {
      search(inputValue);
      setShowDropdown(true);
    } else {
      clear();
      setShowDropdown(false);
    }
  };

  const handleSelect = async (majorName: string, firstLevelDiscipline?: string) => {
    // 同步回填一级学科
    let firstLevel = firstLevelDiscipline;
    if (!firstLevel) {
      const flat = getCachedFlatMajors();
      firstLevel = flat.find((m) => m.name === majorName)?.first_level_discipline;
    }

    // 异步判定是否在重点产业领域专业目录内
    let matchSrc: 'major' | 'discipline' | null = null;
    let matchedDisc: string | undefined;
    try {
      const r = await checkShenzhenKeyIndustryMajor(majorName, firstLevel, degree);
      matchSrc = r.matchSource;
      matchedDisc = r.matchedDiscipline;
    } catch {
      // 静默失败
    }
    onKeyIndustryChange(matchSrc, matchedDisc);

    // 判断一级学科是否属于该校双一流学科
    try {
      await loadDoubleFirstClassDisciplines();
    } catch { /* 预加载已执行，此处兜底 */ }
    const isDFC = firstLevel && school
      ? isDoubleFirstClassDiscipline(school, firstLevel)
      : false;
    onDoubleFirstClassChange(isDFC);

    onChange(majorName, firstLevel);
    clear();
    setShowDropdown(false);
  };

  return (
    <section>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        专业
      </label>
      <div className="relative mt-3" ref={dropdownRef}>
        <input
          type="text"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            if (value && value.length >= 1 && results.length > 0) setShowDropdown(true);
          }}
          placeholder="输入专业名称，如：计算机科学与技术"
          className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
        />
        {showDropdown && (isSearching || results.length > 0) && (
          <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {isSearching ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-civic-blue border-t-transparent" />
                搜索中...
              </div>
            ) : (
              results.slice(0, 20).map((major) => (
                <button
                  key={major.code}
                  onClick={() => handleSelect(major.name, major.first_level_discipline)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-paper"
                >
                  <span className="font-medium text-slate-800">{major.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">
                    {major.first_level_discipline}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
        {showDropdown && !isSearching && results.length === 0 && value && value.length >= 1 && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-lg">
            未找到匹配专业，可直接输入或尝试其他关键词
          </div>
        )}
      </div>
      {city === 'shenzhen' && value && degree && degree !== '专科' && (
        <div className="mt-1.5 space-y-1 text-xs">
          <p className={majorInShenzhenKeyIndustry === true ? 'text-celadon' : 'text-amber'}>
            {majorInShenzhenKeyIndustry === true
              ? keyIndustryMatchSource === 'discipline'
                ? `✓ 一级学科「${keyIndustryMatchedDiscipline}」属于《重点产业领域专业目录》`
                : '✓ 专业属于《重点产业领域专业目录》'
              : '✗ 专业不在《重点产业领域专业目录》'}
          </p>
          {school && majorFirstLevelDiscipline && (
            <p className={doubleFirstClassMatch ? 'text-celadon' : 'text-amber'}>
              {doubleFirstClassMatch
                ? `✓ 一级学科「${majorFirstLevelDiscipline}」是${school}的双一流学科`
                : `✗ 一级学科「${majorFirstLevelDiscipline}」不是${school}的双一流学科`}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
