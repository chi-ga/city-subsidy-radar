import beijing from './subsidies/beijing.json';
import shanghai from './subsidies/shanghai.json';
import shenzhen from './subsidies/shenzhen.json';
import guangzhou from './subsidies/guangzhou.json';
import hefei from './subsidies/hefei.json';
import hangzhou from './subsidies/hangzhou.json';
import jiaxing from './subsidies/jiaxing.json';
import nanjing from './subsidies/nanjing.json';
import chongqing from './subsidies/chongqing.json';
import quanzhou from './subsidies/quanzhou.json';
import wuhan from './subsidies/wuhan.json';
import wenzhou from './subsidies/wenzhou.json';
import ningbo from './subsidies/ningbo.json';
import changsha from './subsidies/changsha.json';
import chengdu from './subsidies/chengdu.json';
import jinan from './subsidies/jinan.json';
import shaoxing from './subsidies/shaoxing.json';
import zhuhai from './subsidies/zhuhai.json';
import nanning from './subsidies/nanning.json';
import zhengzhou from './subsidies/zhengzhou.json';
import qingdao from './subsidies/qingdao.json';
import wuxi from './subsidies/wuxi.json';
import fuzhou from './subsidies/fuzhou.json';
import xiamen from './subsidies/xiamen.json';
import nanchang from './subsidies/nanchang.json';
import kunming from './subsidies/kunming.json';
import tianjin from './subsidies/tianjin.json';
import suzhou from './subsidies/suzhou.json';
import xian from './subsidies/xian.json';
import dongguan from './subsidies/dongguan.json';
import foshan from './subsidies/foshan.json';
import huizhou from './subsidies/huizhou.json';
import zhongshan from './subsidies/zhongshan.json';
import haikou from './subsidies/haikou.json';
import sanya from './subsidies/sanya.json';
import guiyang from './subsidies/guiyang.json';
import shenyang from './subsidies/shenyang.json';
import dalian from './subsidies/dalian.json';
import changchun from './subsidies/changchun.json';
import harbin from './subsidies/harbin.json';
import shijiazhuang from './subsidies/shijiazhuang.json';
import yantai from './subsidies/yantai.json';
import nantong from './subsidies/nantong.json';
import changzhou from './subsidies/changzhou.json';
import xuzhou from './subsidies/xuzhou.json';
import tangshan from './subsidies/tangshan.json';
import wuhu from './subsidies/wuhu.json';
import taiyuan from './subsidies/taiyuan.json';
import lanzhou from './subsidies/lanzhou.json';
import luoyang from './subsidies/luoyang.json';
import weifang from './subsidies/weifang.json';
import ganzhou from './subsidies/ganzhou.json';
import yinchuan from './subsidies/yinchuan.json';
import huhehaote from './subsidies/huhehaote.json';
import linyi from './subsidies/linyi.json';
import jinhua from './subsidies/jinhua.json';
import taizhou from './subsidies/taizhou.json';
import baoding from './subsidies/baoding.json';
import yancheng from './subsidies/yancheng.json';
import yangzhou from './subsidies/yangzhou.json';
import taizhoujs from './subsidies/taizhoujs.json';
import zhenjiang from './subsidies/zhenjiang.json';
import lianyungang from './subsidies/lianyungang.json';
import huaian from './subsidies/huaian.json';
import suqian from './subsidies/suqian.json';
import wulumuqi from './subsidies/wulumuqi.json';
import xining from './subsidies/xining.json';
import lasa from './subsidies/lasa.json';
import zibo from './subsidies/zibo.json';
import mianyang from './subsidies/mianyang.json';
import guilin from './subsidies/guilin.json';
import shantou from './subsidies/shantou.json';
import zhanjiang from './subsidies/zhanjiang.json';
import jiujiang from './subsidies/jiujiang.json';
import yichang from './subsidies/yichang.json';
import xiangyang from './subsidies/xiangyang.json';
import zhuzhou from './subsidies/zhuzhou.json';
import yueyang from './subsidies/yueyang.json';
import bengbu from './subsidies/bengbu.json';
import maanshan from './subsidies/maanshan.json';
import zhangzhou from './subsidies/zhangzhou.json';
import huainan from './subsidies/huainan.json';
import huaibei from './subsidies/huaibei.json';
import tongling from './subsidies/tongling.json';
import anqing from './subsidies/anqing.json';
import huangshan from './subsidies/huangshan.json';
import chuzhou from './subsidies/chuzhou.json';
import fuyang from './subsidies/fuyang.json';
import suzhouah from './subsidies/suzhouah.json';
import liuan from './subsidies/liuan.json';
import bozhou from './subsidies/bozhou.json';
import chizhou from './subsidies/chizhou.json';
import xuancheng from './subsidies/xuancheng.json';
import jingzhou from './subsidies/jingzhou.json';
import jingmen from './subsidies/jingmen.json';
import ezhou from './subsidies/ezhou.json';
import huanggang from './subsidies/huanggang.json';
import cityConditions from './city-conditions.json';
import type { Subsidy } from '../types';
import type { CityConditions, CityConditionsConfig, ConditionSet, Tier2Question } from './lazySchools';

export const subsidiesData: Record<string, Subsidy[]> = {
  beijing: beijing as Subsidy[],
  shanghai: shanghai as Subsidy[],
  shenzhen: shenzhen as Subsidy[],
  guangzhou: guangzhou as Subsidy[],
  hefei: hefei as Subsidy[],
  hangzhou: hangzhou as Subsidy[],
  jiaxing: jiaxing as Subsidy[],
  nanjing: nanjing as Subsidy[],
  chongqing: chongqing as Subsidy[],
  quanzhou: quanzhou as Subsidy[],
  wuhan: wuhan as Subsidy[],
  wenzhou: wenzhou as Subsidy[],
  ningbo: ningbo as Subsidy[],
  changsha: changsha as Subsidy[],
  chengdu: chengdu as Subsidy[],
  jinan: jinan as Subsidy[],
  shaoxing: shaoxing as Subsidy[],
  zhuhai: zhuhai as Subsidy[],
  nanning: nanning as Subsidy[],
  zhengzhou: zhengzhou as Subsidy[],
  qingdao: qingdao as Subsidy[],
  wuxi: wuxi as Subsidy[],
  fuzhou: fuzhou as Subsidy[],
  xiamen: xiamen as Subsidy[],
  nanchang: nanchang as Subsidy[],
  kunming: kunming as Subsidy[],
  tianjin: tianjin as Subsidy[],
  suzhou: suzhou as Subsidy[],
  xian: xian as Subsidy[],
  dongguan: dongguan as Subsidy[],
  foshan: foshan as Subsidy[],
  huizhou: huizhou as Subsidy[],
  zhongshan: zhongshan as Subsidy[],
  haikou: haikou as Subsidy[],
  sanya: sanya as Subsidy[],
  guiyang: guiyang as Subsidy[],
  shenyang: shenyang as Subsidy[],
  dalian: dalian as Subsidy[],
  changchun: changchun as Subsidy[],
  harbin: harbin as Subsidy[],
  shijiazhuang: shijiazhuang as Subsidy[],
  yantai: yantai as Subsidy[],
  nantong: nantong as Subsidy[],
  changzhou: changzhou as Subsidy[],
  xuzhou: xuzhou as Subsidy[],
  tangshan: tangshan as Subsidy[],
  wuhu: wuhu as Subsidy[],
  taiyuan: taiyuan as Subsidy[],
  lanzhou: lanzhou as Subsidy[],
  luoyang: luoyang as Subsidy[],
  weifang: weifang as Subsidy[],
  ganzhou: ganzhou as Subsidy[],
  yinchuan: yinchuan as Subsidy[],
  huhehaote: huhehaote as Subsidy[],
  linyi: linyi as Subsidy[],
  jinhua: jinhua as Subsidy[],
  taizhou: taizhou as Subsidy[],
  baoding: baoding as Subsidy[],
  yancheng: yancheng as Subsidy[],
  yangzhou: yangzhou as Subsidy[],
  taizhoujs: taizhoujs as Subsidy[],
  zhenjiang: zhenjiang as Subsidy[],
  lianyungang: lianyungang as Subsidy[],
  huaian: huaian as Subsidy[],
  suqian: suqian as Subsidy[],
  wulumuqi: wulumuqi as Subsidy[],
  xining: xining as Subsidy[],
  lasa: lasa as Subsidy[],
  zibo: zibo as Subsidy[],
  mianyang: mianyang as Subsidy[],
  guilin: guilin as Subsidy[],
  shantou: shantou as Subsidy[],
  zhanjiang: zhanjiang as Subsidy[],
  jiujiang: jiujiang as Subsidy[],
  yichang: yichang as Subsidy[],
  xiangyang: xiangyang as Subsidy[],
  zhuzhou: zhuzhou as Subsidy[],
  yueyang: yueyang as Subsidy[],
  bengbu: bengbu as Subsidy[],
  maanshan: maanshan as Subsidy[],
  zhangzhou: zhangzhou as Subsidy[],
  huainan: huainan as Subsidy[],
  huaibei: huaibei as Subsidy[],
  tongling: tongling as Subsidy[],
  anqing: anqing as Subsidy[],
  huangshan: huangshan as Subsidy[],
  chuzhou: chuzhou as Subsidy[],
  fuyang: fuyang as Subsidy[],
  suzhouah: suzhouah as Subsidy[],
  liuan: liuan as Subsidy[],
  bozhou: bozhou as Subsidy[],
  chizhou: chizhou as Subsidy[],
  xuancheng: xuancheng as Subsidy[],
  jingzhou: jingzhou as Subsidy[],
  jingmen: jingmen as Subsidy[],
  ezhou: ezhou as Subsidy[],
  huanggang: huanggang as Subsidy[],
};

export function getSubsidiesByCity(city: string): Subsidy[] {
  return subsidiesData[city] || [];
}

export function getAllSubsidies(): Subsidy[] {
  return Object.values(subsidiesData).flat();
}

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
export function getLocationsForCity(city?: string): string[] {
  const cities = city ? [city] : Object.keys(subsidiesData);
  const set = new Set<string>();

  // 从补贴数据的 application.location 中获取
  for (const c of cities) {
    for (const s of subsidiesData[c] || []) {
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
  };
  return map[city] || '';
}
