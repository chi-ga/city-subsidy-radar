import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore, useUserStore } from '../../stores';
import { CITY_NAMES } from '../../constants';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import {
  HistoryIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  MapPinIcon,
  ClockIcon,
} from '../../components/icons';
import { saveFormCache } from '../../utils/formCache';
import type { HistoryRecord } from '../../stores';
import type { CityCode } from '../../constants';

/** 格式化相对时间 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  // 超过 7 天显示日期
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

/** 生成条件摘要文本 */
function buildConditionSummary(record: HistoryRecord): string {
  const { profileSnapshot: s } = record;
  const parts: string[] = [];

  if (record.queryType === 'single' && s.city) {
    const cityName = CITY_NAMES[s.city as CityCode] ?? s.city;
    parts.push(cityName);
    if (s.district) parts.push(s.district);
  }

  if (s.degree) parts.push(s.degree);
  if (s.school) parts.push(s.school);
  if (s.major) parts.push(s.major);

  return parts.length > 0 ? parts.join(' · ') : '未知条件';
}

export default function History() {
  const navigate = useNavigate();
  const { records, clearHistory, exportHistory, removeRecord } = useHistoryStore();
  const { setProfile } = useUserStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 倒序排列（新到旧），store 已按新到旧存储，这里直接使用
  const sortedRecords = useMemo(() => records, [records]);

  /** 重新查询：恢复 profile 并跳转 */
  const handleRequery = (record: HistoryRecord) => {
    const { profileSnapshot: s } = record;
    // 恢复 profile 到 userStore
    setProfile({
      city: s.city,
      school: s.school,
      degree: s.degree,
      major: s.major,
      age: s.age,
      graduationYear: s.graduationYear,
      householdStatus: s.householdStatus,
      employmentStatus: s.employmentStatus,
      district: s.district,
    });
    // 同步写入 formCache 以便 Input 页读取
    saveFormCache({
      city: s.city,
      school: s.school,
      degree: s.degree,
      major: s.major,
      age: s.age,
      graduationYear: s.graduationYear,
      householdStatus: s.householdStatus,
      employmentStatus: s.employmentStatus,
      district: s.district,
    });

    if (record.queryType === 'compare') {
      navigate('/input?mode=compare');
    } else {
      navigate('/input?mode=single');
    }
  };

  if (sortedRecords.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <PageHeader title="查询历史" backTo="/" backLabel="返回首页" />
        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <EmptyState
            icon={<HistoryIcon className="h-8 w-8 text-slate-400" />}
            title="还没有查询记录"
            description="完成一次补贴查询后，记录会自动保存在这里"
            action={{
              label: '去查询补贴',
              onClick: () => navigate('/input'),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <PageHeader
        title="查询历史"
        backTo="/"
        backLabel="返回首页"
        right={
          <button
            onClick={() => exportHistory()}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-ring"
            title="导出全部历史"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span className="hidden sm:inline">导出</span>
          </button>
        }
      />

      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
        {/* 顶部操作栏 */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            共 <span className="font-data font-semibold text-ink">{sortedRecords.length}</span> 条查询记录
            <span className="ml-1 text-slate-400">（最多保留 20 条）</span>
          </p>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-seal-red focus-ring"
          >
            清空全部
          </button>
        </div>

        {/* 历史卡片列表 */}
        <div className="space-y-3">
          {sortedRecords.map((record) => (
            <HistoryCard
              key={record.id}
              record={record}
              onRequery={() => handleRequery(record)}
              onRemove={() => removeRecord(record.id)}
            />
          ))}
        </div>
      </main>

      {/* 清空确认弹窗 */}
      {showClearConfirm && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-[101] w-[min(90vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-ink">确认清空查询历史？</h3>
            <p className="mt-2 text-sm text-slate-500">
              所有 {sortedRecords.length} 条查询记录将被永久删除，无法恢复。
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-paper"
              >
                取消
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowClearConfirm(false);
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                确认清空
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface HistoryCardProps {
  record: HistoryRecord;
  onRequery: () => void;
  onRemove: () => void;
}

function HistoryCard({ record, onRequery, onRemove }: HistoryCardProps) {
  const isCompare = record.queryType === 'compare';
  const { resultSummary: summary, profileSnapshot: s } = record;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-5">
      {/* 左侧色条 */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          isCompare ? 'bg-celadon' : 'bg-civic-blue'
        }`}
      />

      <div className="flex items-start gap-3 sm:gap-4">
        {/* 类型图标 */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isCompare
              ? 'bg-celadon/10 text-celadon'
              : 'bg-civic-blue/10 text-civic-blue'
          }`}
        >
          {isCompare ? (
            <ScaleIcon className="h-5 w-5" />
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5" />
          )}
        </div>

        {/* 内容区 */}
        <div className="min-w-0 flex-1">
          {/* 顶部：类型标签 + 时间 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  isCompare
                    ? 'bg-celadon/10 text-celadon'
                    : 'bg-civic-blue/10 text-civic-blue'
                }`}
              >
                {isCompare ? '城市对比' : '单城查询'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <ClockIcon className="h-3 w-3" />
                {formatRelativeTime(record.createdAt)}
              </span>
            </div>
            <button
              onClick={onRemove}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-100 hover:text-seal-red focus-ring"
              title="删除此记录"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>

          {/* 条件摘要 */}
          <p className="mt-2 truncate text-sm font-semibold text-ink">
            {buildConditionSummary(record)}
          </p>

          {/* 城市标签（对比模式显示前3城市） */}
          {isCompare && record.compareRanking && record.compareRanking.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {record.compareRanking.slice(0, 4).map((entry, idx) => (
                <span
                  key={entry.city}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                    idx === 0
                      ? 'bg-amber/10 text-amber'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx === 0 && <span className="font-bold">最优</span>}
                  {entry.cityName}
                  <span className="font-data">
                    {(entry.totalAmount / 10000).toFixed(1)}万
                  </span>
                </span>
              ))}
              {record.compareRanking.length > 4 && (
                <span className="text-xs text-slate-400">
                  等{record.compareRanking.length}城
                </span>
              )}
            </div>
          )}

          {/* 单城模式显示城市+区域 */}
          {!isCompare && s.city && (
            <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPinIcon className="h-3 w-3" />
              {CITY_NAMES[s.city as CityCode] ?? s.city}
              {s.district && <span className="text-slate-400">· {s.district}</span>}
            </div>
          )}

          {/* 结果摘要 */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-civic-blue/5 px-2.5 py-1">
              <CheckBadgeIcon className="h-3.5 w-3.5 text-civic-blue" />
              <span className="text-xs font-semibold text-civic-blue">
                匹配 {summary.matchedCount} 项
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber/5 px-2.5 py-1">
              <BanknotesIcon className="h-3.5 w-3.5 text-amber" />
              <span className="font-data text-xs font-bold text-amber">
                <AnimatedNumber value={summary.totalAmount} /> 元
              </span>
            </div>
            {!isCompare && summary.nearMissCount > 0 && (
              <span className="text-xs text-slate-400">
                差一步 {summary.nearMissCount} 项
              </span>
            )}
          </div>

          {/* Top 补贴名称 */}
          {summary.topSubsidyNames.length > 0 && (
            <p className="mt-2 truncate text-xs text-slate-400">
              含：{summary.topSubsidyNames.join('、')}
            </p>
          )}
        </div>
      </div>

      {/* 重新查询按钮 */}
      <button
        onClick={onRequery}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-civic-blue/30 hover:bg-civic-blue/5 hover:text-civic-blue active:scale-[0.99] focus-ring"
      >
        <ArrowPathIcon className="h-4 w-4" />
        重新查询
      </button>
    </div>
  );
}
