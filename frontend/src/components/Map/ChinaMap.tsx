import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts';
import { GeoComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsType } from 'echarts/core';
import { MAP_CACHE_KEY, MAP_CACHE_EXPIRY } from '../../constants';
import { RadarSpinner } from '../RadarSpinner';

// 按需注册 ECharts 模块，避免全量引入导致首屏 chunk 过大
echarts.use([MapChart, GeoComponent, TooltipComponent, CanvasRenderer]);

interface ChinaMapProps {
  onCityClick?: (cityCode: string) => void;
}

const COVERED_CITIES = [
  { name: '北京', code: 'beijing', adcode: '110000', count: 11 },
  { name: '上海', code: 'shanghai', adcode: '310000', count: 14 },
  { name: '深圳市', code: 'shenzhen', adcode: '440300', count: 14 },
  { name: '广州市', code: 'guangzhou', adcode: '440100', count: 6 },
  { name: '合肥市', code: 'hefei', adcode: '340100', count: 2 },
  { name: '杭州市', code: 'hangzhou', adcode: '330100', count: 10 },
  { name: '南京市', code: 'nanjing', adcode: '320100', count: 3 },
  { name: '重庆', code: 'chongqing', adcode: '500000', count: 16 },
  { name: '泉州市', code: 'quanzhou', adcode: '350500', count: 12 },
  { name: '武汉市', code: 'wuhan', adcode: '420100', count: 13 },
  { name: '温州市', code: 'wenzhou', adcode: '330300', count: 5 },
  { name: '宁波市', code: 'ningbo', adcode: '330200', count: 5 },
  { name: '长沙市', code: 'changsha', adcode: '430100', count: 4 },
  { name: '成都市', code: 'chengdu', adcode: '510100', count: 13 },
  { name: '济南市', code: 'jinan', adcode: '370100', count: 3 },
  { name: '绍兴市', code: 'shaoxing', adcode: '330600', count: 30 },
  { name: '珠海市', code: 'zhuhai', adcode: '440400', count: 11 },
  { name: '南宁市', code: 'nanning', adcode: '450100', count: 3 },
  { name: '郑州市', code: 'zhengzhou', adcode: '410100', count: 3 },
  { name: '青岛市', code: 'qingdao', adcode: '370200', count: 5 },
  { name: '无锡市', code: 'wuxi', adcode: '320200', count: 5 },
  { name: '福州市', code: 'fuzhou', adcode: '350100', count: 6 },
  { name: '厦门市', code: 'xiamen', adcode: '350200', count: 2 },
  { name: '南昌市', code: 'nanchang', adcode: '360100', count: 3 },
  { name: '昆明市', code: 'kunming', adcode: '530100', count: 12 },
  { name: '天津', code: 'tianjin', adcode: '120000', count: 1 },
  { name: '苏州市', code: 'suzhou', adcode: '320500', count: 4 },
  { name: '西安市', code: 'xian', adcode: '610100', count: 3 },
  { name: '东莞市', code: 'dongguan', adcode: '441900', count: 2 },
  { name: '佛山市', code: 'foshan', adcode: '440600', count: 2 },
  { name: '惠州市', code: 'huizhou', adcode: '441300', count: 4 },
  { name: '中山市', code: 'zhongshan', adcode: '442000', count: 3 },
  { name: '海口市', code: 'haikou', adcode: '460100', count: 2 },
  { name: '三亚市', code: 'sanya', adcode: '460200', count: 2 },
  { name: '贵阳市', code: 'guiyang', adcode: '520100', count: 3 },
  { name: '沈阳市', code: 'shenyang', adcode: '210100', count: 6 },
  { name: '大连市', code: 'dalian', adcode: '210200', count: 6 },
  { name: '长春市', code: 'changchun', adcode: '220100', count: 5 },
  { name: '哈尔滨市', code: 'harbin', adcode: '230100', count: 3 },
  { name: '石家庄市', code: 'shijiazhuang', adcode: '130100', count: 5 },
  { name: '烟台市', code: 'yantai', adcode: '370600', count: 4 },
  { name: '南通市', code: 'nantong', adcode: '320600', count: 9 },
  { name: '常州市', code: 'changzhou', adcode: '320400', count: 4 },
  { name: '徐州市', code: 'xuzhou', adcode: '320300', count: 2 },
  { name: '唐山市', code: 'tangshan', adcode: '130200', count: 8 },
  { name: '芜湖市', code: 'wuhu', adcode: '340200', count: 3 },
  { name: '太原市', code: 'taiyuan', adcode: '140100', count: 5 },
  { name: '嘉兴市', code: 'jiaxing', adcode: '330400', count: 6 },
  { name: '兰州市', code: 'lanzhou', adcode: '620100', count: 3 },
  { name: '洛阳市', code: 'luoyang', adcode: '410300', count: 3 },
  { name: '潍坊市', code: 'weifang', adcode: '370700', count: 3 },
  { name: '赣州市', code: 'ganzhou', adcode: '360700', count: 4 },
  { name: '银川市', code: 'yinchuan', adcode: '640100', count: 3 },
  { name: '呼和浩特市', code: 'huhehaote', adcode: '150100', count: 2 },
  { name: '临沂市', code: 'linyi', adcode: '371300', count: 3 },
  { name: '金华市', code: 'jinhua', adcode: '330700', count: 6 },
  { name: '台州市', code: 'taizhou', adcode: '331000', count: 4 },
  { name: '保定市', code: 'baoding', adcode: '130600', count: 3 },
  { name: '盐城市', code: 'yancheng', adcode: '320900', count: 5 },
  { name: '扬州市', code: 'yangzhou', adcode: '321000', count: 5 },
  { name: '泰州市', code: 'taizhoujs', adcode: '321200', count: 3 },
  { name: '镇江市', code: 'zhenjiang', adcode: '321100', count: 2 },
  { name: '连云港市', code: 'lianyungang', adcode: '320700', count: 2 },
  { name: '淮安市', code: 'huaian', adcode: '320800', count: 1 },
  { name: '宿迁市', code: 'suqian', adcode: '321300', count: 2 },
  { name: '乌鲁木齐市', code: 'wulumuqi', adcode: '650100', count: 3 },
  { name: '西宁市', code: 'xining', adcode: '630100', count: 2 },
  { name: '拉萨市', code: 'lasa', adcode: '540100', count: 3 },
  { name: '淄博市', code: 'zibo', adcode: '370300', count: 3 },
  { name: '绵阳市', code: 'mianyang', adcode: '510700', count: 2 },
  { name: '桂林市', code: 'guilin', adcode: '450300', count: 6 },
  { name: '汕头市', code: 'shantou', adcode: '440500', count: 8 },
  { name: '湛江市', code: 'zhanjiang', adcode: '440800', count: 4 },
  { name: '九江市', code: 'jiujiang', adcode: '360400', count: 5 },
  { name: '宜昌市', code: 'yichang', adcode: '420500', count: 7 },
  { name: '襄阳市', code: 'xiangyang', adcode: '420600', count: 7 },
  { name: '株洲市', code: 'zhuzhou', adcode: '430200', count: 3 },
  { name: '岳阳市', code: 'yueyang', adcode: '430600', count: 5 },
  { name: '蚌埠市', code: 'bengbu', adcode: '340300', count: 5 },
  { name: '马鞍山市', code: 'maanshan', adcode: '340500', count: 5 },
  { name: '漳州市', code: 'zhangzhou', adcode: '350600', count: 6 },
  { name: '淮南市', code: 'huainan', adcode: '340400', count: 5 },
  { name: '淮北市', code: 'huaibei', adcode: '340600', count: 7 },
  { name: '铜陵市', code: 'tongling', adcode: '340700', count: 5 },
  { name: '安庆市', code: 'anqing', adcode: '340800', count: 5 },
  { name: '黄山市', code: 'huangshan', adcode: '341000', count: 6 },
  { name: '滁州市', code: 'chuzhou', adcode: '341100', count: 6 },
  { name: '阜阳市', code: 'fuyang', adcode: '341200', count: 4 },
  { name: '宿州市', code: 'suzhouah', adcode: '341300', count: 5 },
  { name: '六安市', code: 'liuan', adcode: '341500', count: 5 },
  { name: '亳州市', code: 'bozhou', adcode: '341600', count: 3 },
  { name: '池州市', code: 'chizhou', adcode: '341700', count: 6 },
  { name: '宣城市', code: 'xuancheng', adcode: '341800', count: 7 },
  { name: '荆州市', code: 'jingzhou', adcode: '421000', count: 7 },
  { name: '荆门市', code: 'jingmen', adcode: '420800', count: 5 },
  { name: '鄂州市', code: 'ezhou', adcode: '420700', count: 5 },
  { name: '黄冈市', code: 'huanggang', adcode: '421100', count: 4 },
  { name: '威海市', code: 'weihai', adcode: '371000', count: 9 },
  { name: '沧州市', code: 'cangzhou', adcode: '130900', count: 6 },
  { name: '南阳市', code: 'nanyang', adcode: '411300', count: 8 },
  { name: '鞍山市', code: 'anshan', adcode: '210300', count: 7 },
  { name: '吉林市', code: 'jilin', adcode: '220200', count: 8 },
  { name: '鄂尔多斯市', code: 'eerduosi', adcode: '150600', count: 7 },
  { name: '焦作市', code: 'jiaozuo', adcode: '410800', count: 6 },
  { name: '济宁市', code: 'jining', adcode: '370800', count: 3 },
  { name: '衡阳市', code: 'hengyang', adcode: '430400', count: 5 },
  { name: '新乡市', code: 'xinxiang', adcode: '410700', count: 5 },
  { name: '盘锦市', code: 'panjin', adcode: '211100', count: 5 },
  { name: '大庆市', code: 'daqing', adcode: '230600', count: 7 },
];


// 地图缓存接口
interface MapCache {
  timestamp: number;
  data: unknown[];
}

interface CityFeature {
  type: string;
  properties: { name: string; code: string };
  geometry: unknown;
}

/**
 * 从缓存中获取地图数据
 */
function getCachedMapData(): CityFeature[] | null {
  try {
    const cached = localStorage.getItem(MAP_CACHE_KEY);
    if (!cached) return null;

    const { timestamp, data }: MapCache = JSON.parse(cached);
    const now = Date.now();

    // 检查缓存是否过期
    if (now - timestamp > MAP_CACHE_EXPIRY) {
      localStorage.removeItem(MAP_CACHE_KEY);
      return null;
    }

    return data as CityFeature[];
  } catch {
    return null;
  }
}

/**
 * 将地图数据保存到缓存
 */
function setCachedMapData(data: CityFeature[]): void {
  try {
    const cache: MapCache = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(MAP_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage 存储失败时静默处理
  }
}

export default function ChinaMap({ onCityClick }: ChinaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用 ref 保存最新的 onCityClick，避免它变化导致整个 effect 重新执行
  const onCityClickRef = useRef(onCityClick);
  onCityClickRef.current = onCityClick;

  useEffect(() => {
    const dom = chartRef.current;
    if (!dom) return;

    // 如果该 DOM 上已存在图表实例（如 StrictMode 双调用残留），先释放，避免 "already initialized" 警告
    const existing = echarts.getInstanceByDom(dom);
    if (existing) {
      existing.dispose();
    }

    let cancelled = false;
    const chart: EChartsType = echarts.init(dom, undefined, { renderer: 'canvas' });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    // ResizeObserver：容器从隐藏(display:none)变为可见时自动重绘，解决移动端/窄屏下 0 尺寸问题
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => chart.resize());
      resizeObserver.observe(dom);
    }

    const loadData = async () => {
      // 优先使用缓存
      const cachedData = getCachedMapData();
      if (cachedData) {
        return cachedData;
      }

      // 从本地加载城市级地图数据
      const response = await fetch('/geo/china-cities.json');
      if (!response.ok) {
        throw new Error('加载本地地图数据失败');
      }
      const geoData = await response.json();

      // 收集所有城市级 feature
      const allCityFeatures: CityFeature[] = [];
      if (geoData && geoData.features) {
        geoData.features.forEach((feature: CityFeature) => {
          if (feature.properties && feature.properties.code) {
            allCityFeatures.push(feature);
          }
        });
      }

      // 缓存地图数据
      if (allCityFeatures.length > 0) {
        setCachedMapData(allCityFeatures);
      }

      return allCityFeatures;
    };

    loadData()
      .then((allCityFeatures) => {
        // 异步操作返回后组件可能已卸载，需检查取消标志
        if (cancelled) return;

        if (!allCityFeatures || allCityFeatures.length === 0) {
          throw new Error('没有加载到地图数据');
        }

        // 构建城市级 GeoJSON
        const cityGeoJson = {
          type: 'FeatureCollection',
          features: allCityFeatures,
        };

        echarts.registerMap('china_cities', cityGeoJson as never);

        // 构建所有城市数据 - 已覆盖的城市强制设置蓝色
        const allCities = allCityFeatures.map((f) => {
          const featureCode = String(f.properties.code);
          const cityInfo = COVERED_CITIES.find((c) => c.adcode === featureCode);
          const isCovered = !!cityInfo;
          return {
            name: f.properties.name,
            value: isCovered ? 1 : 0,
            itemStyle: isCovered
              ? { areaColor: '#2563EB', borderColor: '#2563EB', borderWidth: 1 }
              : { areaColor: '#f1f5f9' },
            ...(cityInfo && { code: cityInfo.code, count: cityInfo.count }),
          };
        });

        const option: echarts.EChartsCoreOption = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: [12, 16],
            textStyle: {
              color: '#151922',
              fontSize: 13,
            },
            formatter: (params: unknown) => {
              const data = params as { name: string; value: number };
              if (data.value === 1) {
                return `<div style="font-weight:600;color:#151922">${data.name}</div>
                        <div style="color:#1D4ED8;font-size:12px;margin-top:2px">已覆盖</div>`;
              }
              return `<div style="color:#94a3b8">${data.name}<br/><span style="font-size:12px">暂未覆盖</span></div>`;
            },
          },
          series: [
            {
              type: 'map',
              map: 'china_cities',
              roam: false,
              // 完整显示：留出安全边距，避免地图边缘被裁剪
              layoutCenter: ['50%', '50%'],
              layoutSize: '92%',
              aspectScale: 0.72,
              zoom: 1.32,
              center: [104, 36.5],
              label: { show: false },
              itemStyle: {
                borderWidth: 0,
                areaColor: '#f1f5f9',
              },
              emphasis: {
                itemStyle: {
                  borderColor: '#2563EB',
                  borderWidth: 1,
                  areaColor: '#DBEAFE',
                },
                label: { show: false },
              },
              select: {
                disabled: true,
              },
              data: allCities,
            },
          ],
        };

        // 再次检查取消标志，确保 DOM 未被移除
        if (cancelled) return;

        chart.setOption(option);
        setLoading(false);

        chart.on('click', (params: unknown) => {
          const event = params as { data?: { code?: string } };
          const code = event.data?.code;
          if (code) {
            onCityClickRef.current?.(code);
          }
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('地图加载失败:', err);
        setError('地图加载失败，请刷新重试');
        setLoading(false);
      });

    return () => {
      // 同步释放：无论异步操作是否完成都立即清理，避免实例泄漏与重复初始化
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      chart.off('click');
      chart.dispose();
    };
  }, []);

  if (error) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-500"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-paper/80 backdrop-blur-sm">
          <RadarSpinner className="h-8 w-8" />
          <span className="text-sm font-medium text-slate-500">正在加载城市地图数据...</span>
        </div>
      )}
      <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
    </div>
  );
}
