import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResultStore } from '../../stores';
import { CITY_NAMES, CATEGORY_NAMES } from '../../constants';
import { clearFormCache } from '../../utils/formCache';
import { groupExclusiveItems } from '../../utils/matcher';
import { PolicyCard } from '../../components/PolicyCard';
import type { CityCode, SubsidyCategory } from '../../constants';
import type { MatchResultItem } from '../../types';

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

export default function Compare() {
  const navigate = useNavigate();
  const { compareResults } = useResultStore();
  const [activeCity, setActiveCity] = useState<string>('beijing');

  if (!compareResults) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="mt-4 text-slate-600">暂无对比结果，请先填写信息</p>
          <button
            onClick={() => { clearFormCache(); navigate('/'); }}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const cityResults = Object.entries(compareResults) as [CityCode, typeof compareResults[CityCode]][];
  const sortedCities = cityResults.sort((a, b) => b[1].totalAmount - a[1].totalAmount);
  const maxAmount = sortedCities[0][1].totalAmount || 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <button
            onClick={() => { navigate('/input?mode=compare'); }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:px-3"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">重新对比</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-sm shadow-emerald-600/30">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">城市对比</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">城市补贴对比</h1>
          <p className="mt-2 text-slate-500">基于你的条件，各城市预计可拿补贴总额对比</p>
        </div>

        {/* Comparison Chart */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-800">预估补贴总额（到城后预计最高可拿）</h3>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {sortedCities.map(([city, result], index) => {
                const percentage = (result.totalAmount / maxAmount) * 100;
                const isTop = index === 0;
                return (
                  <div key={city}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          isTop ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{CITY_NAMES[city as CityCode]}</span>
                        {isTop && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                            最优
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-extrabold text-slate-900">
                        {result.totalAmount.toLocaleString()}
                        <span className="ml-0.5 text-sm font-medium text-slate-500">元</span>
                      </span>
                    </div>
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${isTop ? 'bg-blue-500' : 'bg-slate-300'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      预计可匹配 {result.subsidies.filter((s) => s.matched).length} 项补贴政策
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-400">
              * 金额为到该城市后、满足软性条件（落户/就业等）情况下的预计最高可拿总额，实际以官方审核为准。
            </p>
          </div>
        </div>

        {/* City Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {sortedCities.map(([city]) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                activeCity === city
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {CITY_NAMES[city as CityCode]}
            </button>
          ))}
        </div>

        {/* City Detail */}
        {activeCity && compareResults[activeCity as CityCode] && (
          <div className="mt-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">{CITY_NAMES[activeCity as CityCode]}可拿补贴明细</h3>
              <div className="text-xl font-extrabold text-blue-600">
                {compareResults[activeCity as CityCode].totalAmount.toLocaleString()}
                <span className="ml-1 text-sm font-medium text-slate-500">元</span>
              </div>
            </div>

            <div className="mt-4 space-y-8">
              {(() => {
                const matched = compareResults[activeCity as CityCode].subsidies.filter((s) => s.matched);
                const { groups: exclusiveGroups, standalone: standaloneItems } = groupExclusiveItems(matched);
                const categoryGroups = groupByCategory(standaloneItems);
                return (
                  <>
                    {exclusiveGroups.length > 0 && (
                      <div className="space-y-4">
                        {exclusiveGroups.map((group) => (
                          <div key={group.groupId} className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">互斥组</span>
                                <span className="text-sm font-bold text-amber-800">{group.name}</span>
                              </div>
                              <div className="text-sm text-amber-700">
                                取最高值
                                <span className="ml-1 font-extrabold">{group.totalAmount.toLocaleString()}元</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {group.items.map((item, idx) => (
                                <div key={item.subsidy.id} className="relative">
                                  {idx === 0 && (
                                    <div className="absolute -left-1 -top-1 z-10 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
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
                        <h4 className="sticky top-[72px] z-10 -mx-6 bg-slate-50 px-6 py-2 text-sm font-bold text-slate-700">
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
    </div>
  );
}
