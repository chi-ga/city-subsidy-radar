import cityConditions from './city-conditions.json';
import type { Subsidy } from '../types';
import type { CityConditions, CityConditionsConfig, ConditionSet, Tier2Question } from './lazySchools';

// ─── 数据懒加载 ───────────────────────────────────────────
// Vite 动态导入所有城市补贴 JSON 文件（按需加载，不打包进初始 bundle）
const cityModules = import.meta.glob('./subsidies/*.json') as Record<
  string,
  () => Promise<{ default: Subsidy[] }>
>;

// 城市键列表（从 glob 路径中提取，保持与文件同步）
const CITY_KEYS: string[] = Object.keys(cityModules)
  .map((path) => path.replace('./subsidies/', '').replace('.json', ''))
  .sort();

// 内存缓存：已加载的城市数据
const cache = new Map<string, Subsidy[]>();

/**
 * 按需加载单个城市的补贴数据（带内存缓存）
 */
async function loadCityData(city: string): Promise<Subsidy[]> {
  const cached = cache.get(city);
  if (cached) return cached;
  const loader = cityModules[`./subsidies/${city}.json`];
  if (!loader) return [];
  const mod = await loader();
  const data = mod.default;
  cache.set(city, data);
  return data;
}

/**
 * 获取城市键列表
 */
export function getCityKeys(): string[] {
  return CITY_KEYS;
}

/**
 * 加载全部城市补贴数据（返回 Record 形式，供测试等场景使用）
 */
export async function loadAllSubsidiesData(): Promise<Record<string, Subsidy[]>> {
  const entries = await Promise.all(
    CITY_KEYS.map(async (city) => [city, await loadCityData(city)] as const)
  );
  return Object.fromEntries(entries);
}

/**
 * 按城市获取补贴数据（异步，按需加载）
 */
export async function getSubsidiesByCity(city: string): Promise<Subsidy[]> {
  return loadCityData(city);
}

/**
 * 获取全部城市的补贴数据（异步，按需加载）
 */
export async function getAllSubsidies(): Promise<Subsidy[]> {
  const allData = await Promise.all(CITY_KEYS.map((city) => loadCityData(city)));
  return allData.flat();
}

// ─── 城市条件配置 ─────────────────────────────────────────

const cityConditionsConfig = cityConditions.cities as Record<string, CityConditionsConfig>;

// 全部字段为 true 的默认条件（兜底用）
const ALL_TRUE: CityConditions = {
  degree: true,
  schoolLevel: true,
  ageLimit: true,
  graduationYear: true,
  employmentRequired: true,
  householdRequired: true,
  major: true,
  showCompanyType: true,
  showFullTime: true,
};

/** 条件字段名列表（用于 OR 合并） */
const CONDITION_KEYS: (keyof ConditionSet)[] = [
  'degree',
  'schoolLevel',
  'ageLimit',
  'graduationYear',
  'employmentRequired',
  'householdRequired',
  'major',
  'showIdentityType',
  'showCompanyType',
  'showThreeCitiesOneDistrict',
  'showReturneeStatus',
  'showFirstLingangEmployment',
  'showFirstGuangzhouHukou',
  'showHuaduImportStatus',
];

/**
 * 获取市级基础条件（不含区级）
 */
export function getCityConditions(city?: string): CityConditions {
  if (!city) return ALL_TRUE;
  const config = cityConditionsConfig[city];
  return config?.base || ALL_TRUE;
}

/**
 * 将一个 ConditionSet OR 合并到目标上（任一为 true → 结果为 true）
 */
function mergeConditions(target: CityConditions, extra: Partial<ConditionSet>): CityConditions {
  const merged = { ...target };
  for (const key of CONDITION_KEYS) {
    if (extra[key]) {
      merged[key] = true;
    }
  }
  return merged;
}

/**
 * 获取合并后的有效条件（市级 base ∪ 区级 extra，取 OR 并集）
 *  - 未选区（"不限"） → 市级 base ∪ 所有区的字段，但 locationDependent 字段强制 false
 *  - 选了区 → 市级 base ∪ 该区的字段（全部生效）
 */
export function getEffectiveConditions(city?: string, district?: string): CityConditions {
  const base = getCityConditions(city);
  const config = city ? cityConditionsConfig[city] : undefined;
  const districts = config?.districts;
  const locationDependent = new Set(config?.locationDependentFields || []);

  // 选了区 → 合并该区的额外字段，全部生效
  if (district && districts?.[district]) {
    return mergeConditions(base, districts[district]);
  }

  // 未选区 → 合并所有区的额外字段，但 locationDependent 字段强制为 false
  let merged = { ...base };
  if (districts) {
    for (const extra of Object.values(districts)) {
      merged = mergeConditions(merged, extra);
    }
  }
  // 选区前，落户/就业等区域状态字段没有意义，强制关闭
  for (const key of locationDependent) {
    if (key in merged) {
      (merged as Record<string, boolean>)[key] = false;
    }
  }
  return merged;
}

// 导出懒加载的学校搜索函数及通用学校工具（可被任意城市政策复用）
export {
  searchSchoolsAsync as searchSchools,
  loadSchoolsData,
  getCachedSchoolsData,
  getCachedSchool,
  getSchoolLevels,
  hasSchoolLevel,
  is985,
  is211,
  isDoubleFirstClass,
  isOverseasSchool,
} from './lazySchools';

// 导出专业搜索相关函数
export { searchMajorsAsync as searchMajors, loadMajorCatalog, loadShenzhenKeyIndustryMajors, checkShenzhenKeyIndustryMajor } from './lazyMajors';
export type { MajorItem, MajorCatalog, ShenzhenKeyIndustryMajors } from './lazyMajors';

/**
 * 获取城市的 Tier 2 追问问题配置
 */
export function getTier2Questions(city?: string): Tier2Question[] {
  if (!city) return [];
  const config = cityConditionsConfig[city];
  return config?.tier2Questions || [];
}

/**
 * 获取区/县级 location 列表（不含市级）
 * - city 不传 = 所有城市的全部区集合
 * - city 传了 = 该市的全部区集合
 * 同时从补贴数据的 application.location 和 city-conditions.json 的 districts 中获取
 */
export async function getLocationsForCity(city?: string): Promise<string[]> {
  const cities = city ? [city] : CITY_KEYS;
  const set = new Set<string>();

  // 从补贴数据的 application.location 中获取（并行加载）
  const cityDataList = await Promise.all(cities.map((c) => loadCityData(c)));
  for (const cityData of cityDataList) {
    for (const s of cityData) {
      const loc = s.application?.location;
      // application.location 存的就是 "嘉定区"、"徐汇区" 这种纯区名
      if (loc && loc !== '市级' && !loc.endsWith('市')) {
        set.add(loc);
      }
    }
  }

  // 从 city-conditions.json 的 districts 中获取
  for (const c of cities) {
    const config = cityConditionsConfig[c];
    if (config?.districts) {
      for (const district of Object.keys(config.districts)) {
        set.add(district);
      }
    }
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}

/** 市级 location 名（用于"不限"时的回退） */
export function getCityLevelLocation(city: string): string {
  const map: Record<string, string> = {
    beijing: '北京市',
    shanghai: '上海市',
    shenzhen: '深圳市',
    guangzhou: '广州市',
    hefei: '合肥市',
    hangzhou: '杭州市',
    jiaxing: '嘉兴市',
    nanjing: '南京市',
    chongqing: '重庆市',
    quanzhou: '泉州市',
    wuhan: '武汉市',
    wenzhou: '温州市',
    ningbo: '宁波市',
    changsha: '长沙市',
    chengdu: '成都市',
    jinan: '济南市',
    shaoxing: '绍兴市',
    zhuhai: '珠海市',
    nanning: '南宁市',
    zhengzhou: '郑州市',
    qingdao: '青岛市',
    wuxi: '无锡市',
    fuzhou: '福州市',
    xiamen: '厦门市',
    nanchang: '南昌市',
    kunming: '昆明市',
    tianjin: '天津市',
    suzhou: '苏州市',
    xian: '西安市',
    dongguan: '东莞市',
    foshan: '佛山市',
    huizhou: '惠州市',
    zhongshan: '中山市',
    haikou: '海口市',
    sanya: '三亚市',
    guiyang: '贵阳市',
    shenyang: '沈阳市',
    dalian: '大连市',
    changchun: '长春市',
    harbin: '哈尔滨市',
    shijiazhuang: '石家庄市',
    yantai: '烟台市',
    nantong: '南通市',
    changzhou: '常州市',
    xuzhou: '徐州市',
    tangshan: '唐山市',
    wuhu: '芜湖市',
    taiyuan: '太原市',
    lanzhou: '兰州市',
    luoyang: '洛阳市',
    weifang: '潍坊市',
    ganzhou: '赣州市',
    yinchuan: '银川市',
    huhehaote: '呼和浩特市',
    linyi: '临沂市',
    jinhua: '金华市',
    taizhou: '台州市',
    baoding: '保定市',
    yancheng: '盐城市',
    yangzhou: '扬州市',
    taizhoujs: '泰州市',
    zhenjiang: '镇江市',
    lianyungang: '连云港市',
    huaian: '淮安市',
    suqian: '宿迁市',
    wulumuqi: '乌鲁木齐市',
    xining: '西宁市',
    lasa: '拉萨市',
    zibo: '淄博市',
    mianyang: '绵阳市',
    guilin: '桂林市',
    shantou: '汕头市',
    zhanjiang: '湛江市',
    jiujiang: '九江市',
    yichang: '宜昌市',
    xiangyang: '襄阳市',
    zhuzhou: '株洲市',
    yueyang: '岳阳市',
    bengbu: '蚌埠市',
    maanshan: '马鞍山市',
    zhangzhou: '漳州市',
    huainan: '淮南市',
    huaibei: '淮北市',
    tongling: '铜陵市',
    anqing: '安庆市',
    huangshan: '黄山市',
    chuzhou: '滁州市',
    fuyang: '阜阳市',
    suzhouah: '宿州市',
    liuan: '六安市',
    bozhou: '亳州市',
    chizhou: '池州市',
    xuancheng: '宣城市',
    jingzhou: '荆州市',
    jingmen: '荆门市',
    ezhou: '鄂州市',
    huanggang: '黄冈市',
    weihai: '威海市',
    cangzhou: '沧州市',
    nanyang: '南阳市',
    anshan: '鞍山市',
    jilin: '吉林市',
    eerduosi: '鄂尔多斯市',
    jiaozuo: '焦作市',
    jining: '济宁市',
    hengyang: '衡阳市',
    xinxiang: '新乡市',
    panjin: '盘锦市',
    daqing: '大庆市',
    ningde: '宁德市',
    kaifeng: '开封市',
    zhoukou: '周口市',
    deyang: '德阳市',
    baoji: '宝鸡市',
    zigong: '自贡市',
  };
  return map[city] || '';
}
