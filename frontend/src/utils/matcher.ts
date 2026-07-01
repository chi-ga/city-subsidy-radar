import type { UserProfile, Subsidy, SubsidyAmount, MatchResultItem, MatchResult, TodoItem, CriterionSet, Degree } from '../types';
import { IMMUTABLE_CONDITION_PREFIXES, expandLevels } from '../constants';
import {
  schoolHasTopStudentPlan,
  isDoubleFirstClassDiscipline,
  isStemDiscipline,
  isOverseasSchool,
} from '../data/lazyTalent';

function isImmutable(condition: string): boolean {
  return IMMUTABLE_CONDITION_PREFIXES.some((p) => condition.startsWith(p));
}

// 学历层级（用于 minDegree 比较）
const DEGREE_ORDER: Record<string, number> = { 专科: 0, 本科: 1, 硕士: 2, 博士: 3 };

/**
 * 计算补贴的实际总金额（非年化），并返回明细文本
 *  - 一次性 → max 即为总额
 *  - 每月 → max × durationMonths（默认12个月）
 *  - 每季度 → max × 4
 *  - 每年 → max
 * 若提供 tieredAmount 且用户学历命中某档，则使用该档金额。
 */
export function calculateTotalAmount(
  amount: SubsidyAmount,
  degree?: Degree,
  tieredAmount?: Partial<Record<Degree, SubsidyAmount>>
): { total: number; breakdown: string } {
  // 按学历分档：若 tieredAmount 存在且用户学历命中，则使用该档金额
  let effectiveAmount = amount;
  if (tieredAmount && degree && tieredAmount[degree]) {
    effectiveAmount = tieredAmount[degree]!;
  }
  const v = effectiveAmount.max || 0;
  const unitToYuan: Record<string, number> = { 元: 1, 万元: 10000 };
  const yuan = v * (unitToYuan[effectiveAmount.unit] ?? 1);
  const period = (effectiveAmount.period || '').trim();
  const unitLabel = effectiveAmount.unit || '元';

  if (!period || /一次|首年|首年一次性|一次性|首年发/.test(period)) {
    return {
      total: yuan,
      breakdown: `${v}${unitLabel}（一次性）`,
    };
  }
  if (/月|每月|按月|月度/.test(period)) {
    const months = effectiveAmount.durationMonths || amount.durationMonths || 12;
    return {
      total: yuan * months,
      breakdown: `${v}${unitLabel}/月 × ${months}个月 = ${(yuan * months).toLocaleString()}元`,
    };
  }
  if (/季|每季|季度/.test(period)) {
    return {
      total: yuan * 4,
      breakdown: `${v}${unitLabel}/季 × 4季度 = ${(yuan * 4).toLocaleString()}元`,
    };
  }
  if (/半年|半年度/.test(period)) {
    return {
      total: yuan * 2,
      breakdown: `${v}${unitLabel}/半年 × 2 = ${(yuan * 2).toLocaleString()}元`,
    };
  }
  if (/年|每年|年度|年发|连续.*年/.test(period)) {
    return {
      total: yuan,
      breakdown: `${v}${unitLabel}/年`,
    };
  }
  return { total: yuan, breakdown: `${v}${unitLabel}` };
}

/**
 * 判断一个用户是否满足某一个 CriterionSet 的所有条件。
 * 返回 { matched, missing[], applicable }
 *  - applicable=false 时，整个集合视为"不适用"（不计入缺失条件）
 */
export function matchCriterionSet(
  user: UserProfile,
  set: CriterionSet
): { matched: boolean; missing: string[]; applicable: boolean } {
  const missing: string[] = [];

  // 学校区域限制：若用户的学校区域与集合要求不符，集合整体不适用
  if (set.schoolRegion) {
    const userOverseas = isOverseasSchool(user.school);
    if (set.schoolRegion === 'overseas' && !userOverseas) {
      return { matched: false, missing: [], applicable: false };
    }
    if (set.schoolRegion === 'domestic' && userOverseas) {
      return { matched: false, missing: [], applicable: false };
    }
  }

  // 学历下限（如 "具有本科及以上学历"）
  if (set.minDegree) {
    const min = DEGREE_ORDER[set.minDegree] ?? 0;
    const cur = DEGREE_ORDER[user.degree] ?? 0;
    if (cur < min) {
      missing.push(`学历要求：${set.minDegree}及以上（当前：${user.degree || '未填写'}）`);
    }
  }
  // 学历必须命中列表
  if (set.degree && set.degree.length > 0 && !set.degree.includes(user.degree)) {
    missing.push(`学历要求：${set.degree.join('/')}`);
  }

  // 院校层次（任一即满足）
  if (set.schoolLevel && set.schoolLevel.length > 0) {
    const expanded = expandLevels(user.schoolLevel);
    const has = expanded.some((lvl) => set.schoolLevel!.includes(lvl));
    if (!has) {
      // 若高校是用户输入但 levels 为空（未匹配到库），给出友好提示
      const schoolName = user.school;
      if (schoolName && !schoolHasTopStudentPlan(schoolName) && user.schoolLevel.length === 0) {
        missing.push(`院校要求：${set.schoolLevel.join('/')}（未识别出层级，请确认高校全称）`);
      } else {
        missing.push(`院校要求：${set.schoolLevel.join('/')}`);
      }
    }
  }

  // 年龄上限（防御：age 为 0 或 undefined 时不跳过检查）
  if (set.ageLimit) {
    const exceeds = set.ageLimitExclusive
      ? (!user.age || user.age >= set.ageLimit)
      : (!user.age || user.age > set.ageLimit);
    if (exceeds) {
      missing.push(`年龄上限：${set.ageLimit}岁${set.ageLimitExclusive ? '（不含本数）' : ''}`);
    }
  }

  // 重点产业领域专业目录
  if (set.majorInShenzhenKeyIndustry) {
    if (user.majorInShenzhenKeyIndustry !== true) {
      missing.push('专业未在《重点产业领域专业目录》内');
    }
  }

  // 双一流学科
  if (set.majorInDoubleFirstClassDiscipline) {
    if (!user.school || !user.majorFirstLevelDiscipline) {
      missing.push('需填写高校与专业一级学科并匹配"双一流"学科');
    } else if (
      !isDoubleFirstClassDiscipline(user.school, user.majorFirstLevelDiscipline)
    ) {
      missing.push(
        `专业一级学科未在该校"双一流"学科内（当前：${user.majorFirstLevelDiscipline}）`
      );
    }
  }

  // STEM 专业（仅用于境外高校榜单前200）
  if (set.isStemMajor) {
    if (user.isStemMajor === false) {
      missing.push('境外高校专业不属于 STEM');
    } else if (user.isStemMajor === undefined) {
      // 用户没填 → 视为不满足
      missing.push('需确认境外高校所学专业属于 STEM');
    } else if (user.majorFirstLevelDiscipline) {
      // 双重校验（前端 UI 也会校验）
      if (!isStemDiscipline(user.majorFirstLevelDiscipline)) {
        missing.push('境外高校专业一级学科不属于 STEM');
      }
    }
  }

  // 拔尖计划
  if (set.inTopStudentPlan) {
    if (user.inTopStudentPlan !== true) {
      // 高校就不在名单里
      if (user.school && !schoolHasTopStudentPlan(user.school)) {
        missing.push('所在高校未设有"国家高校拔尖创新人才计划"基地');
      } else {
        missing.push('需确认入选"国家高校拔尖创新人才计划"');
      }
    }
  }

  // 创新能力类
  if (set.hasInnovationAbility && !user.hasInnovationAbility) {
    missing.push('需满足"创新能力类"任一细则');
  }

  // 创新贡献类
  if (set.hasInnovationContribution && !user.hasInnovationContribution) {
    missing.push('需满足"创新贡献类"任一细则');
  }

  // 落户要求（criterionSets 内使用，如区分国内/海外博士的户籍限制）
  if (set.householdRequired && user.householdStatus !== '已落户') {
    missing.push('需要已落户');
  }

  // 就业要求（criterionSets 内使用）
  if (set.employmentRequired && user.employmentStatus !== '已就业') {
    missing.push('需要已就业');
  }

  // 身份类型要求（criterionSets 内使用，如外籍通道仅限外籍人士）
  if (set.identityType && set.identityType.length > 0) {
    if (!user.identityType || !set.identityType.includes(user.identityType)) {
      missing.push(`身份要求：${set.identityType.join('/')}`);
    }
  }

   // 首次在深就业创业时间（深圳 2026 青年人才新政）
  if (set.firstShenzhenEmploymentAfter) {
    if (!user.firstShenzhenEmploymentDate) {
      missing.push(`首次在深就业创业时间需在 ${set.firstShenzhenEmploymentAfter} 及之后`);
    } else if (user.firstShenzhenEmploymentDate < set.firstShenzhenEmploymentAfter) {
      missing.push(`首次在深就业创业时间需在 ${set.firstShenzhenEmploymentAfter} 及之后（当前：${user.firstShenzhenEmploymentDate}）`);
    }
  }

  // 集合内全日制要求
  if (set.requiresFullTime) {
    if (user.isFullTime !== true) {
      missing.push('全日制要求：需为全日制学历');
    }
  }

  return { matched: missing.length === 0, missing, applicable: true };
}

/**
 * 当 policy 拥有 criterionSets 时，匹配规则变为：
 *   - 用户在集合中至少有一个"适用且全部条件都满足"的集合 → 视为匹配
 *   - 缺失条件返回：所有"适用且不满足"的集合的缺失条件并集（去重）
 *   - 不适用的集合（如境外/境内分支对调）会被忽略
 */
export function matchByCriterionSets(
  user: UserProfile,
  sets: CriterionSet[]
): { matched: boolean; missing: string[]; matchedSet?: CriterionSet } {
  const allMissing = new Set<string>();
  for (const set of sets) {
    const r = matchCriterionSet(user, set);
    if (!r.applicable) continue;
    if (r.matched) {
      return { matched: true, missing: [], matchedSet: set };
    }
    for (const m of r.missing) {
      allMissing.add(m);
    }
  }
  return { matched: false, missing: Array.from(allMissing) };
}

export function matchSubsidy(user: UserProfile, subsidy: Subsidy): MatchResultItem {
  // 双学位金额处理：若政策区分双学位金额，无双学位时用 baseTieredAmount（基础档），有双学位时用 tieredAmount（满额）
  let effectiveTiered = subsidy.tieredAmount;
  if (subsidy.requiresDoubleDegree) {
    effectiveTiered = user.hasDoubleDegree === true
      ? subsidy.tieredAmount        // 满额档（本科3万/硕士5万）
      : subsidy.baseTieredAmount;   // 基础档（本科2万/硕士3万）
  }
  const { total, breakdown } = calculateTotalAmount(subsidy.amount, user.degree, effectiveTiered);

  // 第一步：检查外层标准条件（degree/schoolLevel/major/ageLimit/graduationYear/
  //         employmentRequired/householdRequired/talentLevel/identityType）
  //         无论是否存在 criterionSets，外层标准条件都必须满足（取交集）
  const standardMissing: string[] = [];

  if (subsidy.conditions.degree && !subsidy.conditions.degree.includes(user.degree)) {
    standardMissing.push(`学历要求：${subsidy.conditions.degree.join('/')}`);
  }

  if (
    subsidy.conditions.schoolLevel &&
    !expandLevels(user.schoolLevel).some((level) => subsidy.conditions.schoolLevel?.includes(level as never))
  ) {
    standardMissing.push(`院校要求：${subsidy.conditions.schoolLevel.join('/')}`);
  }

  if (subsidy.conditions.majorInclude && subsidy.conditions.majorInclude.length > 0) {
    const userMajor = (user.major || '').trim();
    const hit = subsidy.conditions.majorInclude.some((m) => userMajor.includes(m));
    if (!hit) {
      standardMissing.push(`专业要求：${subsidy.conditions.majorInclude.join('/')}`);
    }
  }
  if (subsidy.conditions.majorExclude && subsidy.conditions.majorExclude.length > 0) {
    const userMajor = (user.major || '').trim();
    const hit = subsidy.conditions.majorExclude.some((m) => userMajor.includes(m));
    if (hit) {
      standardMissing.push(`专业限制：${subsidy.conditions.majorExclude.join('/')}`);
    }
  }

  if (subsidy.conditions.ageLimit) {
    // 北京三城一区可放宽年龄至50岁
    let effectiveAgeLimit = subsidy.conditions.ageLimit;
    if (user.isInThreeCitiesOneDistrict && subsidy.city === 'beijing' && subsidy.conditions.ageLimit < 50) {
      effectiveAgeLimit = 50;
    }
    const exceeds = subsidy.conditions.ageLimitExclusive
      ? (!user.age || user.age >= effectiveAgeLimit)
      : (!user.age || user.age > effectiveAgeLimit);
    if (exceeds) {
      standardMissing.push(`年龄上限：${effectiveAgeLimit}岁${subsidy.conditions.ageLimitExclusive ? '（不含本数）' : ''}`);
    }
  }

  // 毕业年份状态匹配（如"毕业2年内"）
  if (subsidy.conditions.graduationYear) {
    if (!user.graduationYear || user.graduationYear !== subsidy.conditions.graduationYear) {
      const label = subsidy.conditions.graduationYear === 'within_2_years' ? '毕业2年内' : '毕业2年以上';
      standardMissing.push(`毕业年份要求：${label}`);
    }
  }

  if (subsidy.conditions.employmentRequired && user.employmentStatus !== '已就业') {
    standardMissing.push('需要已就业');
  }

  if (subsidy.conditions.householdRequired && user.householdStatus !== '已落户') {
    standardMissing.push('需要已落户');
  }

  // 深圳高层次人才层次匹配
  if (subsidy.conditions.talentLevel && subsidy.conditions.talentLevel.length > 0) {
    if (!user.talentLevel || !subsidy.conditions.talentLevel.includes(user.talentLevel)) {
      standardMissing.push(`人才层次：${subsidy.conditions.talentLevel.join('/')}`);
    }
  }

  // 身份类型匹配（港澳台/外籍等限制）
  if (subsidy.conditions.identityType && subsidy.conditions.identityType.length > 0) {
    if (!user.identityType || !subsidy.conditions.identityType.includes(user.identityType)) {
      standardMissing.push(`身份要求：${subsidy.conditions.identityType.join('/')}`);
    }
  }

  // 首次在深就业创业时间（深圳 2026 青年人才新政）
  if (subsidy.conditions.firstShenzhenEmploymentAfter) {
    if (!user.firstShenzhenEmploymentDate) {
      standardMissing.push(`首次在深就业创业时间需在 ${subsidy.conditions.firstShenzhenEmploymentAfter} 及之后`);
    } else if (user.firstShenzhenEmploymentDate < subsidy.conditions.firstShenzhenEmploymentAfter) {
      standardMissing.push(`首次在深就业创业时间需在 ${subsidy.conditions.firstShenzhenEmploymentAfter} 及之后`);
    }
  }

  // 北京三城一区年龄放宽（可放宽至50岁）
  // 注意：这个逻辑需要在ageLimit检查中处理，这里只是一个标记
  // 实际的年龄放宽逻辑在ageLimit检查中通过isInThreeCitiesOneDistrict判断

  // 上海留学回国时间状态匹配
  if (subsidy.conditions.returneeStatus) {
    if (!user.returneeStatus || user.returneeStatus !== subsidy.conditions.returneeStatus) {
      const label = subsidy.conditions.returneeStatus === 'within_2_years' ? '回国2年内' : '回国2年以上';
      standardMissing.push(`留学回国时间要求：${label}`);
    }
  }

  // 上海临港首次就业匹配
  if (subsidy.conditions.isFirstLingangEmployment) {
    if (user.isFirstLingangEmployment !== true) {
      standardMissing.push('需为首次在临港新片区就业');
    }
  }

  // 广州黄埔首次入户广州匹配
  if (subsidy.conditions.isFirstGuangzhouHukou) {
    if (user.isFirstGuangzhouHukou !== true) {
      standardMissing.push('需为首次入户广州且入户黄埔区');
    }
  }

  // 用人单位类型匹配（南京雨花台区等限定企业类型）
  if (subsidy.conditions.companyType && subsidy.conditions.companyType.length > 0) {
    if (!user.companyType || !subsidy.conditions.companyType.includes(user.companyType)) {
      standardMissing.push(`用人单位类型：${subsidy.conditions.companyType.join('/')}`);
    }
  }

  // 全日制学历匹配
  if (subsidy.conditions.requiresFullTime) {
    if (user.isFullTime !== true) {
      standardMissing.push('全日制要求：需为全日制学历');
    }
  }

  // 广州花都引进时间匹配
  if (subsidy.conditions.huaduImportStatus) {
    if (!user.huaduImportStatus || user.huaduImportStatus !== subsidy.conditions.huaduImportStatus) {
      const label = subsidy.conditions.huaduImportStatus === 'after_2023' ? '2023年1月1日后新引进花都区' : '2023年1月1日前已在花都';
      standardMissing.push(`引进时间要求：${label}`);
    }
  }

  // 外层标准条件不满足 → 直接判负，缺失条件为标准条件缺失项
  if (standardMissing.length > 0) {
    return {
      subsidy,
      matched: false,
      matchedAmount: 0,
      missingConditions: standardMissing,
    };
  }

  // 第二步：若存在 criterionSets，则在标准条件已满足的基础上，
  //         要求至少有一个集合"适用且全部条件都满足"（取交集）
  if (subsidy.conditions.criterionSets && subsidy.conditions.criterionSets.length > 0) {
    const { matched, missing, matchedSet } = matchByCriterionSets(user, subsidy.conditions.criterionSets);
    // 若匹配到的集合自带金额配置，则优先使用该集合的金额
    let setTotal = total;
    let setBreakdown = breakdown;
    if (matched && matchedSet?.amount) {
      const setTiered = matchedSet.tieredAmount;
      const r = calculateTotalAmount(matchedSet.amount, user.degree, setTiered);
      setTotal = r.total;
      setBreakdown = r.breakdown;
    }
    return {
      subsidy,
      matched,
      matchedAmount: matched ? setTotal : 0,
      amountBreakdown: matched ? setBreakdown : undefined,
      missingConditions: missing,
    };
  }

  // 无 criterionSets：标准条件全部满足即匹配
  return {
    subsidy,
    matched: true,
    matchedAmount: total,
    amountBreakdown: breakdown,
    missingConditions: [],
  };
}

export function matchAllSubsidies(user: UserProfile, subsidies: Subsidy[]): MatchResult {
  const results = subsidies.map((s) => matchSubsidy(user, s));
  const matchedResults = results.filter((r) => r.matched);

  // 互斥组处理：同一组只能领一个，金额取最高值；无组的政策直接累加
  const groupMaxAmounts: Record<string, number> = {};
  for (const r of matchedResults) {
    const g = r.subsidy.exclusiveGroup;
    if (!g) continue;
    if (!(g in groupMaxAmounts) || r.matchedAmount > groupMaxAmounts[g]) {
      groupMaxAmounts[g] = r.matchedAmount;
    }
  }
  const countedGroups = new Set<string>();
  const totalAmount = matchedResults.reduce((sum, r) => {
    const g = r.subsidy.exclusiveGroup;
    if (g) {
      if (!countedGroups.has(g)) {
        countedGroups.add(g);
        return sum + groupMaxAmounts[g];
      }
      return sum;
    }
    return sum + r.matchedAmount;
  }, 0);

  // “你还能拿更多”只推荐用户可补齐的项，排除不可变条件（学历/院校/专业）
  const nearMissItems = results
    .filter((r) => {
      if (r.matched) return false;
      const mutableMissing = r.missingConditions.filter((c) => !isImmutable(c));
      return mutableMissing.length > 0 && mutableMissing.length <= 2;
    })
    .map((r) => ({
      ...r,
      // 只保留可变的缺失条件
      missingConditions: r.missingConditions.filter((c) => !isImmutable(c)),
    }));

  const todoList = generateTodoList(matchedResults);

  return {
    subsidies: results,
    totalAmount,
    todoList,
    nearMissItems,
    reverseSuggestions: nearMissItems.slice(0, 3).map((r) => ({
      subsidyName: r.subsidy.name,
      suggestion: `还差：${r.missingConditions.join('；')}`,
    })),
  };
}

export interface ExclusiveGroup {
  groupId: string;
  name: string;
  items: MatchResultItem[];
  selected: MatchResultItem;
  totalAmount: number;
}

const EXCLUSIVE_GROUP_NAMES: Record<string, string> = {
  'shenzhen-district': '深圳区级补贴（只能在一个区享受）',
  'shanghai-district': '上海区级补贴（只能在一个区享受）',
  'guangzhou-district': '广州区级补贴（只能在一个区享受）',
  'beijing-district': '北京区级补贴（只能在一个区享受）',
  'hangzhou-district': '杭州区级补贴（只能在一个区享受）',
  'nanjing-district': '南京区级补贴（只能在一个区享受）',
  'chongqing-district': '重庆区级补贴（只能在一个区享受）',
  'quanzhou-district': '泉州区县补贴（只能在一个区县享受）',
  'wuhan-district': '武汉区级补贴（只能在一个区享受）',
  'wenzhou-district': '温州区级补贴（只能在一个区享受）',
  'ningbo-district': '宁波区级补贴（只能在一个区享受）',
  'chengdu-district': '成都区级补贴（只能在一个区享受）',
  'jiaxing-district': '嘉兴区县补贴（只能在一个区县享受）',
  'shaoxing-district': '绍兴区县补贴（只能在一个区县享受）',
  'zhuhai-district': '珠海区级补贴（只能在一个区享受）',
  'nanning-district': '南宁区级补贴（只能在一个区享受）',
  'qingdao-district': '青岛区级补贴（只能在一个区享受）',
  'fuzhou-district': '福州区级补贴（只能在一个区享受）',
  'kunming-district': '昆明区级补贴（只能在一个区县享受）',
  'tianjin-district': '天津区级补贴（只能在一个区享受）',
  'suzhou-district': '苏州区级补贴（只能在一个区享受）',
  'huizhou-district': '惠州区级补贴（只能在一个区享受）',
  'dalian-district': '大连区级补贴（只能在一个区享受）',
  'shenyang-district': '沈阳区级补贴（只能在一个区享受）',
  'shijiazhuang-district': '石家庄区级补贴（只能在一个区享受）',
  'yantai-district': '烟台区级补贴（只能在一个区享受）',
  'nantong-district': '南通区级补贴（只能在一个区享受）',
  'changzhou-district': '常州区级补贴（只能在一个区享受）',
  'tangshan-district': '唐山区级补贴（只能在一个区享受）',
  'wuhu-goufang': '芜湖购房补贴（企业与非企业单位二选一）',
  'ganzhou-district': '赣州区级补贴（只能在一个区享受）',
  'yinchuan-district': '银川区级补贴（只能在一个区享受）',
  'jinhua-jiuye': '金华就业补贴（中小微企业与养老家政农业企业二选一）',
  'taizhou-jiuye': '台州就业补贴（中小微企业与养老家政农业企业二选一）',
  'baoding-zufang-goufang': '保定租房与购房补贴（不可同时享受）',
  'taizhoujs-district': '泰州区级补贴（只能在一个区享受）',
};

export function getExclusiveGroupName(groupId: string): string {
  return EXCLUSIVE_GROUP_NAMES[groupId] || `互斥组：${groupId}`;
}

/**
 * 将匹配结果按互斥组分组。
 * 同一组的政策只能领取一个，金额取最高值；无组的政策作为独立项返回。
 */
export function groupExclusiveItems(items: MatchResultItem[]): {
  groups: ExclusiveGroup[];
  standalone: MatchResultItem[];
} {
  const groupsMap = new Map<string, MatchResultItem[]>();
  const standalone: MatchResultItem[] = [];

  for (const item of items) {
    const g = item.subsidy.exclusiveGroup;
    if (!g) {
      standalone.push(item);
    } else {
      if (!groupsMap.has(g)) groupsMap.set(g, []);
      groupsMap.get(g)!.push(item);
    }
  }

  const groups = Array.from(groupsMap.entries()).map(([groupId, groupItems]) => {
    const sorted = [...groupItems].sort((a, b) => b.matchedAmount - a.matchedAmount);
    const selected = sorted[0];
    return {
      groupId,
      name: getExclusiveGroupName(groupId),
      items: sorted,
      selected,
      totalAmount: selected.matchedAmount,
    };
  });

  return { groups, standalone };
}

/**
 * 应用区域筛选：
 *  - 未传 / 空 / '不限'：返回原始数组
 *  - 选了区：保留市级（application.location === '市级'）和 location 等于该区名的项
 *  - 也兼容老格式 "上海市·徐汇区"
 */
/**
 * 按政策分层过滤：
 *  - tier 1 = 大众普惠层（默认展示，基础问卷字段直接匹配）
 *  - tier 2 = 细分追问层（条件触发展示）
 *  - tier 3 = 专业通道层（不参与自动匹配，仅展示入口）
 *
 *  默认返回 tier 1 + tier 2，tier 3 需用户主动探索
 */
export function filterByTier(subsidies: Subsidy[], tiers: number[] = [1, 2]): Subsidy[] {
  return subsidies.filter((s) => tiers.includes(s.tier ?? 1));
}

export function applyDistrictFilter(subsidies: Subsidy[], district?: string): Subsidy[] {
  if (!district || district === '不限' || district === '') return subsidies;
  // 兼容两种入参：
  //   a) "徐汇区"             → 直接匹配
  //   b) "上海市·徐汇区"      → 取出 "徐汇区"
  const districtName = district.includes('·') ? district.split('·')[1] : district;
  return subsidies.filter((s) => {
    const loc = s.application?.location || '';
    if (!loc) return true; // 无 location 信息默认保留
    if (loc === '市级') return true; // 市级始终保留
    if (districtName && (loc === districtName || loc.includes(districtName))) return true;
    return false;
  });
}

export function generateTodoList(results: MatchResultItem[]): TodoItem[] {
  const todos: TodoItem[] = [];

  results.forEach((result) => {
    const subsidy = result.subsidy;
    const app = subsidy.application;

    if (!app) {
      // 若政策数据缺少 application 字段，生成一条基础 TODO（必填字段用空值填充）
      todos.push({
        id: `${subsidy.id}-apply`,
        title: `准备材料并提交【${subsidy.name}】申请`,
        subsidyId: subsidy.id,
        deadline: '',
        channel: '',
        materials: [],
        process: undefined,
        completed: false,
      });
      return;
    }

    todos.push({
      id: `${subsidy.id}-apply`,
      title: `准备材料并提交【${subsidy.name}】申请`,
      subsidyId: subsidy.id,
      deadline: app.deadline,
      channel: app.channel,
      materials: app.materials,
      process: app.process,
      completed: false,
    });
  });

  return todos;
}
