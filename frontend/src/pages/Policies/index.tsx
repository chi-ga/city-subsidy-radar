import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubsidies, getLocationsForCity } from '../../data';
import { CATEGORY_NAMES, CITY_NAMES } from '../../constants';
import { PolicyCard } from '../../components/PolicyCard';
import type { CityCode, SubsidyCategory } from '../../constants';
import type { Subsidy } from '../../types';

const ChevronDownIcon = () => (
  <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function Policies() {
  const navigate = useNavigate();
  const allSubsidies = useMemo(() => getAllSubsidies(), []);
  const [city, setCity] = useState<CityCode | ''>('');
  const [district, setDistrict] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<SubsidyCategory | ''>('');

  const districts = useMemo(() => (city ? getLocationsForCity(city) : []), [city]);

  const filteredPolicies = useMemo(() => {
    return allSubsidies.filter((s) => {
      if (city && s.city !== city) return false;
      if (district && s.application.location !== district && s.application.location !== `${CITY_NAMES[s.city as CityCode]}市`) return false;
      if (categoryFilter && s.category !== categoryFilter) return false;
      return true;
    });
  }, [allSubsidies, city, district, categoryFilter]);

  // 按城市分组，便于展示
  const groupedByCity = useMemo(() => {
    const groups: Partial<Record<CityCode, Subsidy[]>> = {};
    for (const s of filteredPolicies) {
      if (!groups[s.city]) groups[s.city] = [];
      groups[s.city]!.push(s);
    }
    return groups;
  }, [filteredPolicies]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:px-3"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">返回首页</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-sm shadow-amber-500/30">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">人才政策库</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">浏览人才政策</h1>
          <p className="mt-2 text-slate-500">按城市与区域筛选</p>
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">目标城市</label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value as CityCode); setDistrict(''); }}
                  className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="">全部城市</option>
                  {Object.entries(CITY_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                区域 <span className="text-xs font-normal text-slate-400">（可选）</span>
              </label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!city}
                  className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">不限（全市）</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">补贴类型</label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as SubsidyCategory | '')}
                  className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="">全部类型</option>
                  {Object.entries(CATEGORY_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            共找到 <span className="font-bold text-slate-900">{filteredPolicies.length}</span> 项政策
          </p>
          {(city || categoryFilter) && (
            <button
              onClick={() => { setCity(''); setDistrict(''); setCategoryFilter(''); }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              重置筛选
            </button>
          )}
        </div>

        {/* Policy cards - 按城市分组展示，使用共享 PolicyCard 组件 */}
        {filteredPolicies.length > 0 ? (
          <div className="mt-5 space-y-8">
            {(Object.entries(groupedByCity) as [CityCode, Subsidy[]][]).map(([cityCode, subsidies]) => (
              <div key={cityCode}>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                    {CITY_NAMES[cityCode].charAt(0)}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{CITY_NAMES[cityCode]}</h3>
                  <span className="text-xs text-slate-400">（{subsidies.length} 项政策）</span>
                </div>
                <div className="mt-3 space-y-4">
                  {subsidies.map((subsidy) => (
                    <PolicyCard key={subsidy.id} subsidy={subsidy} defaultExpanded={false} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">未找到匹配政策</p>
            <p className="mt-1 text-sm text-slate-400">请尝试调整城市、区域或补贴类型筛选条件</p>
          </div>
        )}
      </main>
    </div>
  );
}
