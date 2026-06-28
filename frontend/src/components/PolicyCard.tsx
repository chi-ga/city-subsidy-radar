import { useState } from 'react';
import { CATEGORY_NAMES } from '../constants';
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

// ===== 分类样式 =====

const categoryStyles: Record<SubsidyCategory, { gradient: string; light: string; text: string; ring: string; bg: string }> = {
  talent: { gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', bg: 'bg-amber-500' },
  rent: { gradient: 'from-blue-500 to-cyan-500', light: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', bg: 'bg-blue-500' },
  buy: { gradient: 'from-emerald-500 to-teal-500', light: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', bg: 'bg-emerald-500' },
  living: { gradient: 'from-rose-500 to-pink-500', light: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', bg: 'bg-rose-500' },
  employment: { gradient: 'from-indigo-500 to-violet-500', light: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', bg: 'bg-indigo-500' },
  startup: { gradient: 'from-purple-500 to-fuchsia-500', light: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200', bg: 'bg-purple-500' },
  settlement: { gradient: 'from-sky-500 to-blue-600', light: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', bg: 'bg-sky-500' },
  other: { gradient: 'from-slate-500 to-slate-600', light: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200', bg: 'bg-slate-500' },
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
    const householdValues = sets.map(s => s.householdRequired);
    const hasHouseholdDiff = householdValues.some(v => v === true) && householdValues.some(v => v === false);
    if (hasHouseholdDiff) {
      // 超过 4 个集合时用简化展示（避免卡片过长），否则逐集合列出
      const parts = sets.length <= 4
        ? sets
            .filter(s => s.householdRequired !== undefined)
            .map(s => `${s.name}：${s.householdRequired ? '需落户' : '无户籍要求'}`)
        : [
            `境内通道需落户`,
            `港澳台/外籍通道免落户`
          ];
      rows.push({
        label: '户籍要求',
        value: parts.join('；'),
        status: 'neutral',
      });
    }

    // 就业要求差异
    const empValues = sets.map(s => s.employmentRequired);
    const hasEmpDiff = empValues.some(v => v === true) && empValues.some(v => v === false);
    if (hasEmpDiff) {
      const parts = sets
        .filter(s => s.employmentRequired !== undefined)
        .map(s => `${s.name}：${s.employmentRequired ? '需就业' : '无就业要求'}`);
      rows.push({
        label: '就业要求',
        value: parts.join('；'),
        status: 'neutral',
      });
    }

    // 院校要求差异：仅当部分集合确实无任何院校限制时才展示
    // （无 schoolLevel 且无 majorInDoubleFirstClassDiscipline 才是真正无院校限制）
    const hasTrulyNoSchool = sets.some(s =>
      (!s.schoolLevel || s.schoolLevel.length === 0) && !s.majorInDoubleFirstClassDiscipline
    );
    const hasExplicitSchool = sets.some(s => s.schoolLevel && s.schoolLevel.length > 0);
    const hasSchoolDiff = hasTrulyNoSchool && hasExplicitSchool;
    if (hasSchoolDiff) {
      const parts = sets.map(s => {
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
    return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">✓ 符合</span>;
  }
  if (status === 'soft') {
    return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">ℹ 到城后满足</span>;
  }
  if (status === 'warning') {
    return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">⚠ 注意</span>;
  }
  return null;
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
  const style = categoryStyles[subsidy.category];
  const conditionRows = getConditionRows(subsidy, showStatusBadges);
  const hasCriterionSets = !!subsidy.conditions.criterionSets && subsidy.conditions.criterionSets.length > 0;

  // 金额展示：匹配结果优先，否则展示参考金额 + 周期明细
  const amountDisplay = getAmountDisplay(subsidy, matchedAmount, amountBreakdown);

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md ${dimmed ? 'opacity-60' : ''}`}>
      {/* 顶部彩色条 */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.gradient}`} />

      {/* 头部：可点击展开 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left sm:gap-4 sm:p-5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full ${style.light} px-2 py-0.5 text-[10px] font-semibold ${style.text} ring-1 ${style.ring} sm:px-2.5 sm:py-1 sm:text-xs`}>
              <PolicyIcon category={subsidy.category} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {CATEGORY_NAMES[subsidy.category]}
            </span>
            {subsidy.application?.location && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 sm:px-2 sm:text-xs">
                <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {subsidy.application.location}
              </span>
            )}
            <span className="text-[10px] text-slate-400 sm:text-xs">{subsidy.amount.period || '一次性'}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 sm:mt-1.5 sm:text-base">{subsidy.name}</p>
        </div>
        <div className="ml-2 flex flex-col items-end shrink-0 sm:ml-4">
          <span className={`text-base font-extrabold ${style.text} sm:text-lg`}>
            {amountDisplay.main}
            {amountDisplay.unit && <span className="ml-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">{amountDisplay.unit}</span>}
          </span>
          {amountDisplay.sub && (
            <span className="mt-0.5 text-[10px] font-medium text-slate-400 sm:text-xs">{amountDisplay.sub}</span>
          )}
          <span className="mt-0.5 text-slate-400 transition-transform duration-200 sm:mt-1" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          {/* 申请条件 */}
          {conditionRows.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                申请条件
              </h4>
              {conditionRows.map((row, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                  <span className="text-sm text-slate-700">
                    <span className="text-slate-400">{row.label}：</span>
                    <span className="font-medium text-slate-800">{row.value}</span>
                  </span>
                  {showStatusBadges && <StatusBadge status={row.status} />}
                </div>
              ))}
              {hasCriterionSets && (
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  该政策包含多通道认定标准，满足其中任意一条即可，详见政策原文。
                </div>
              )}
            </div>
          )}

          {/* 申请信息 */}
          <div className="mt-5 space-y-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              申请信息
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <div className="rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                <span className="text-xs font-medium text-slate-400">申请时限</span>
                <p className="mt-0.5 font-medium text-slate-800">
                  <span className="mr-1 text-amber-500">⚠</span>
                  {subsidy.application.deadline}
                </p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                <span className="text-xs font-medium text-slate-400">政策来源</span>
                <p className="mt-0.5 font-medium text-slate-800">{subsidy.policySource}</p>
              </div>
              {subsidy.effectiveDate && subsidy.effectiveDate !== '待核实' && (
                <div className="rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                  <span className="text-xs font-medium text-slate-400">生效日期</span>
                  <p className="mt-0.5 font-medium text-slate-800">{subsidy.effectiveDate}</p>
                </div>
              )}
              {subsidy.application.location && (
                <div className="rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                  <span className="text-xs font-medium text-slate-400">适用区域</span>
                  <p className="mt-0.5 font-medium text-slate-800">{subsidy.application.location}</p>
                </div>
              )}
            </div>
            {(subsidy.application.url || subsidy.application.channel) && (
              <a
                href={subsidy.application.url || subsidy.application.channel}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                查看官方政策入口
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* 所需材料 */}
          {subsidy.application.materials && subsidy.application.materials.length > 0 && (
            <div className="mt-5 space-y-2.5">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                所需材料
              </h4>
              <div className="flex flex-wrap gap-2">
                {subsidy.application.materials.map((m) => (
                  <span key={m} className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-100">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 认定标准摘要 */}
          {subsidy.application.talentCriteria && subsidy.application.talentCriteria.length > 0 && (
            <div className="mt-5 space-y-2.5">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                认定标准摘要
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {subsidy.application.talentCriteria.map((tc) => (
                  <div key={tc.level} className="rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-100">
                    <span className="text-xs font-semibold text-indigo-700">{tc.level}</span>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{tc.criteria}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 申请流程 */}
          {subsidy.application.process && subsidy.application.process.length > 0 && (
            <div className="mt-5 space-y-2.5">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <svg className="h-3.5 w-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                申请流程
              </h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-slate-700">
                {subsidy.application.process.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* 政策说明 */}
          {subsidy.notes && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
