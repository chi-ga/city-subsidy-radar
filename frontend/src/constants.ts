/**
 * 项目常量定义
 */

// 不可变条件前缀：用户的学历/学校/学校层次/专业/身份/人才层次在短期内无法改变
// 在"你还能拿更多"里不应当推荐这些，仅保留可变条件（如就业状态、落户状态、年龄等）
export const IMMUTABLE_CONDITION_PREFIXES = ['学历要求', '院校要求', '专业要求', '专业限制', '身份要求', '人才层次', '全日制要求'] as const;

// 学历类型（含专科，用于前海等政策）
export type Degree = '专科' | '本科' | '硕士' | '博士';

// 学校层次联合类型
export type SchoolLevel =
  | '985'
  | '211'
  | '双一流'
  | '辖区高校'
  | 'QS前100'
  | 'QS前150'
  | 'QS前200'
  | 'QS前300'
  | 'THE前100'
  | 'THE前150'
  | 'THE前200'
  | 'THE前300'
  | '软科前100'
  | '软科前150'
  | '软科前200'
  | '软科前300'
  | 'USNews前100'
  | 'USNews前150'
  | 'USNews前200'
  | 'USNews前300';

// 榜单层级蕴含关系：前100 → 前150 → 前200 → 前300
const LEVEL_IMPLICATIONS: Record<string, string> = {
  'QS前100': 'QS前150',
  'QS前150': 'QS前200',
  'QS前200': 'QS前300',
  'THE前100': 'THE前150',
  'THE前150': 'THE前200',
  'THE前200': 'THE前300',
  '软科前100': '软科前150',
  '软科前150': '软科前200',
  '软科前200': '软科前300',
  'USNews前100': 'USNews前150',
  'USNews前150': 'USNews前200',
  'USNews前200': 'USNews前300',
};

/**
 * 去重显示：如果同时有前100和前300，只保留最高层级（前100）
 * 逻辑：先展开每个层级的完整蕴含链，再排除被其他层级蕴含的项
 */
export function deduplicateLevels(levels: SchoolLevel[]): SchoolLevel[] {
  // 展开每个层级的完整蕴含链（含传递闭包）
  const expanded = new Map<SchoolLevel, Set<SchoolLevel>>();
  for (const lvl of levels) {
    expanded.set(lvl, new Set(expandLevels([lvl])));
  }
  return levels.filter((lvl) => {
    // 如果任一其他层级的蕴含链包含了当前层级，则当前层级应被去重
    for (const [other, otherChain] of expanded) {
      if (other !== lvl && otherChain.has(lvl)) return false;
    }
    return true;
  });
}

/**
 * 匹配展开：高层级自动蕴含所有低层级，用于匹配逻辑
 */
export function expandLevels(levels: SchoolLevel[]): SchoolLevel[] {
  const result = new Set<SchoolLevel>(levels);
  let changed = true;
  while (changed) {
    changed = false;
    for (const lvl of Array.from(result)) {
      const implied = LEVEL_IMPLICATIONS[lvl];
      if (implied && !result.has(implied as SchoolLevel)) {
        result.add(implied as SchoolLevel);
        changed = true;
      }
    }
  }
  return Array.from(result);
}

// 落户状态
export type HouseholdStatus = '已落户' | '未落户';

// 深圳高层次人才层次
export type TalentLevel = '杰出人才' | '国家级领军人才' | '地方级领军人才' | '后备级人才';

// 身份类型（用于港澳台/外籍等身份限制的补贴匹配）
export type IdentityType = '内地居民' | '港澳居民' | '台湾居民' | '外籍人士';

// 就业状态
export type EmploymentStatus = '已就业' | '未就业';

// 补贴分类
export type SubsidyCategory = 'talent' | 'rent' | 'buy' | 'living' | 'employment' | 'startup' | 'settlement' | 'other';

// 城市代码
export type CityCode = 'beijing' | 'shanghai' | 'shenzhen' | 'guangzhou';

// 城市名称映射
export const CITY_NAMES: Record<CityCode, string> = {
  beijing: '北京',
  shanghai: '上海',
  shenzhen: '深圳',
  guangzhou: '广州',
};

// 补贴分类名称映射
export const CATEGORY_NAMES: Record<SubsidyCategory, string> = {
  talent: '人才奖励',
  rent: '租房补贴',
  buy: '落户安家',
  living: '生活补贴',
  employment: '生活补贴',
  startup: '创业支持',
  settlement: '落户安家',
  other: '生活补贴',
};

// 地图缓存键名
export const MAP_CACHE_KEY = 'china_map_geo_cache_v2';

// 地图缓存过期时间（24小时）
export const MAP_CACHE_EXPIRY = 24 * 60 * 60 * 1000;
