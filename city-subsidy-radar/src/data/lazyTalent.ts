/**
 * 深圳青年人才认定专用数据懒加载模块
 *
 *  - 国家高校拔尖创新人才计划 2.0 基地名单（top_student_plan_bases.json）
 *  - 国家"双一流"学科名单（double_first_class_disciplines.json）
 *  - 研究生教育一级学科目录（discipline_catalog.json）
 *  - STEM 一级学科白名单（内置常量）
 */

import type { TalentLevel } from '../types';

// ============================================================
// 国家高校拔尖创新人才计划 2.0 基地
// ============================================================
export interface TopStudentPlanBase {
  seq: number;
  university: string;
  category: string; // 一级学科
  base_name: string; // 基地全称
  batch?: string; // 2019年度（首批）/ 2020年度（第二批）
}

interface TopStudentPlanRaw {
  title: string;
  description: string;
  sources: unknown[];
  total_bases: number;
  total_universities: number;
  batches: Array<{
    batch: string;
    year: number;
    base_count: number;
    bases: TopStudentPlanBase[];
  }>;
}

let topStudentPlanCache: TopStudentPlanBase[] | null = null;
let topStudentPlanMapCache: Map<string, TopStudentPlanBase[]> | null = null;

async function loadTopStudentPlanRaw(): Promise<TopStudentPlanRaw | null> {
  try {
    const mod = await import('./top_student_plan_bases.json');
    return (mod.default || mod) as TopStudentPlanRaw;
  } catch (err) {
    console.error('加载拔尖计划数据失败:', err);
    return null;
  }
}

export async function loadTopStudentPlanBases(): Promise<TopStudentPlanBase[]> {
  if (topStudentPlanCache) return topStudentPlanCache;
  const raw = await loadTopStudentPlanRaw();
  if (!raw) return [];
  const all: TopStudentPlanBase[] = [];
  for (const b of raw.batches || []) {
    for (const base of b.bases || []) {
      all.push({ ...base, batch: b.batch });
    }
  }
  topStudentPlanCache = all;
  return all;
}

/**
 * 同步获取已缓存的基地列表（未加载时返回空）
 */
export function getCachedTopStudentPlanBases(): TopStudentPlanBase[] {
  return topStudentPlanCache || [];
}

/**
 * 获取按高校名分组的基地 Map（同步，需先调用过 loadTopStudentPlanBases）
 */
export function getTopStudentPlanMap(): Map<string, TopStudentPlanBase[]> {
  if (topStudentPlanMapCache) return topStudentPlanMapCache;
  const map = new Map<string, TopStudentPlanBase[]>();
  for (const base of topStudentPlanCache || []) {
    const key = base.university;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(base);
  }
  topStudentPlanMapCache = map;
  return map;
}

/**
 * 判断指定高校是否设有国家高校拔尖创新人才计划基地（同步：需先加载过）
 */
export function schoolHasTopStudentPlan(schoolName: string): boolean {
  if (!schoolName) return false;
  // 同步方式：依赖已加载缓存
  const map = getTopStudentPlanMap();
  return map.has(schoolName);
}

/**
 * 获取指定高校的全部基地（同步：需先加载过）
 */
export function getBasesForSchool(schoolName: string): TopStudentPlanBase[] {
  if (!schoolName) return [];
  return getTopStudentPlanMap().get(schoolName) || [];
}

// ============================================================
// 国家"双一流"学科
// ============================================================

export interface DoubleFirstClassDiscipline {
  university: string;
  disciplines: string[];
}

let doubleFirstClassCache: DoubleFirstClassDiscipline[] | null = null;
let doubleFirstClassMapCache: Map<string, Set<string>> | null = null;

async function loadDoubleFirstClassRaw(): Promise<DoubleFirstClassDiscipline[] | null> {
  try {
    const mod = await import('./double_first_class_disciplines.json');
    return (mod.default || mod) as DoubleFirstClassDiscipline[];
  } catch (err) {
    console.error('加载双一流学科数据失败:', err);
    return null;
  }
}

export async function loadDoubleFirstClassDisciplines(): Promise<DoubleFirstClassDiscipline[]> {
  if (doubleFirstClassCache) return doubleFirstClassCache;
  const raw = await loadDoubleFirstClassRaw();
  doubleFirstClassCache = raw || [];
  return doubleFirstClassCache;
}

/**
 * 构建 (高校 → 学科集合) 索引（同步，需先加载过）
 */
export function getDoubleFirstClassMap(): Map<string, Set<string>> {
  if (doubleFirstClassMapCache) return doubleFirstClassMapCache;
  const map = new Map<string, Set<string>>();
  for (const item of doubleFirstClassCache || []) {
    if (!item || !item.university) continue;
    map.set(item.university, new Set(item.disciplines || []));
  }
  doubleFirstClassMapCache = map;
  return map;
}

/**
 * 判断 (高校, 一级学科) 是否为国家"双一流"学科（同步）
 */
export function isDoubleFirstClassDiscipline(
  schoolName: string,
  firstLevelDiscipline: string
): boolean {
  if (!schoolName || !firstLevelDiscipline) return false;
  const set = getDoubleFirstClassMap().get(schoolName);
  if (!set) return false;
  // 精确匹配 + 模糊匹配（双一流名单里部分学科带括号等修饰）
  if (set.has(firstLevelDiscipline)) return true;
  for (const s of set) {
    if (s.includes(firstLevelDiscipline) || firstLevelDiscipline.includes(s)) return true;
  }
  return false;
}

// ============================================================
// 一级学科目录
// ============================================================

export interface FirstLevelDiscipline {
  code: string;
  name: string;
}

interface DisciplineCatalogRaw {
  version: string;
  source: string;
  categories: Array<{
    name: string;
    code: string;
    first_level_disciplines: FirstLevelDiscipline[];
  }>;
}

let firstLevelDisciplinesCache: FirstLevelDiscipline[] | null = null;

async function loadDisciplineCatalogRaw(): Promise<DisciplineCatalogRaw | null> {
  try {
    const mod = await import('./discipline_catalog.json');
    return (mod.default || mod) as DisciplineCatalogRaw;
  } catch (err) {
    console.error('加载一级学科目录失败:', err);
    return null;
  }
}

export async function loadFirstLevelDisciplines(): Promise<FirstLevelDiscipline[]> {
  if (firstLevelDisciplinesCache) return firstLevelDisciplinesCache;
  const raw = await loadDisciplineCatalogRaw();
  const all: FirstLevelDiscipline[] = [];
  for (const c of raw?.categories || []) {
    for (const d of c.first_level_disciplines || []) {
      all.push(d);
    }
  }
  firstLevelDisciplinesCache = all;
  return firstLevelDisciplinesCache;
}

export function getCachedFirstLevelDisciplines(): FirstLevelDiscipline[] {
  return firstLevelDisciplinesCache || [];
}

// ============================================================
// STEM 一级学科白名单
// ============================================================

/**
 * STEM = Science, Technology, Engineering, Mathematics
 * 取研究生教育一级学科目录（2022 年版）下与 STEM 高度相关的学科。
 * 范围：理学/工学/医学/农学 门类下的多数学科 + 少量交叉学科。
 *
 * 数据源参考国务院学位委员会《研究生教育学科专业目录(2022年)》。
 */
export const STEM_DISCIPLINES: readonly string[] = [
  // 数学/物理/化学等理学
  '数学',
  '物理学',
  '化学',
  '天文学',
  '地理学',
  '地质学',
  '地球物理学',
  '大气科学',
  '海洋科学',
  '生物学',
  '系统科学',
  '科学技术史',
  '生态学',
  '统计学',
  '力学',
  // 工学主要学科
  '机械工程',
  '光学工程',
  '仪器科学与技术',
  '材料科学与工程',
  '冶金工程',
  '动力工程及工程热物理',
  '电气工程',
  '电子科学与技术',
  '信息与通信工程',
  '控制科学与工程',
  '计算机科学与技术',
  '建筑学',
  '土木工程',
  '水利工程',
  '测绘科学与技术',
  '化学工程与技术',
  '地质资源与地质工程',
  '矿业工程',
  '石油与天然气工程',
  '纺织科学与工程',
  '轻工技术与工程',
  '交通运输工程',
  '船舶与海洋工程',
  '航空宇航科学与技术',
  '兵器科学与技术',
  '核科学与技术',
  '环境科学与工程',
  '生物医学工程',
  '食品科学与工程',
  '城乡规划学',
  '风景园林学',
  '软件工程',
  '生物工程',
  '安全科学与工程',
  '网络空间安全',
  // 交叉学科 / 新增学科
  '集成电路科学与工程',
  '遥感科学与技术',
  '智能科学与技术',
  '纳米科学与工程',
  // 农学
  '作物学',
  '园艺学',
  '农业资源与环境',
  '植物保护',
  '畜牧学',
  '兽医学',
  '林学',
  '水产',
  '草学',
  // 医学
  '基础医学',
  '临床医学',
  '口腔医学',
  '公共卫生与预防医学',
  '中医学',
  '中西医结合',
  '药学',
  '中药学',
  '特种医学',
  '医学技术',
  '护理学',
];

/**
 * 判断一级学科是否属于 STEM
 */
export function isStemDiscipline(name: string): boolean {
  if (!name) return false;
  return STEM_DISCIPLINES.some((d) => d === name || name.includes(d) || d.includes(name));
}

// ============================================================
// 深圳高层次人才认定层次选项
// ============================================================

export interface TalentLevelOption {
  id: TalentLevel;
  label: string;
  description: string;
  amount: number; // 补贴总额（万元）
}

export const TALENT_LEVEL_OPTIONS: TalentLevelOption[] = [
  {
    id: '杰出人才',
    label: '杰出人才（600万元/5年）',
    description: '诺贝尔奖获得者、国家最高科学技术奖获得者、两院院士、发达国家最高学术权威机构会员等',
    amount: 600,
  },
  {
    id: '国家级领军人才',
    label: '国家级领军人才/A类（300万元/5年）',
    description: '长江学者特聘教授、国家自然科学奖一等奖、国家科技进步奖一等奖前5名、国家杰出青年科学基金等',
    amount: 300,
  },
  {
    id: '地方级领军人才',
    label: '地方级领军人才/B类（200万元/5年）',
    description: '国务院特殊津贴人员、省突出贡献中青年专家、省科技进步奖一等奖、教育部高等学校教学名师奖等',
    amount: 200,
  },
  {
    id: '后备级人才',
    label: '后备级人才/C类（160万元/5年）',
    description: '博士后出站留深满3年、中国博士后科学基金资助、省技术能手、全国优秀班主任等',
    amount: 160,
  },
];

export {
  getSchoolLevels,
  isOverseasSchool,
  hasSchoolLevel,
  is985,
  is211,
  isDoubleFirstClass,
} from './lazySchools';

// ============================================================
// 深圳青年人才认定 · 创新能力类选项
// ============================================================

export interface InnovationOption {
  id: string;
  label: string;
  group: string;
}

export const INNOVATION_ABILITY_OPTIONS: InnovationOption[] = [
  // （一）获得下列国内外奖项之一
  { id: 'award-1', label: '国家/省/部级科学技术奖、教学成果奖', group: '国内外奖项' },
  { id: 'award-2', label: '副省级市科学技术奖、教学成果奖（主要完成人前5名）', group: '国内外奖项' },
  { id: 'award-3', label: '国家/省/部级专利奖（发明人前3名）', group: '国内外奖项' },
  { id: 'award-4', label: '美国IDEA奖 / 德国iF设计奖 / 德国红点设计奖（设计人前3名）', group: '国内外奖项' },
  { id: 'award-5', label: '中国国际动漫节 / 安纳西国际动画节 / 渥太华国际动画节 / 萨格勒布世界动画节', group: '国内外奖项' },
  { id: 'award-6', label: '游戏大奖(TGA) / 金摇杆奖 / 游戏开发者选择奖', group: '国内外奖项' },
  { id: 'award-7', label: '华为/腾讯/阿里/京东/美团/字节/百度/中兴 拔尖青年人才奖励计划', group: '国内外奖项' },
  // （二）参加下列国内外赛事取得较好成绩之一
  { id: 'comp-1', label: '全国大学生数学/物理/化学学科竞赛决赛二等奖及以上', group: '学科竞赛' },
  { id: 'comp-2', label: '全国中学生数学/物理/化学学科奥林匹克竞赛决赛二等奖及以上', group: '学科竞赛' },
  { id: 'comp-3', label: '国家部委/全国性学术组织主办的科技创新类竞赛全国总决赛二等奖及以上', group: '学科竞赛' },
  { id: 'comp-4', label: '国家部委主办创新创业大赛全国总决赛二等奖及以上（团队带头人/法定代表人）', group: '学科竞赛' },
  { id: 'comp-5', label: '中国职业技能大赛优胜奖及以上', group: '学科竞赛' },
  { id: 'comp-6', label: '华为/阿里/百度主办的学科类或科技创新类竞赛全国总决赛二等奖及以上', group: '学科竞赛' },
];

// ============================================================
// 深圳青年人才认定 · 创新贡献类选项
// ============================================================

export const INNOVATION_CONTRIBUTION_OPTIONS: InnovationOption[] = [
  // （一）创业人才符合下列条件之一
  { id: 'startup-1', label: '在深圳创办企业（法定代表人），获清科/投中前50名创投机构直接投资', group: '创业人才' },
  { id: 'startup-2', label: '在深圳创办企业（法定代表人），获实缴现金投资累计超200万元', group: '创业人才' },
  { id: 'startup-3', label: '在深圳创办企业（法定代表人），曾在世界500强/独角兽/专精特新/瞪羚/国家高新企业任职', group: '创业人才' },
  // （二）在知名代码、模型平台达到下列贡献之一
  { id: 'platform-1', label: 'GitHub 开源项目 Fork>200 且上一年贡献度>200', group: '代码平台贡献' },
  { id: 'platform-2', label: 'Gitee 开源项目 Fork>200 且上一年贡献度>200', group: '代码平台贡献' },
];

