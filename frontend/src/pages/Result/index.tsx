import { useNavigate } from 'react-router-dom';
import { useResultStore, useUserStore } from '../../stores';
import { useAIInterpret, useSubsidyMatch } from '../../hooks';
import { useConfigStore } from '../../stores';
import { clearFormCache } from '../../utils/formCache';
import { groupExclusiveItems } from '../../utils/matcher';
import { PolicyCard } from '../../components/PolicyCard';
import { FavoritesButton } from '../../components/FavoritesButton';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import type { UserProfile } from '../../types';

export default function Result() {
  const navigate = useNavigate();
  const { result, toggleTodo } = useResultStore();
  const { profile } = useUserStore();
  const { apiConfig } = useConfigStore();
  const { interpret, isLoading: aiLoading, error: aiError } = useAIInterpret();
  const { getProfessionalChannels } = useSubsidyMatch();

  // tier 3 专业通道政策：不参与自动金额汇总，仅展示入口
  const professionalChannels = profile?.city
    ? getProfessionalChannels(profile as UserProfile)
    : [];

  const [aiData, setAiData] = useState<{
    interpretation?: string;
    pitfallTips?: string[];
  }>({});
  const [showBreakdown, setShowBreakdown] = useState(false);

  // 进入页面时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 展示条件：matched 为真 AND 年化金额 > 0（过滤掉 min=0 的占位政策）
  const matchedItems =
    result?.subsidies.filter((s) => s.matched && s.matchedAmount > 0) || [];
  const { groups: exclusiveGroups, standalone: standaloneItems } =
    groupExclusiveItems(matchedItems);
  // 直接使用 matcher 计算好的 nearMissItems，避免重复计算
  const nearMissItems = result?.nearMissItems || [];

  useEffect(() => {
    if (apiConfig && result && profile && matchedItems.length > 0) {
      const fullProfile = {
        ...profile,
        school: profile.school || '',
        schoolLevel: profile.schoolLevel || [],
        degree: profile.degree || '本科',
        major: profile.major || '',
        age: profile.age || 0,
        graduationYear: profile.graduationYear,
        householdStatus: profile.householdStatus || '未落户',
        employmentStatus: profile.employmentStatus || '未就业',
      };
      interpret(fullProfile, matchedItems, nearMissItems, apiConfig).then((data) => {
        if (data) {
          setAiData({
            interpretation: data.interpretation,
            pitfallTips: data.pitfallTips,
          });
        }
      });
    }
  }, [apiConfig, result, profile]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="mt-4 text-slate-600">暂无结果，请先填写信息</p>
          <button
            onClick={() => { clearFormCache(); navigate('/'); }}
            className="mt-4 rounded-xl bg-civic-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-civic-blue/90 focus-ring"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/input?mode=single')}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-ring sm:px-3"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">重新查询</span>
            </button>
            <FavoritesButton />
          </div>
          <span className="text-sm font-bold text-ink">补贴结果</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
        {/* Total Amount Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-civic-blue/15 bg-civic-blue px-6 py-7 text-center text-white shadow-lg shadow-civic-blue/15 sm:p-9">
          {/* 装饰角标 */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <p className="relative text-sm font-medium text-white/80">预估可申领总金额</p>
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="relative mt-2 block w-full cursor-pointer text-center focus:outline-none"
          >
            <div className="font-data text-5xl font-semibold tracking-tight transition-opacity hover:opacity-90 sm:text-6xl">
              {result.totalAmount.toLocaleString()}
              <span className="ml-1 text-xl font-medium sm:text-2xl">元</span>
            </div>
            <div className="mt-1 text-xs text-white/70">
              {showBreakdown ? '点击收起明细' : '点击查看计算明细'}
            </div>
          </button>

          {/* 明细弹层 */}
          {showBreakdown &&
            createPortal(
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
                onClick={() => setShowBreakdown(false)}
              >
                <div
                  className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-ink">金额明细</h3>
                    <button
                      onClick={() => setShowBreakdown(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-ring"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {matchedItems.map((item) => (
                      <div key={item.subsidy.id} className="rounded-xl border border-slate-100 bg-paper p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-ink">{item.subsidy.name}</span>
                          <span className="font-data text-lg font-semibold text-civic-blue">
                            {item.matchedAmount.toLocaleString()}
                          </span>
                        </div>
                        {item.subsidy.notes && <p className="mt-1 text-xs text-slate-500">{item.subsidy.notes || ''}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-sm font-semibold text-ink">合计</span>
                    <span className="font-data text-xl font-semibold text-civic-blue">{result.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>,
              document.body
            )}

          <div className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            已匹配 {matchedItems.length} 项补贴
          </div>
          {profile?.district && (
            <div className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              区域范围：{profile.district} 及市级
            </div>
          )}
        </div>

        {/* AI Interpretation */}
        {aiLoading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-civic-blue border-t-transparent" />
              AI 正在生成个性化解读...
            </div>
          </div>
        )}

        {/* AI 解读失败提示 */}
        {!aiLoading && aiError && !aiData.interpretation && (
          <div className="mt-6 rounded-2xl border border-amber/20 bg-amber/5 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-amber">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>AI 解读暂不可用（{aiError}），以下为规则匹配结果。你可以在设置中检查 API 配置后重试。</span>
            </div>
          </div>
        )}

        {aiData.interpretation && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-ink">AI 个性化解读</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{aiData.interpretation}</p>
          </div>
        )}

        {/* Matched Subsidies */}
        <div className="mt-8">
          <h3 className="font-display text-xl font-bold text-ink">可申领补贴</h3>
          <div className="mt-4 space-y-6">
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
            {standaloneItems.length > 0 && (
              <div className="space-y-4">
                {standaloneItems.map((item) => (
                  <PolicyCard
                    key={item.subsidy.id}
                    subsidy={item.subsidy}
                    matchedAmount={item.matchedAmount}
                    amountBreakdown={item.amountBreakdown}
                    showStatusBadges
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reverse Match */}
        {nearMissItems.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">你还能拿更多</h3>
            <div className="mt-4 space-y-3">
              {nearMissItems.slice(0, 3).map((item) => (
                <div
                  key={item.subsidy.id}
                  className="flex items-center justify-between rounded-2xl border border-civic-blue/15 bg-civic-blue/5 px-6 py-4"
                >
                  <div>
                    <h4 className="font-semibold text-ink">{item.subsidy.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">还差：{item.missingConditions.join('；')}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-data text-sm font-bold text-civic-blue">
                      最高 {item.subsidy.amount.max.toLocaleString()}
                      {item.subsidy.amount.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pitfall Tips */}
        {aiData.pitfallTips && aiData.pitfallTips.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">避坑提示</h3>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {aiData.pitfallTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/15 text-xs font-bold text-amber">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Todo List */}
        {result.todoList.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">落地待办清单</h3>
            <div className="mt-4 space-y-3">
              {result.todoList.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="mt-0.5 h-5 w-5 rounded-md border-slate-300 text-civic-blue focus:ring-civic-blue"
                  />
                  <div className={`flex-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                    <p className="text-sm font-semibold text-ink">{todo.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {todo.deadline}
                      </span>
                      {(() => {
                        const ch = todo.channel;
                        const link = ch && ch.startsWith('http') ? ch : null;
                        if (link) {
                          return (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-civic-blue hover:underline"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              点击访问
                            </a>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {todo.channel}
                          </span>
                        );
                      })()}
                    </div>
                    {todo.materials.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-slate-500">所需材料</span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {todo.materials.map((m) => (
                            <span key={m} className="rounded-lg border border-slate-100 bg-paper px-2 py-1 text-xs font-medium text-slate-600">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {todo.process && todo.process.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-slate-500">申请流程</span>
                        <ol className="mt-1.5 list-inside list-decimal space-y-1 text-xs text-slate-600">
                          {todo.process.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier 3 专业通道：高层次人才/认定类政策入口 */}
        {professionalChannels.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">专业通道（需额外认定）</h3>
            <p className="mt-1 text-sm text-slate-500">
              以下政策不参与自动金额计算，需先通过人才认定或单位申报，点击查看官方渠道了解详情。
            </p>
            <div className="mt-4 space-y-4">
              {professionalChannels.map((subsidy) => (
                <PolicyCard key={subsidy.id} subsidy={subsidy} defaultExpanded={false} />
              ))}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
