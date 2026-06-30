import type { School } from '../types';
import { expandLevels } from '../constants';
import type { SchoolLevel } from '../constants';

/** 单个条件集（市级 base 或区级 extra） */
export interface ConditionSet {
  degree: boolean;
  schoolLevel: boolean;
  ageLimit: boolean;
  graduationYear: boolean;
  employmentRequired: boolean;
  householdRequired: boolean;
  major: boolean;
  /** 是否显示"身份类型"字段（仅前海等有港澳台专属政策的区域需要） */
  showIdentityType?: boolean;
  /** 是否为"区域状态"字段（落户/就业），选区前不展示，选区后才展示 */
  locationDependent?: boolean;
  // ===== 新增条件字段 =====
  /** 是否显示"三城一区"判断（北京专用） */
  showThreeCitiesOneDistrict?: boolean;
  /** 是否显示"留学回国时间"字段（上海专用） */
  showReturneeStatus?: boolean;
  /** 是否显示"首次在临港就业"字段（上海浦东新区专用） */
  showFirstLingangEmployment?: boolean;
  /** 是否显示"首次入户广州"字段（广州黄埔区专用） */
  showFirstGuangzhouHukou?: boolean;
  /** 是否显示"花都引进时间"字段（广州花都区专用） */
  showHuaduImportStatus?: boolean;
  /** 是否显示"用人单位类型"字段（南京雨花台区等限定企业类型） */
  showCompanyType?: boolean;
}

/** 城市条件配置（含市级 base 和区级 extra） */
export interface CityConditionsConfig {
  base: ConditionSet;
  /** 区级额外条件：选区后与 base 取并集（OR） */
  districts?: Record<string, Partial<ConditionSet>>;
  /** 区域状态字段列表（选区前不展示，选区后才展示）。如落户、就业依赖具体区域才有意义 */
  locationDependentFields?: string[];
}

/** 合并后的有效条件（UI 使用此类型） */
export type CityConditions = ConditionSet;

let schoolsCache: School[] | null = null;
let schoolMapCache: Map<string, School> | null = null;

/**
 * 懒加载学校数据
 * 首次调用时加载，后续调用使用缓存
 */
export async function loadSchoolsData(): Promise<School[]> {
  if (schoolsCache) {
    return schoolsCache;
  }

  try {
    const module = await import('./schools.json');
    schoolsCache = module.default as School[];
    return schoolsCache;
  } catch (error) {
    console.error('加载学校数据失败:', error);
    return [];
  }
}

/**
 * 同步获取已缓存的学校数据
 * 如果尚未加载，返回空数组
 */
export function getCachedSchoolsData(): School[] {
  return schoolsCache || [];
}

/**
 * 获取学校名→School 的映射（同步，需先加载过）
 */
export function getCachedSchoolMap(): Map<string, School> {
  if (schoolMapCache) return schoolMapCache;
  const map = new Map<string, School>();
  for (const s of schoolsCache || []) {
    map.set(s.name, s);
  }
  schoolMapCache = map;
  return map;
}

/**
 * 同步获取某高校的 School 对象（需先加载过）
 */
export function getCachedSchool(schoolName: string): School | undefined {
  if (!schoolName) return undefined;
  return getCachedSchoolMap().get(schoolName);
}

/**
 * 获取某高校的全部 levels 标签（含前100→前200展开）
 * 同步函数：依赖已加载的学校缓存
 */
export function getSchoolLevels(schoolName: string): SchoolLevel[] {
  if (!schoolName) return [];
  const school = getCachedSchool(schoolName);
  return (school?.levels || []) as SchoolLevel[];
}

/**
 * 判断某高校是否具有指定的学校层次（支持前100蕴含前200）
 * 同步函数：可被任意城市的政策匹配逻辑复用
 * @param schoolName 高校名称
 * @param requiredLevel 需要判断的层次，如 '985'、'211'、'双一流'、'QS前200' 等
 */
export function hasSchoolLevel(schoolName: string, requiredLevel: SchoolLevel): boolean {
  const levels = getSchoolLevels(schoolName);
  const expanded = expandLevels(levels);
  return expanded.includes(requiredLevel);
}

/**
 * 判断某高校是否为 985
 */
export function is985(schoolName: string): boolean {
  return hasSchoolLevel(schoolName, '985');
}

/**
 * 判断某高校是否为 211
 */
export function is211(schoolName: string): boolean {
  return hasSchoolLevel(schoolName, '211');
}

/**
 * 判断某高校是否为双一流
 */
export function isDoubleFirstClass(schoolName: string): boolean {
  return hasSchoolLevel(schoolName, '双一流');
}

/**
 * 判断高校是否为境外高校
 */
export function isOverseasSchool(schoolName: string): boolean {
  if (!schoolName) return false;
  const sch = getCachedSchool(schoolName);
  if (!sch) return false;
  const domesticProvinces = new Set([
    '北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江',
    '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南',
    '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海',
    '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门',
  ]);
  if (domesticProvinces.has(sch.province)) return false;
  if (['香港', '澳门', '台湾'].includes(sch.province)) return false;
  return true;
}

/**
 * 搜索学校（异步版本，自动加载数据）
 */
export async function searchSchoolsAsync(query: string): Promise<School[]> {
  if (!query || query.length < 1) {
    return [];
  }

  const schools = await loadSchoolsData();
  const lowerQuery = query.toLowerCase();

  return schools.filter(
    (school) =>
      school.name.includes(query) ||
      school.pinyin.includes(lowerQuery) ||
      school.abbreviation?.includes(query) ||
      school.aliases?.some((alias) => alias.toLowerCase().includes(lowerQuery))
  );
}
