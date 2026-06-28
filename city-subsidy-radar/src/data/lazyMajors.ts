/**
 * 专业数据懒加载与搜索模块
 * 结构与 lazySchools.ts 对齐，支持：
 * 1. 全国本科专业目录（major_catalog.json）
 * 2. 深圳重点产业领域专业目录（shenzhen_key_industry_majors.json）
 */

// ---- 类型定义 ----

export interface MajorItem {
  code: string;
  name: string;
  first_level_discipline: string;
}

export interface MajorCategory {
  name: string;
  code: string;
  majors: MajorItem[];
}

export interface MajorCatalog {
  categories: MajorCategory[];
  shenzhen_key_industry_majors?: Record<string, string[]>;
}

export interface ShenzhenKeyIndustryMajors {
  title: string;
  description: string;
  source: string;
  effective_date: string;
  last_updated: string;
  graduate_disciplines: string[];
  undergraduate_majors: string[];
}

// ---- 缓存 ----

let majorCatalogCache: MajorCatalog | null = null;
let shenzhenMajorsCache: ShenzhenKeyIndustryMajors | null = null;
let flatMajorsCache: MajorItem[] | null = null;

// ---- 懒加载函数 ----

/**
 * 懒加载全国本科专业目录
 */
export async function loadMajorCatalog(): Promise<MajorCatalog> {
  if (majorCatalogCache) {
    return majorCatalogCache;
  }

  try {
    const module = await import('./major_catalog.json');
    majorCatalogCache = module.default as MajorCatalog;
    return majorCatalogCache;
  } catch (error) {
    console.error('加载专业目录数据失败:', error);
    return { categories: [] };
  }
}

/**
 * 懒加载深圳重点产业领域专业目录
 */
export async function loadShenzhenKeyIndustryMajors(): Promise<ShenzhenKeyIndustryMajors> {
  if (shenzhenMajorsCache) {
    return shenzhenMajorsCache;
  }

  try {
    const module = await import('./shenzhen_key_industry_majors.json');
    shenzhenMajorsCache = module.default as ShenzhenKeyIndustryMajors;
    return shenzhenMajorsCache;
  } catch (error) {
    console.error('加载深圳重点产业专业目录失败:', error);
    return {
      title: '',
      description: '',
      source: '',
      effective_date: '',
      last_updated: '',
      graduate_disciplines: [],
      undergraduate_majors: [],
    };
  }
}

/**
 * 获取扁平化的专业列表（所有门类下的专业合并为一个数组）
 */
export async function getFlatMajors(): Promise<MajorItem[]> {
  if (flatMajorsCache) {
    return flatMajorsCache;
  }

  const catalog = await loadMajorCatalog();
  const flat: MajorItem[] = [];
  for (const category of catalog.categories) {
    for (const major of category.majors) {
      flat.push(major);
    }
  }
  flatMajorsCache = flat;
  return flat;
}

/**
 * 同步获取已缓存的扁平化专业列表
 */
export function getCachedFlatMajors(): MajorItem[] {
  return flatMajorsCache || [];
}

// ---- 搜索函数 ----

/**
 * 搜索专业（异步版本，自动加载数据）
 * 支持按专业名称、专业代码、一级学科名称搜索
 */
export async function searchMajorsAsync(query: string): Promise<MajorItem[]> {
  if (!query || query.length < 1) {
    return [];
  }

  const majors = await getFlatMajors();

  return majors.filter(
    (major) =>
      major.name.includes(query) ||
      major.code.includes(query) ||
      major.first_level_discipline.includes(query)
  );
}

/**
 * 检查某个专业是否属于深圳重点产业领域专业目录
 * 服务于 edu-3（985/211+重点产业）和 edu-5-domestic（榜单前200境内+重点产业）路径。
 *
 * 判断逻辑：
 *  - 本科：专业名在 undergraduate_majors 列表 → 符合
 *  - 研究生：一级学科在 graduate_disciplines 列表 → 符合
 *
 * @param majorName 专业名称（如"工业工程"）
 * @param firstLevelDiscipline 一级学科名称（如"管理科学与工程"），研究生时用于学科列表匹配
 * @param degree 学历，用于决定匹配策略
 * @returns { inKeyIndustry, type, matchSource, matchedDiscipline }
 */
export async function checkShenzhenKeyIndustryMajor(
  majorName: string,
  firstLevelDiscipline?: string,
  degree?: string
): Promise<{
  inKeyIndustry: boolean;
  type: 'undergraduate' | 'graduate' | null;
  matchSource: 'major' | 'discipline' | null;
  matchedDiscipline?: string;
}> {
  if (!majorName) {
    return { inKeyIndustry: false, type: null, matchSource: null };
  }

  // 专科不适用重点产业目录
  if (degree && degree !== '本科' && degree !== '硕士' && degree !== '博士') {
    return { inKeyIndustry: false, type: null, matchSource: null };
  }

  const shenzhenMajors = await loadShenzhenKeyIndustryMajors();

  // 本科路径：只看专业名是否在 undergraduate_majors 列表
  if (degree === '本科') {
    if (shenzhenMajors.undergraduate_majors.includes(majorName)) {
      return { inKeyIndustry: true, type: 'undergraduate', matchSource: 'major' };
    }
    const fuzzy = shenzhenMajors.undergraduate_majors.some(
      (m) => m.includes(majorName) || majorName.includes(m)
    );
    if (fuzzy) {
      return { inKeyIndustry: true, type: 'undergraduate', matchSource: 'major' };
    }
    return { inKeyIndustry: false, type: null, matchSource: null };
  }

  // 研究生路径：先看一级学科是否在 graduate_disciplines 列表
  if (firstLevelDiscipline) {
    if (shenzhenMajors.graduate_disciplines.includes(firstLevelDiscipline)) {
      return { inKeyIndustry: true, type: 'graduate', matchSource: 'discipline', matchedDiscipline: firstLevelDiscipline };
    }
    const fuzzy = shenzhenMajors.graduate_disciplines.some(
      (m) => m.includes(firstLevelDiscipline) || firstLevelDiscipline.includes(m)
    );
    if (fuzzy) {
      return { inKeyIndustry: true, type: 'graduate', matchSource: 'discipline', matchedDiscipline: firstLevelDiscipline };
    }
  }

  // 研究生路径补充：专业名本身也可能直接命中（如用户输入的是一级学科名）
  if (shenzhenMajors.graduate_disciplines.includes(majorName)) {
    return { inKeyIndustry: true, type: 'graduate', matchSource: 'major' };
  }

  return { inKeyIndustry: false, type: null, matchSource: null };
}
