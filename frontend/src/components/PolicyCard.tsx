import { useState } from 'react';
import { CATEGORY_NAMES } from '../constants';
import { useFavoritesStore } from '../stores';
import type { Subsidy, SubsidyCategory } from '../types';

// ===== 类型定义 =====

type ConditionStatus = 'hard-met' | 'soft' | 'warning' | 'neutral';

interface ConditionRow {
  label: string;
  value: string;
  status: ConditionStatus;
}

interface PolicyCardProps {
  subsidy: Subsidy;
  /** 匹配后的金额（用于结果页/对比页）；不传则展示政策参考金额 */
  matchedAmount?: number;
  /** 金额计算明细（用于结果页悬浮提示） */
  amountBreakdown?: string;
  /** 是否置灰（用于互斥组中未选中的项） */
  dimmed?: boolean;
  /** 是否展示条件状态徽标（✓符合/ℹ到城后满足）；默认 false */
  showStatusBadges?: boolean;
  /** 是否默认展开 */
  defaultExpanded?: boolean;
}

// ===== 分类样式（受控于 civic data 调色盘） =====

const categoryStyles: Record<
  SubsidyCategory,
  {
    color: string;
    light: string;
    text: string;
    ring: string;
    border: string;
    label: string;
  }
> = {
  talent: {
    color: '#DC2626',
    light: 'bg-seal-red/8',
    text: 'text-seal-red',
    ring: 'ring-seal-red/20',
    border: 'border-seal-red/30',
    label: '人才奖励',
  },
  rent: {
    color: '#1D4ED8',
    light: 'bg-civic-blue/8',
    text: 'text-civic-blue',
    ring: 'ring-civic-blue/20',
    border: 'border-civic-blue/30',
    label: '租房补贴',
  },
  buy: {
    color: '#059669',
    light: 'bg-celadon/8',
    text: 'text-celadon',
    ring: 'ring-celadon/20',
    border: 'border-celadon/30',
    label: '落户安家',
  },
  living: {
    color: '#B45309',
    light: 'bg-amber/10',
    text: 'text-amber',
    ring: 'ring-amber/20',
    border: 'border-amber/30',
    label: '生活补贴',
  },
  employment: {
    color: '#374151',
    light: 'bg-slate-100',
    text: 'text-slate-700',
    ring: 'ring-slate-200',
    border: 'border-slate-300',
    label: '就业补贴',
  },
  startup: {
    color: '#7C3AED',
    light: 'bg-violet-100',
    text: 'text-violet-700',
    ring: 'ring-violet-200',
    border: 'border-violet-300',
    label: '创业支持',
  },
  settlement: {
    color: '#0D9488',
    light: 'bg-teal-50',
    text: 'text-teal-700',
    ring: 'ring-teal-200',
    border: 'border-teal-300',
    label: '落户安家',
  },
  other: {
    color: '#6B7280',
    light: 'bg-slate-100',
    text: 'text-slate-600',
    ring: 'ring-slate-200',
    border: 'border-slate-300',
    label: '其他补贴',
  },
};

const categoryIcons: Record<SubsidyCategory, string> = {
  talent: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  rent: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  buy: 'M3 21h18M5 21V7l8-4 8 4v14M8 21v-6h8v6',
  living: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  employment: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  startup: 'M13 10V3L4 14h7v7l9-11h-7z',
  settlement: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  other: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
};

function PolicyIcon({ category, className = 'h-5 w-5' }: { category: SubsidyCategory; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcons[category]} />
    </svg>
  );
}

// ===== 金额格式化 =====

/** 金额展示结构：main 为右上角主行，sub 为副行明细 */
interface AmountDisplay {
  main: string;
  sub?: string;
  unit?: string;
}

function formatAmount(subsidy: Subsidy): string {
  const { min, max, unit, period, durationMonths } = subsidy.amount;
  const periodText = period || '';
  if (min === 0 && max === 0) return '无直接现金补贴';
  if (min === max) {
    const base = `${max.toLocaleString()}${unit}${periodText ? `/${periodText.replace('每', '')}` : ''}`;
    if (durationMonths && durationMonths > 1) {
      const total = max * durationMonths;
      return `${base}，最长 ${durationMonths} 个月（合计约 ${total.toLocaleString()}${unit}）`;
    }
    return base;
  }
  const range = `${min.toLocaleString()} – ${max.toLocaleString()}${unit}`;
  if (durationMonths && durationMonths > 1) {
    return `${range}，${periodText}，最长 ${durationMonths} 个月`;
  }
  return periodText ? `${range}（${periodText}）` : range;
}

/**
 * 生成右上角金额展示数据。
 * - 有 matchedAmount（结果页/对比页）：展示总额，副行为计算明细
 * - 无 matchedAmount（政策库页）：展示参考金额 + 周期/月数明细
 * 按月/季发放且有多月时，副行展示 ×N个月 = 总额。
 */
function getAmountDisplay(
  subsidy: Subsidy,
  matchedAmount?: number,
  amountBreakdown?: string
): AmountDisplay {
  const { min, max, unit, period, durationMonths } = subsidy.amount;

  // 无现金补贴
  if (min === 0 && max === 0) {
    return { main: '非现金' };
  }

  // 已匹配：展示匹配总额 + 明细副行
  if (matchedAmount !== undefined) {
    return {
      main: matchedAmount.toLocaleString(),
      unit: '元',
      sub: amountBreakdown,
    };
  }

  // 未匹配：根据 amount 结构生成展示
  const isMonthly = period?.includes('月');
  const isQuarterly = period?.includes('季');
  const hasDuration = durationMonths && durationMonths > 1;

  // 计算按月/季的周期后缀
  const periodSuffix = isMonthly ? '/月' : isQuarterly ? '/季' : period ? `/${period.replace('每', '')}` : '';

  if (min === max) {
    // 固定金额
    const main = `${max.toLocaleString()}${unit}${periodSuffix}`;
    if (hasDuration) {
      const total = isMonthly
        ? max * durationMonths
        : isQuarterly
          ? max * 4
          : max;
      const totalMonths = isMonthly ? durationMonths : isQuarterly ? 4 : 1;
      const sub = isMonthly
        ? `× ${totalMonths}个月 = ${total.toLocaleString()}${unit}`
        : isQuarterly
          ? `× 4季度 = ${total.toLocaleString()}${unit}`
          : undefined;
      return { main, sub };
    }
    return { main };
  }

  // 范围金额
  const main = `${min.toLocaleString()} – ${max.toLocaleString()}${unit}${periodSuffix}`;
  if (hasDuration) {
    const totalMax = isMonthly
      ? max * durationMonths
      : isQuarterly
        ? max * 4
        : max;
    const totalMin = isMonthly
      ? min * durationMonths
      : isQuarterly
        ? min * 4
        : min;
    const totalMonths = isMonthly ? durationMonths : isQuarterly ? 4 : 1;
    const sub = isMonthly
      ? `× ${totalMonths}个月 = ${totalMin.toLocaleString()} – ${totalMax.toLocaleString()}${unit}`
      : isQuarterly
        ? `× 4季度 = ${totalMin.toLocaleString()} – ${totalMax.toLocaleString()}${unit}`
        : undefined;
    return { main, sub };
  }
  return { main };
}

// ===== 条件行生成 =====

function getConditionRows(subsidy: Subsidy, showStatusBadges: boolean): ConditionRow[] {
  const rows: ConditionRow[] = [];
  const c = subsidy.conditions;
  const defaultStatus: ConditionStatus = showStatusBadges ? 'hard-met' : 'neutral';

  if (c.degree && c.degree.length > 0) {
    rows.push({ label: '学历要求', value: c.degree.join('、'), status: defaultStatus });
  }
  if (c.schoolLevel && c.schoolLevel.length > 0) {
    rows.push({ label: '院校要求', value: c.schoolLevel.join('、'), status: defaultStatus });
  }
  if (c.ageLimit) {
    rows.push({
      label: '年龄限制',
      value: `${c.ageLimit}岁以下${c.ageLimitExclusive ? '（不含本数）' : '（含本数）'}`,
      status: defaultStatus,
    });
  }
  if (c.majorInclude && c.majorInclude.length > 0) {
    rows.push({ label: '专业要求', value: c.majorInclude.join('、'), status: defaultStatus });
  }
  if (c.majorExclude && c.majorExclude.length > 0) {
    rows.push({ label: '专业限制', value: c.majorExclude.join('、'), status: defaultStatus });
  }
  if (c.graduationYear) {
    rows.push({
      label: '毕业年限',
      value: c.graduationYear === 'within_2_years' ? '毕业2年内' : '毕业2年以上',
      status: defaultStatus,
    });
  }
  if (c.identityType && c.identityType.length > 0) {
    rows.push({ label: '身份要求', value: c.identityType.join('、'), status: defaultStatus });
  }
  if (c.companyType && c.companyType.length > 0) {
    rows.push({ label: '用人单位类型', value: c.companyType.join('、'), status: defaultStatus });
  }
  if (c.talentLevel && c.talentLevel.length > 0) {
    rows.push({ label: '人才层次', value: c.talentLevel.join('、'), status: defaultStatus });
  }

  // 软性条件（仅在展示状态徽标时标记为 soft）
  if (c.employmentRequired) {
    rows.push({
      label: '就业要求',
      value: '需在该城市全职工作',
      status: showStatusBadges ? 'soft' : 'neutral',
    });
  }
  if (c.householdRequired) {
    rows.push({
      label: '落户要求',
      value: '需落户该城市',
      status: showStatusBadges ? 'soft' : 'neutral',
    });
  }
  if (c.firstShenzhenEmploymentAfter) {
    rows.push({
      label: '首次在深就业创业时间',
      value: `需在 ${c.firstShenzhenEmploymentAfter} 及之后`,
      status: showStatusBadges ? 'soft' : 'neutral',
    });
  }
  if (c.returneeStatus) {
    rows.push({
      label: '留学回国时间',
      value: c.returneeStatus === 'within_2_years' ? '回国2年内' : '回国2年以上',
      status: showStatusBadges ? 'soft' : 'neutral',
    });
  }
  if (c.isFirstLingangEmployment) {
    rows.push({
      label: '临港就业要求',
      value: '需首次在临港新片区就业和居住',
      status: showStatusBadges ? 'soft' : 'neutral',
    });
  }
  if (c.isFirstGuangzhouHukou) {
    rows.push({
      label: '入户要求',
      value: '需首次入户广州且入户对应区域',
      status: showStatusBadges ? 'soft' : 'neutral',
    });
  }
  if (c.requiresFullTime) {
    rows.push({
      label: '全日制要求',
      value: '需为全日制学历',
      status: defaultStatus,
    });
  }
  if (c.employerIndustryRequired) {
    rows.push({
      label: '用人单位要求',
      value: '用人单位须在海淀区注册纳税且属于"1+X+1"现代化产业体系，须先通过审核个人方可申请',
      status: 'warning',
    });
  }
  if (c.huaduImportStatus) {
    rows.push({
      label: '引进时间',
      value: c.huaduImportStatus === 'after_2023' ? '2023年1月1日后新引进花都区' : '2023年1月1日前已在花都',
      status: showStatusBadges ? 'soft' : 'neutral',
    });
  }

  // 通道区分条件：当存在 criterionSets 时，提取各集合间的差异化条件
  if (c.criterionSets && c.criterionSets.length > 0) {
    const sets = c.criterionSets;

    // 落户要求差异：部分通道需要落户、部分不需要
    const householdValues = sets.map((s) => s.householdRequired);
    const hasHouseholdDiff = householdValues.some((v) => v === true) && householdValues.some((v) => v === false);
    if (hasHouseholdDiff) {
      // 超过 4 个集合时用简化展示（避免卡片过长），否则逐集合列出
      const parts =
        sets.length <= 4
          ? sets.filter((s) => s.householdRequired !== undefined).map((s) => `${s.name}：${s.householdRequired ? '需落户' : '无户籍要求'}`)
          : [`境内通道需落户`, `港澳台/外籍通道免落户`];
      rows.push({
        label: '户籍要求',
        value: parts.join('；'),
        status: 'neutral',
      });
    }

    // 就业要求差异
    const empValues = sets.map((s) => s.employmentRequired);
    const hasEmpDiff = empValues.some((v) => v === true) && empValues.some((v) => v === false);
    if (hasEmpDiff) {
      const parts = sets
        .filter((s) => s.employmentRequired !== undefined)
        .map((s) => `${s.name}：${s.employmentRequired ? '需就业' : '无就业要求'}`);
      rows.push({
        label: '就业要求',
        value: parts.join('；'),
        status: 'neutral',
      });
    }

    // 院校要求差异：仅当部分集合确实无任何院校限制时才展示
    // （无 schoolLevel 且无 majorInDoubleFirstClassDiscipline 才是真正无院校限制）
    const hasTrulyNoSchool = sets.some(
      (s) => (!s.schoolLevel || s.schoolLevel.length === 0) && !s.majorInDoubleFirstClassDiscipline
    );
    const hasExplicitSchool = sets.some((s) => s.schoolLevel && s.schoolLevel.length > 0);
    const hasSchoolDiff = hasTrulyNoSchool && hasExplicitSchool;
    if (hasSchoolDiff) {
      const parts = sets.map((s) => {
        const schoolList = s.schoolLevel;
        if (schoolList && schoolList.length > 0) return `${s.name}：${schoolList.join('/')}`;
        if (s.majorInDoubleFirstClassDiscipline) return `${s.name}：双一流建设学科`;
        return `${s.name}：无院校限制`;
      });
      rows.push({
        label: '院校要求',
        value: parts.join('；'),
        status: 'neutral',
      });
    }
  }

  return rows;
}

function StatusBadge({ status }: { status: ConditionStatus }) {
  if (status === 'hard-met') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-celadon/10 px-2 py-0.5 text-[10px] font-semibold text-celadon ring-1 ring-celadon/20">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        符合
      </span>
    );
  }
  if (status === 'soft') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-civic-blue/8 px-2 py-0.5 text-[10px] font-semibold text-civic-blue ring-1 ring-civic-blue/20">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        到城后满足
      </span>
    );
  }
  if (status === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 px-2 py-0.5 text-[10px] font-semibold text-amber ring-1 ring-amber/20">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        注意
      </span>
    );
  }
  return null;
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-500">{icon}</span>
      {children}
    </h4>
  );
}

function InfoGrid({ items }: { items: { label: string; value: React.ReactNode; warning?: boolean }[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-lg border px-3 py-2.5 ${item.warning ? 'border-amber/20 bg-amber/5' : 'border-slate-100 bg-paper'}`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</span>
          <div className="mt-1 font-medium text-slate-800">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ===== 主组件 =====

export function PolicyCard({
  subsidy,
  matchedAmount,
  amountBreakdown,
  dimmed,
  showStatusBadges = false,
  defaultExpanded = false,
}: PolicyCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isFav = isFavorite(subsidy.id);
  const style = categoryStyles[subsidy.category];
  const conditionRows = getConditionRows(subsidy, showStatusBadges);
  const hasCriterionSets = !!subsidy.conditions.criterionSets && subsidy.conditions.criterionSets.length > 0;
  const amountDisplay = getAmountDisplay(subsidy, matchedAmount, amountBreakdown);
  const isMatched = matchedAmount !== undefined;

  return (
    <div
      className={`paper-texture relative rounded-xl border border-slate-200 shadow-sm transition-all ${
        dimmed ? 'opacity-60' : 'hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* 收藏按钮：右上角回形针，半出框；移动端扩大触控热区 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite({
            id: subsidy.id,
            city: subsidy.city,
            name: subsidy.name,
            category: subsidy.category,
            amountMin: subsidy.amount.min,
            amountMax: subsidy.amount.max,
            unit: subsidy.amount.unit,
            location: subsidy.application?.location,
          });
        }}
        className={`absolute -right-1.5 -top-1.5 z-10 flex h-11 w-11 items-center justify-center transition-all focus-ring sm:h-8 sm:w-8 ${
          isFav ? 'text-seal-red' : 'text-slate-300 hover:text-slate-500'
        }`}
        title={isFav ? '取消收藏' : '收藏'}
        aria-label={isFav ? '取消收藏' : '收藏'}
      >
        <svg className="h-5 w-5 transition-transform hover:scale-110" viewBox="0 0 1024 1024" fill="currentColor">
          <path d="M770.784 113.28a293.12 293.12 0 0 0-410.496 57.696L235.712 336.32a31.968 31.968 0 1 0 51.104 38.496l124.576-165.344a229.12 229.12 0 1 1 365.952 275.776l-255.36 338.88a163.84 163.84 0 0 1-261.696-197.184l255.36-338.88a98.528 98.528 0 1 1 157.408 118.624l-216.064 286.752a33.28 33.28 0 1 1-53.184-40.064c86.176-115.616 141.024-189.024 164.544-220.256a32 32 0 1 0-51.136-38.496c-23.616 31.36-78.496 104.8-164.64 220.384a97.28 97.28 0 1 0 155.456 116.96l218.912-290.496c0.992-1.344 1.312-2.912 2.08-4.32 47.36-71.104 32.224-167.456-36.896-219.552a162.56 162.56 0 0 0-227.648 32l-255.36 338.88a227.84 227.84 0 0 0 363.904 274.24l255.36-338.88a293.056 293.056 0 0 0-57.6-410.56z" />
        </svg>
      </button>

      {/* 文件头 */}
      <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md ${style.light} px-2 py-0.5 text-[10px] font-semibold ${style.text} ring-1 ${style.ring} sm:text-xs`}
          >
            <PolicyIcon category={subsidy.category} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {CATEGORY_NAMES[subsidy.category]}
          </span>
          <span className="hidden text-[10px] font-medium text-slate-400 sm:inline sm:text-xs">
            {subsidy.amount.period || '一次性'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 sm:text-xs">
          {subsidy.application?.location && (
            <span className="inline-flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {subsidy.application.location}
            </span>
          )}
          <span className="max-w-[120px] truncate sm:max-w-[180px]">{subsidy.policySource}</span>
        </div>
      </div>

      {/* 穿孔虚线：文件头与正文的分隔 */}
      <div className="border-b border-dashed border-slate-300" />

      {/* 头部：可点击展开 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 pr-12 text-left sm:gap-4 sm:px-6 sm:py-5 sm:pr-14"
      >
        <div className="min-w-0 flex-1">
          <p className="mr-1 line-clamp-2 text-base font-bold text-ink sm:text-lg">{subsidy.name}</p>
          {/* 移动端：金额在标题下方 */}
          <div className="mt-2 sm:hidden">
            <span className={`font-data text-base font-bold ${isMatched ? 'text-civic-blue' : style.text}`}>
              {amountDisplay.main}
              {amountDisplay.unit && <span className="ml-0.5 text-[10px] font-medium text-slate-500">{amountDisplay.unit}</span>}
            </span>
            {amountDisplay.sub && <span className="ml-1.5 text-[10px] text-slate-400">{amountDisplay.sub}</span>}
          </div>
        </div>
        {/* 桌面端：金额在右侧 */}
        <div className="ml-3 hidden shrink-0 flex-col items-end sm:ml-4 sm:flex">
          <span className={`font-data text-lg font-bold ${isMatched ? 'text-civic-blue' : style.text} sm:text-xl`}>
            {amountDisplay.main}
            {amountDisplay.unit && <span className="ml-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">{amountDisplay.unit}</span>}
          </span>
          {amountDisplay.sub && <span className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">{amountDisplay.sub}</span>}
        </div>
        <span
          className="absolute right-3 top-[38px] -translate-y-1/2 text-slate-400 transition-transform duration-200 sm:top-10"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="border-t border-slate-100 bg-paper/60 px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          {/* 申请条件 */}
          {conditionRows.length > 0 && (
            <div>
              <SectionTitle
                icon={
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                申请条件
              </SectionTitle>
              <div className="space-y-2">
                {conditionRows.map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 ${
                      row.status === 'warning' ? 'border-amber/20 bg-amber/5' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <span className={`text-sm ${row.status === 'warning' ? 'text-amber-900' : 'text-slate-700'}`}>
                      <span className={row.status === 'warning' ? 'text-amber-600' : 'text-slate-400'}>{row.label}：</span>
                      <span className="font-medium">{row.value}</span>
                    </span>
                    {(showStatusBadges || row.status === 'warning') && <StatusBadge status={row.status} />}
                  </div>
                ))}
                {hasCriterionSets && (
                  <div className="rounded-lg border border-amber/20 bg-amber/5 px-3 py-2 text-xs leading-relaxed text-amber-800">
                    该政策包含多通道认定标准，满足其中任意一条即可，详见政策原文。
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 申请信息 */}
          <div className="mt-6">
            <SectionTitle
              icon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            >
              申请信息
            </SectionTitle>
            <InfoGrid
              items={[
                {
                  label: '申请时限',
                  value: (
                    <>
                      <span className="mr-1 text-amber">⚠</span>
                      {subsidy.application.deadline}
                    </>
                  ),
                  warning: subsidy.application.deadline.includes('截止') || subsidy.application.deadline.includes('限时'),
                },
                { label: '政策来源', value: subsidy.policySource },
                ...(subsidy.effectiveDate && subsidy.effectiveDate !== '待核实'
                  ? [{ label: '生效日期', value: subsidy.effectiveDate }]
                  : []),
                ...(subsidy.application.location
                  ? [{ label: '适用区域', value: subsidy.application.location }]
                  : []),
              ]}
            />
            {(subsidy.application.url || subsidy.application.channel) && (
              <a
                href={subsidy.application.url || subsidy.application.channel}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-civic-blue hover:underline focus-ring rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                查看官方政策入口
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* 所需材料 */}
          {subsidy.application.materials && subsidy.application.materials.length > 0 && (
            <div className="mt-6">
              <SectionTitle
                icon={
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              >
                所需材料
              </SectionTitle>
              <div className="flex flex-wrap gap-2">
                {subsidy.application.materials.map((m) => (
                  <span
                    key={m}
                    className="rounded-lg border border-slate-100 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 认定标准摘要 */}
          {subsidy.application.talentCriteria && subsidy.application.talentCriteria.length > 0 && (
            <div className="mt-6">
              <SectionTitle
                icon={
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                }
              >
                认定标准摘要
              </SectionTitle>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {subsidy.application.talentCriteria.map((tc) => (
                  <div key={tc.level} className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
                    <span className="text-xs font-semibold text-slate-700">{tc.level}</span>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{tc.criteria}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 申请流程 */}
          {subsidy.application.process && subsidy.application.process.length > 0 && (
            <div className="mt-6">
              <SectionTitle
                icon={
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                }
              >
                申请流程
              </SectionTitle>
              <ol className="list-inside list-decimal space-y-1.5 text-sm text-slate-700">
                {subsidy.application.process.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="font-medium text-slate-500">步骤 {idx + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 政策说明 */}
          {subsidy.notes && (
            <div className="mt-6 rounded-lg border border-civic-blue/15 bg-civic-blue/[0.03] px-4 py-3">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-civic-blue">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                政策说明
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{subsidy.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 导出辅助函数供其他组件使用
export { formatAmount, getAmountDisplay, categoryStyles, categoryIcons, PolicyIcon };
export type { ConditionRow, ConditionStatus, AmountDisplay };
