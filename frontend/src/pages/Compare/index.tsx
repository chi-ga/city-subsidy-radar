import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResultStore } from '../../stores';
import { CITY_NAMES, CATEGORY_NAMES } from '../../constants';
import { clearFormCache } from '../../utils/formCache';
import { groupExclusiveItems, filterMatchResultByCategories } from '../../utils/matcher';
import { PolicyCard } from '../../components/PolicyCard';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { ScaleIcon, ArrowLeftIcon, ChevronRightIcon, ExternalLinkIcon } from '../../components/icons';
import { CompareBuyFilterButton } from '../../components/CompareBuyFilterButton';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import type { CityCode, SubsidyCategory } from '../../constants';
import type { MatchResultItem, MatchResult } from '../../types';

function groupByCategory(items: MatchResultItem[]): Record<SubsidyCategory, MatchResultItem[]> {
  const groups: Partial<Record<SubsidyCategory, MatchResultItem[]>> = {};
  for (const item of items) {
    const cat = item.subsidy.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat]!.push(item);
  }
  for (const cat of Object.keys(groups) as SubsidyCategory[]) {
    groups[cat]!.sort((a, b) => b.matchedAmount - a.matchedAmount);
  }
  return groups as Record<SubsidyCategory, MatchResultItem[]>;
}

const CATEGORY_ORDER: SubsidyCategory[] = ['living', 'settlement', 'rent', 'buy', 'talent', 'startup', 'employment', 'other'];

const COMPARE_COLORS = [
  'hsl(var(--civic-blue))',
  'hsl(var(--celadon))',
  'hsl(var(--amber))',
  'hsl(var(--seal-red))',
  'hsl(260 60% 55%)',
  'hsl(190 80% 35%)',
  'hsl(40 90% 45%)',
  'hsl(340 70% 50%)',
];

export default function Compare() {
  const navigate = useNavigate();
  const { compareResults, compareExcludedCategories } = useResultStore();
  const [activeCity, setActiveCity] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollKey = compareExcludedCategories.join(',');

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [scrollKey]);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.min(el.clientWidth * 0.75, 280);
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  // 根据排除分类派生过滤后的对比结果
  const filteredCompareResults = compareResults
    ? (Object.fromEntries(
        Object.entries(compareResults).map(([city, result]) => [
          city,
          filterMatchResultByCategories(result, compareExcludedCategories),
        ])
      ) as Record<CityCode, MatchResult>)
    : null;

  if (!filteredCompareResults) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <EmptyState
          icon={<ScaleIcon className="h-8 w-8 text-slate-400" />}
          title="暂无对比结果，请先填写信息"
          action={{
            label: '返回首页',
            onClick: () => { clearFormCache(); navigate('/'); },
          }}
        />
      </div>
    );
  }

  const cityResults = Object.entries(filteredCompareResults) as [CityCode, typeof filteredCompareResults[CityCode]][];
  const sortedCities = cityResults.sort((a, b) => b[1].totalAmount - a[1].totalAmount);
  const maxAmount = sortedCities[0][1].totalAmount || 1;

  // 默认选中金额最高的城市
  if (!activeCity && sortedCities.length > 0) {
    setActiveCity(sortedCities[0][0]);
  }

  return (
    <div className="min-h-screen bg-paper">
      <PageHeader
        title="城市对比"
        backTo="/input?mode=compare"
        backLabel="重新对比"
      />

      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">城市补贴对比</h1>
          <p className="mt-2 text-sm text-slate-500">基于你的条件，各城市预计可拿补贴总额对比</p>
        </div>

        {/* Comparison Chart */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-bold text-ink">预估补贴总额（到城后预计最高可拿）</h3>
          </div>
          <div className="p-6">
            <p className="mb-4 text-xs text-slate-400">
              * 金额为到该城市后、满足软性条件（落户/就业等）情况下的预计最高可拿总额，实际以官方审核为准。
            </p>
            <div
              key={compareExcludedCategories.join(',')}
              className="space-y-5 animate-fade-in"
            >
              {sortedCities.map(([city, result], index) => {
                const percentage = (result.totalAmount / maxAmount) * 100;
                const isTop = index === 0;
                const color = COMPARE_COLORS[index % COMPARE_COLORS.length];
                return (
                  <div key={city} className="transition-all duration-500">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                            isTop ? 'text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                          style={isTop ? { backgroundColor: color } : undefined}
                        >
                          {index + 1}
                        </span>
                        <span className="font-semibold text-ink">{CITY_NAMES[city as CityCode]}</span>
                        {isTop && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            style={{ backgroundColor: color }}
                          >
                            最优
                          </span>
                        )}
                      </div>
                      <span className="font-data text-lg font-extrabold text-ink">
                        <AnimatedNumber value={result.totalAmount} />
                        <span className="ml-0.5 text-sm font-medium text-slate-500">元</span>
                      </span>
                    </div>
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%`, backgroundColor: isTop ? color : 'hsl(var(--border))' }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      预计可匹配 {result.subsidies.filter((s) => s.matched).length} 项补贴政策
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rank Chips */}
        <div className="mt-8">
          <label className="mb-3 block text-sm font-semibold text-ink">选择城市查看明细</label>
          <div className="relative">
            {canScrollLeft && (
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:w-8" />
            )}
            {canScrollRight && (
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:w-8" />
            )}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollBy('left')}
                aria-label="向左滚动"
                className="absolute -left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-md backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue/30 sm:-left-4"
              >
                <ArrowLeftIcon className="h-4 w-4 text-slate-600" />
              </button>
            )}
            <div
              ref={scrollRef}
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 scrollbar-hide"
            >
              {sortedCities.map(([city, result], index) => {
              const isActive = activeCity === city;
              const rank = index + 1;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setActiveCity(city)}
                  className={`group relative flex shrink-0 flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                    isActive
                      ? 'border-civic-blue/30 bg-civic-blue/5 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`mb-1 flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${
                      rank === 1
                        ? 'bg-civic-blue text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {rank}
                  </span>
                  <span className={`text-sm font-semibold ${isActive ? 'text-civic-blue' : 'text-ink'}`}>
                    {CITY_NAMES[city as CityCode]}
                  </span>
                  <span className="font-data text-xs font-medium text-slate-500">
                    <AnimatedNumber value={result.totalAmount} />元
                  </span>
                </button>
              );
            })}
            </div>
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollBy('right')}
                aria-label="向右滚动"
                className="absolute -right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-md backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-civic-blue/30 sm:-right-4"
              >
                <ChevronRightIcon className="h-4 w-4 text-slate-600" />
              </button>
            )}
          </div>
        </div>

        {/* City Detail */}
        {activeCity && filteredCompareResults[activeCity as CityCode] && (
          <div key={activeCity} className="mt-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-ink">{CITY_NAMES[activeCity as CityCode]}可拿补贴明细</h3>
                <button
                  type="button"
                  onClick={() => navigate(`/policies?city=${activeCity}`)}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-civic-blue transition-colors hover:text-civic-blue/80 hover:underline"
                >
                  查看该城市全部政策
                  <ExternalLinkIcon className="h-3 w-3" />
                </button>
              </div>
              <div className="font-data text-xl font-extrabold text-civic-blue">
                <AnimatedNumber value={filteredCompareResults[activeCity as CityCode].totalAmount} />
                <span className="ml-1 text-sm font-medium text-slate-500">元</span>
              </div>
            </div>

            <div className="mt-4 space-y-8">
              {(() => {
                const matched = filteredCompareResults[activeCity as CityCode].subsidies.filter((s) => s.matched);
                const { groups: exclusiveGroups, standalone: standaloneItems } = groupExclusiveItems(matched);
                const categoryGroups = groupByCategory(standaloneItems);
                return (
                  <>
                    {exclusiveGroups.length > 0 && (
                      <div className="space-y-4">
                        {exclusiveGroups.map((group) => (
                          <div key={group.groupId} className="rounded-2xl border border-amber/20 bg-amber/5 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-amber/15 px-2 py-0.5 text-xs font-bold text-amber">互斥组</span>
                                <span className="text-sm font-bold text-amber-900">{group.name}</span>
                              </div>
                              <div className="text-sm text-amber">
                                取最高值
                                <span className="ml-1 font-data font-extrabold">{group.totalAmount.toLocaleString()}元</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {group.items.map((item, idx) => (
                                <div key={item.subsidy.id} className="relative">
                                  {idx === 0 && (
                                    <div className="absolute -left-1 -top-1 z-10 rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                                      已选最高
                                    </div>
                                  )}
                                  <PolicyCard
                                    subsidy={item.subsidy}
                                    matchedAmount={item.matchedAmount}
                                    amountBreakdown={item.amountBreakdown}
                                    dimmed={idx !== 0}
                                    showStatusBadges
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {CATEGORY_ORDER.filter((cat) => categoryGroups[cat] && categoryGroups[cat].length > 0).map((cat) => (
                      <div key={cat}>
                        <h4 className="sticky top-[72px] z-10 -mx-6 bg-paper px-6 py-2 text-sm font-bold text-slate-700">
                          {CATEGORY_NAMES[cat]}
                        </h4>
                        <div className="mt-3 space-y-3">
                          {categoryGroups[cat].map((item) => (
                            <PolicyCard
                              key={item.subsidy.id}
                              subsidy={item.subsidy}
                              matchedAmount={item.matchedAmount}
                              amountBreakdown={item.amountBreakdown}
                              showStatusBadges
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>
      <CompareBuyFilterButton />
    </div>
  );
}
