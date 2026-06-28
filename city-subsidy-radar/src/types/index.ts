export interface SubsidyAmount {
  min: number;
  max: number;
  unit: '元' | '万元';
  period?: string;
  /** 持续月数（用于按月发放的补贴计算总额，如住房补贴发24个月） */
  durationMonths?: number;
}

/**
 * 按学历分档的金额配置。
 * 当政策对不同学历（本科/硕士/博士）发放不同金额时使用。
 * key 为学历名称，value 为该学历对应的金额。
 * 匹配时若用户学历命中某档，则使用该档金额；否则回退到 Subsidy.amount。
 */
export type TieredAmount = Partial<Record<string, SubsidyAmount>>;

import type { SchoolLevel, Degree, HouseholdStatus, EmploymentStatus, SubsidyCategory, CityCode, TalentLevel, IdentityType } from '../constants';

export interface SubsidyConditions {
  degree?: Degree[];
  schoolLevel?: SchoolLevel[];
  ageLimit?: number;
  /** 毕业年份要求：'within_2_years' = 毕业2年内可申领，'over_2_years' = 毕业2年以上 */
  graduationYear?: 'within_2_years' | 'over_2_years';
  employmentRequired?: boolean;
  householdRequired?: boolean;
  /** 年龄上限是否不含本数（如"45周岁以下（不含）"→ exclusive=true 时 45 岁不通过） */
  ageLimitExclusive?: boolean;
  majorInclude?: string[];
  majorExclude?: string[];
  workExperience?: number;
  companyType?: string[];
  /** 深圳高层次人才层次要求（任一即满足） */
  talentLevel?: TalentLevel[];
  /** 身份类型要求（任一即满足）；不填则不限制 */
  identityType?: IdentityType[];
  /** 首次在深就业创业时间需不早于该日期（用于深圳 2026 青年人才新政），格式 YYYY-MM-DD */
  firstShenzhenEmploymentAfter?: string;

  // ===== 新增条件字段 =====
  /** 留学回国时间状态要求（上海留学回国落户专用） */
  returneeStatus?: 'within_2_years' | 'over_2_years';
  /** 是否要求首次在临港就业（上海临港安家补贴专用） */
  isFirstLingangEmployment?: boolean;
  /** 是否要求首次入户广州（广州黄埔入户奖励专用） */
  isFirstGuangzhouHukou?: boolean;
  /** 花都区引进时间要求（广州花都引进人才专用） */
  huaduImportStatus?: 'after_2023' | 'before_2023';
  /** 是否要求全日制学历（黄埔入户奖励/南山落户补贴等专用） */
  requiresFullTime?: boolean;

  /**
   * "任一集合即匹配"的特殊规则集。
   * 当存在时，标准的 conditions 字段失效，改为按以下逻辑匹配：
   *   - 用户在 `criterionSets` 中至少有一个集合的所有条件都满足即视为匹配
   * 用于支持《深圳市青年人才认定》这种"任一标准即可"的政策。
   * 内部字段含义见下方 CriterionSet / CriterionItem。
   */
  criterionSets?: CriterionSet[];
}

/**
 * 一个判定集合（一行认定标准）。
 * 集合内的所有条件为 AND 关系；多个集合之间为 OR 关系。
 */
export interface CriterionSet {
  /** 集合 ID（同一政策内唯一，用于 UI 标识） */
  id: string;
  /** 集合名称/描述（用于提示用户） */
  name: string;
  /** 学历下限；用户实际学历需 ≥ 该值。 */
  minDegree?: Degree;
  /** 用户学历必须命中此列表（与 minDegree 同时设置时，maxDegree 必须存在以表示区间） */
  degree?: Degree[];
  /** 院校层次必须命中此列表（任一即满足） */
  schoolLevel?: SchoolLevel[];
  /** 学校区域限制：
   *   - 'domestic' 仅境内高校；
   *   - 'overseas'  仅境外高校；
   *   - 不填则不限制。
   *  当用户的学校区域与本字段不匹配时，该集合视为"不适用"（不计入缺失条件）。 */
  schoolRegion?: 'domestic' | 'overseas';
  /** 年龄上限 */
  ageLimit?: number;
  /** 年龄上限是否不含本数（如"45周岁以下（不含）"→ exclusive=true 时 45 岁不通过） */
  ageLimitExclusive?: boolean;
  /** 用户专业一级学科需在《重点产业领域专业目录》内（境内+境外高校都适用） */
  majorInShenzhenKeyIndustry?: boolean;
  /** 用户专业一级学科需在国家"双一流"学科名单内（按学校+一级学科匹配） */
  majorInDoubleFirstClassDiscipline?: boolean;
  /** 用户专业属于 STEM（境外高校榜单前200专用） */
  isStemMajor?: boolean;
  /** 用户入选了"国家高校拔尖创新人才计划" */
  inTopStudentPlan?: boolean;
  /** 用户满足"创新能力类"（选中的选项ID） */
  hasInnovationAbility?: string;
  /** 用户满足"创新贡献类"（选中的选项ID） */
  hasInnovationContribution?: string;
  /** 落户要求（用于 criterionSets 内区分国内/海外路径的户籍限制） */
  householdRequired?: boolean;
  /** 就业要求（用于 criterionSets 内的就业状态限制） */
  employmentRequired?: boolean;
  /** 身份类型要求（用于 criterionSets 内的身份限制，如外籍通道仅限外籍人士） */
  identityType?: IdentityType[];
  /** 首次在深就业创业时间需不早于该日期（用于深圳 2026 青年人才新政），格式 YYYY-MM-DD */
  firstShenzhenEmploymentAfter?: string;
}

export interface SubsidyApplication {
  deadline: string;
  channel: string;
  materials: string[];
  location: string;
  url?: string;
  /** 申请流程步骤（可选） */
  process?: string[];
  /** 人才认定标准摘要（仅人才奖励类政策使用），展现在政策卡片展开区域 */
  talentCriteria?: { level: string; criteria: string }[];
}

export interface Subsidy {
  id: string;
  city: CityCode;
  name: string;
  category: SubsidyCategory;
  amount: SubsidyAmount;
  /** 按学历分档金额：当政策对不同学历发放不同金额时使用。匹配时按用户学历取对应档金额。 */
  tieredAmount?: TieredAmount;
  /** 非双学位基础档金额：仅当 requiresDoubleDegree=true 时使用。无双学位时按此档金额匹配。 */
  baseTieredAmount?: TieredAmount;
  conditions: SubsidyConditions;
  application: SubsidyApplication;
  policySource: string;
  effectiveDate: string;
  notes?: string;
  /**
   * 政策分层：
   *  1 = 大众普惠层（默认展示，条件直接映射基础问卷字段）
   *  2 = 细分追问层（条件触发展示，如身份/行业/时间等额外条件）
   *  3 = 专业通道层（不参与自动匹配，仅在结果页展示入口）
   */
  tier?: 1 | 2 | 3;
  /** 是否区分双学位金额：true 时 amount 为基础档（无双学位），tieredAmount 为满额档（有双学位） */
  requiresDoubleDegree?: boolean;
  /**
   * 互斥组 ID。同一组的政策只能领取一个，金额取最高值；不同组之间可叠加。
   * 无互斥关系的政策不设置此字段。
   */
  exclusiveGroup?: string;
}

export interface School {
  id: string;
  name: string;
  pinyin: string;
  abbreviation?: string;
  aliases?: string[];
  levels: SchoolLevel[];
  city: string;
  province: string;
}

export interface UserProfile {
  city?: CityCode;
  school: string;
  schoolLevel: SchoolLevel[];
  degree: Degree;
  major: string;
  age: number;
  /** 毕业年份状态：'within_2_years' = 毕业2年内，'over_2_years' = 毕业2年以上 */
  graduationYear?: 'within_2_years' | 'over_2_years';
  householdStatus: HouseholdStatus;
  employmentStatus: EmploymentStatus;
  /** 目标区域/区（可选）。不选 = 全市（含市级 + 所有区级）；选了 = 优先展示该区 + 市级 */
  district?: string;

  // ===== 深圳青年人才认定专用字段（可选） =====

  /** 一级学科（用于双一流学科匹配）。可由用户填写或从专业下拉中自动回填 */
  majorFirstLevelDiscipline?: string;
  /** 用户专业是否属于"重点产业领域专业目录"（内部由专业选择回填） */
  majorInShenzhenKeyIndustry?: boolean;
  /** 用户专业是否属于 STEM（境外高校榜单前200专用） */
  isStemMajor?: boolean;
  /** 是否入选"国家高校拔尖创新人才计划" */
  inTopStudentPlan?: boolean;
  /** 入选的基地名称（可空，UI 上可留空） */
  topStudentPlanBase?: string;
  /** 是否满足"创新能力类"任一细则（选中的选项ID） */
  hasInnovationAbility?: string;
  /** 是否满足"创新贡献类"任一细则（选中的选项ID） */
  hasInnovationContribution?: string;
  /** 深圳高层次人才认定层次（用户自行选择） */
  talentLevel?: TalentLevel;
  /** 身份类型（内地居民/港澳居民/台湾居民/外籍人士） */
  identityType?: IdentityType;
  /** 首次在深就业创业日期（格式 YYYY-MM-DD，用于深圳 2026 青年人才新政） */
  firstShenzhenEmploymentDate?: string;

  // ===== 广州黄埔区专用字段 =====
  /** 是否首次入户广州（黄埔入户奖励要求） */
  isFirstGuangzhouHukou?: boolean;

  // ===== 上海留学回国专用字段 =====
  /** 留学回国时间状态 */
  returneeStatus?: 'within_2_years' | 'over_2_years';

  // ===== 上海临港专用字段 =====
  /** 是否首次在临港就业 */
  isFirstLingangEmployment?: boolean;

  // ===== 北京专用字段 =====
  /** 是否在三城一区工作（可放宽年龄至50岁） */
  isInThreeCitiesOneDistrict?: boolean;

  // ===== 广州花都区专用字段 =====
  /** 引进时间状态 */
  huaduImportStatus?: 'after_2023' | 'before_2023';

  // ===== 全日制/非全日制 =====
  /** 是否为全日制学历（部分补贴要求全日制方可申领） */
  isFullTime?: boolean;

  // ===== 双学位 =====
  /** 是否拥有双学位（南山区等落户补贴要求双学位才给满额） */
  hasDoubleDegree?: boolean;
}

export interface MatchResultItem {
  subsidy: Subsidy;
  matched: boolean;
  matchedAmount: number;
  /** 金额计算明细（用于悬浮提示） */
  amountBreakdown?: string;
  missingConditions: string[];
}

export interface TodoItem {
  id: string;
  title: string;
  subsidyId: string;
  deadline: string;
  channel: string;
  materials: string[];
  /** 申请流程步骤（可选） */
  process?: string[];
  completed: boolean;
}

export interface ReverseSuggestion {
  subsidyName: string;
  suggestion: string;
}

export interface MatchResult {
  subsidies: MatchResultItem[];
  totalAmount: number;
  aiInterpretation?: string;
  pitfallTips?: string[];
  reverseSuggestions?: ReverseSuggestion[];
  todoList: TodoItem[];
  nearMissItems: MatchResultItem[];
}

export interface APIConfig {
  key: string;
  baseUrl: string;
  model: string;
}

// 重新导出常量，保持向后兼容
export { CITY_NAMES, CATEGORY_NAMES } from '../constants';
export type { CityCode, SchoolLevel, Degree, HouseholdStatus, EmploymentStatus, SubsidyCategory, TalentLevel, IdentityType } from '../constants';
