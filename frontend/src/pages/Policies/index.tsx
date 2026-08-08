import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllSubsidies, getLocationsForCity } from '../../data';
import { CATEGORY_NAMES, CITY_NAMES } from '../../constants';
import { PolicyCard } from '../../components/PolicyCard';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { ChevronDownIcon, FaceFrownIcon } from '../../components/icons';
import type { CityCode } from '../../constants';
import type { Subsidy } from '../../types';

export default function Policies() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const from = searchParams.get('from') || '';
  const backLabel = from === 'compare' ? '返回对比' : '返回首页';
  const initialCity = searchParams.get('city') as CityCode | null;
  const [allSubsidies, setAllSubsidies] = useState<Subsidy[]>([]);

  useEffect(() => {
    getAllSubsidies().then(setAllSubsidies);
  }, []);
  const [city, setCity] = useState<CityCode | ''>(initialCity && CITY_NAMES[initialCity] ? initialCity : '');
  const [district, setDistrict] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // 进入页面滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // 同步 URL 参数与城市选择（保留 from 来源标记）
  useEffect(() => {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (from) params.from = from;
    setSearchParams(params);
  }, [city, from]);

  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (!city) {
      setDistricts([]);
      return;
    }
    getLocationsForCity(city).then(setDistricts);
  }, [city]);

  // 唯一的展示标签列表（去重）
  const uniqueCategoryLabels = useMemo(() => {
    return [...new Set(Object.values(CATEGORY_NAMES))];
  }, []);

  // 过滤城市列表
  const filteredCities = useMemo(() => {
    const cities = Object.entries(CITY_NAMES) as [CityCode, string][];
    if (!citySearch) return cities;
    return cities.filter(([, name]) => name.includes(citySearch));
  }, [citySearch]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPolicies = useMemo(() => {
    return allSubsidies.filter((s) => {
      if (city && s.city !== city) return false;
      if (district && s.application.location !== district && s.application.location !== `${CITY_NAMES[s.city as CityCode]}市`) return false;
      if (categoryFilter && CATEGORY_NAMES[s.category] !== categoryFilter) return false;
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
    <div className="min-h-screen bg-paper">
      <PageHeader
        title="人才政策库"
        backLabel={backLabel}
        onBack={() => {
          if (from === 'compare' && city) {
            navigate(`/compare?city=${city}`);
          } else {
            navigate('/');
          }
        }}
      />

      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">浏览人才政策</h1>
          <p className="mt-2 text-sm text-slate-500">按城市与区域筛选</p>
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">目标城市</label>
              <div className="relative" ref={cityDropdownRef}>
                <input
                  type="text"
                  value={city ? CITY_NAMES[city as CityCode] : citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setCity('');
                    setDistrict('');
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="搜索城市名称..."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
                />
                {showCityDropdown && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    <button
                      onClick={() => { setCity(''); setCitySearch(''); setDistrict(''); setShowCityDropdown(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-100"
                    >
                      全部城市
                    </button>
                    {filteredCities.map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => { setCity(code); setCitySearch(''); setDistrict(''); setShowCityDropdown(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 ${
                          city === code ? 'bg-civic-blue/5 font-semibold text-civic-blue' : 'text-slate-700'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                    {filteredCities.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-400">未找到匹配城市</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                区域 <span className="text-xs font-normal text-slate-400">（可选）</span>
              </label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!city}
                  className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">不限（全市）</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">补贴类型</label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
                >
                  <option value="">全部类型</option>
                  {uniqueCategoryLabels.map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            共找到 <span className="font-data font-bold text-ink">{filteredPolicies.length}</span> 项政策
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

        {/* Policy cards - 按城市分组展示 */}
        {filteredPolicies.length > 0 ? (
          <div className="mt-5 space-y-8">
            {(Object.entries(groupedByCity) as [CityCode, Subsidy[]][]).map(([cityCode, subsidies]) => (
              <div key={cityCode}>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ink">{CITY_NAMES[cityCode]}</h3>
                  <span className="text-xs text-slate-400">{subsidies.length} 项政策</span>
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
          <div className="mt-6">
            <EmptyState
              variant="inline"
              icon={<FaceFrownIcon className="h-7 w-7 text-slate-400" />}
              title="没有找到符合条件的政策"
              description="请尝试调整城市、区域或补贴类型筛选条件"
              action={
                (city || categoryFilter)
                  ? {
                      label: '重置筛选',
                      onClick: () => { setCity(''); setDistrict(''); setCategoryFilter(''); },
                    }
                  : undefined
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
