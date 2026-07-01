import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { MAP_CACHE_KEY, MAP_CACHE_EXPIRY } from '../../constants';

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
  { name: '南宁市', code: 'nanning', adcode: '450100', count: 7 },
  { name: '郑州市', code: 'zhengzhou', adcode: '410100', count: 3 },
  { name: '青岛市', code: 'qingdao', adcode: '370200', count: 5 },
  { name: '无锡市', code: 'wuxi', adcode: '320200', count: 5 },
  { name: '福州市', code: 'fuzhou', adcode: '350100', count: 6 },
  { name: '厦门市', code: 'xiamen', adcode: '350200', count: 2 },
  { name: '南昌市', code: 'nanchang', adcode: '360100', count: 3 },
  { name: '昆明市', code: 'kunming', adcode: '530100', count: 12 },
  { name: '天津', code: 'tianjin', adcode: '120000', count: 2 },
  { name: '苏州市', code: 'suzhou', adcode: '320500', count: 4 },
  { name: '西安市', code: 'xian', adcode: '610100', count: 3 },
  { name: '东莞市', code: 'dongguan', adcode: '441900', count: 2 },
  { name: '佛山市', code: 'foshan', adcode: '440600', count: 2 },
  { name: '惠州市', code: 'huizhou', adcode: '441300', count: 4 },
  { name: '中山市', code: 'zhongshan', adcode: '442000', count: 3 },
  { name: '海口市', code: 'haikou', adcode: '460100', count: 2 },
  { name: '贵阳市', code: 'guiyang', adcode: '520100', count: 3 },
  { name: '沈阳市', code: 'shenyang', adcode: '210100', count: 6 },
  { name: '大连市', code: 'dalian', adcode: '210200', count: 6 },
  { name: '长春市', code: 'changchun', adcode: '220100', count: 5 },
  { name: '哈尔滨市', code: 'harbin', adcode: '230100', count: 3 },
  { name: '石家庄市', code: 'shijiazhuang', adcode: '130100', count: 5 },
  { name: '烟台市', code: 'yantai', adcode: '370600', count: 4 },
];


// 地图缓存接口
interface MapCache {
  timestamp: number;
  data: unknown[];
}

/**
 * 从缓存中获取地图数据
 */
function getCachedMapData(): unknown[] | null {
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

    return data;
  } catch {
    return null;
  }
}

/**
 * 将地图数据保存到缓存
 */
function setCachedMapData(data: unknown[]): void {
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

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current!, undefined, {
      renderer: 'canvas',
    });

    // 尝试从缓存获取地图数据
    const cachedData = getCachedMapData();

    const loadMapData = async () => {
      // 如果有缓存数据，直接使用
      if (cachedData) {
        console.log('使用缓存的地图数据');
        return cachedData;
      }

      console.log('从本地加载城市级地图数据...');
      // 从本地加载城市级地图数据
      const response = await fetch('/geo/china-cities.json');
      if (!response.ok) {
        throw new Error('加载本地地图数据失败');
      }
      const geoData = await response.json();

      // 收集所有城市级 feature
      const allCityFeatures: { type: string; properties: { name: string; code: string }; geometry: unknown }[] = [];
      if (geoData && geoData.features) {
        geoData.features.forEach((feature: { type: string; properties: { name: string; code: string }; geometry: unknown }) => {
          if (feature.properties && feature.properties.code) {
            allCityFeatures.push(feature);
          }
        });
      }

      console.log(`加载了 ${allCityFeatures.length} 个城市特征`);

      // 缓存地图数据
      if (allCityFeatures.length > 0) {
        setCachedMapData(allCityFeatures);
      }

      return allCityFeatures;
    };

    loadMapData()
      .then((allCityFeatures) => {
        if (!allCityFeatures || allCityFeatures.length === 0) {
          throw new Error('没有加载到地图数据');
        }

        console.log('注册地图...');
        // 构建城市级 GeoJSON
        const cityGeoJson = {
          type: 'FeatureCollection',
          features: allCityFeatures,
        };

        echarts.registerMap('china_cities', cityGeoJson as never);

        // 构建所有城市数据 - 已覆盖的城市强制设置蓝色
        const allCities = (allCityFeatures as { properties: { name: string; code: string } }[]).map((f) => {
          const featureCode = String(f.properties.code);
          const cityInfo = COVERED_CITIES.find((c) => c.adcode === featureCode);
          const isCovered = !!cityInfo;
          // 调试日志
          if (['110000', '310000', '440000', '440300', '440100'].includes(featureCode)) {
            console.log(`城市: ${f.properties.name}, code: ${featureCode}, 匹配: ${isCovered}`);
          }
          return {
            name: f.properties.name,
            value: isCovered ? 1 : 0,
            itemStyle: isCovered
              ? { areaColor: '#3b82f6', borderColor: '#2563eb', borderWidth: 1 }
              : { areaColor: '#f1f5f9' },
            ...(cityInfo && { code: cityInfo.code, count: cityInfo.count }),
          };
        });

        const option: echarts.EChartsOption = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: [12, 16],
            textStyle: {
              color: '#1e293b',
              fontSize: 13,
            },
            formatter: (params: unknown) => {
              const data = params as { name: string; value: number };
              if (data.value === 1) {
                return `<div style="font-weight:600;color:#1e293b">${data.name}</div>
                        <div style="color:#3b82f6;font-size:12px;margin-top:2px">已覆盖</div>`;
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
                  borderColor: '#93c5fd',
                  borderWidth: 1,
                  areaColor: '#dbeafe',
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

        chart.setOption(option);

        chart.on('click', (params: unknown) => {
          const event = params as { data?: { code?: string } };
          const code = event.data?.code;
          if (code) {
            onCityClick?.(code);
          }
        });

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.dispose();
        };
      })
      .catch((err) => {
        console.error('地图加载失败:', err);
        if (chartRef.current) {
          chartRef.current.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8">
              地图加载失败，请刷新重试
            </div>
          `;
        }
      });
  }, [onCityClick]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    />
  );
}
