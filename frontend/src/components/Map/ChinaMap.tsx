import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { MAP_CACHE_KEY, MAP_CACHE_EXPIRY } from '../../constants';
import CityListFallback from './CityListFallback';

interface ChinaMapProps {
  onCityClick?: (cityCode: string) => void;
}

const COVERED_CITIES = [
  { name: '北京市', code: 'beijing', adcode: '110000', count: 11 },
  { name: '上海市', code: 'shanghai', adcode: '310000', count: 14 },
  { name: '深圳市', code: 'shenzhen', adcode: '440300', count: 14 },
  { name: '广州市', code: 'guangzhou', adcode: '440100', count: 6 },
];

// 全国34个省级行政区的adcode
const PROVINCE_ADCODES = [
  '110000', '120000', '130000', '140000', '150000',
  '210000', '220000', '230000',
  '310000', '320000', '330000', '340000', '350000', '360000', '370000',
  '410000', '420000', '430000', '440000', '450000', '460000',
  '500000', '510000', '520000', '530000', '540000',
  '610000', '620000', '630000', '640000', '650000',
  '710000', '810000', '820000',
];

// 直辖市：地图只展示到市级（不使用 _full 下的区县边界）
const MUNICIPALITY_ADCODES = ['110000', '120000', '310000', '500000'];

// 港澳台：datav 没有 _full 城市级数据，直接使用省级边界
const PROVINCE_LEVEL_ADCODES = ['710000', '810000', '820000'];

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
  const [loadError, setLoadError] = useState(false);

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

      console.log('从网络加载地图数据...');
      // 否则从网络加载
      const provincePromises = PROVINCE_ADCODES.map((adcode) => {
        const useProvinceLevel =
          MUNICIPALITY_ADCODES.includes(adcode) || PROVINCE_LEVEL_ADCODES.includes(adcode);
        const url = useProvinceLevel
          ? `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}.json`
          : `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`;
        return fetch(url)
          .then((res) => {
            if (!res.ok) {
              console.warn(`加载 ${adcode} 失败: ${res.status}`);
              return null;
            }
            return res.json().catch(() => null);
          })
          .catch((err) => {
            console.warn(`加载 ${adcode} 出错:`, err);
            return null;
          });
      });

      const provinceGeos = await Promise.all(provincePromises);

      // 收集所有城市级 feature
      const allCityFeatures: { type: string; properties: { name: string; adcode: string | number }; geometry: unknown }[] = [];
      provinceGeos.forEach((geo, index) => {
        if (!geo || !geo.features) return;
        const adcode = PROVINCE_ADCODES[index];
        const useProvinceLevel =
          MUNICIPALITY_ADCODES.includes(adcode) || PROVINCE_LEVEL_ADCODES.includes(adcode);
        if (useProvinceLevel) {
          // 直辖市/港澳台只取省级（市级）边界
          const feature = geo.features[0] as { type: string; properties: { name: string; adcode: string | number }; geometry: unknown };
          if (feature?.properties?.adcode) {
            allCityFeatures.push(feature);
          }
        } else {
          geo.features.forEach((feature: { type: string; properties: { name: string; adcode: string | number }; geometry: unknown }) => {
            if (feature.properties && feature.properties.adcode) {
              allCityFeatures.push(feature);
            }
          });
        }
      });

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
        const allCities = (allCityFeatures as { properties: { name: string; adcode: string | number } }[]).map((f) => {
          const featureAdcode = String(f.properties.adcode);
          const cityInfo = COVERED_CITIES.find((c) => c.adcode === featureAdcode);
          const isCovered = !!cityInfo;
          return {
            name: f.properties.name,
            value: isCovered ? 1 : 0,
            itemStyle: isCovered ? { areaColor: '#3b82f6' } : { areaColor: '#f1f5f9' },
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
                areaColor: '#94a3b8',
              },
              emphasis: {
                itemStyle: {
                  borderWidth: 0,
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
        setLoadError(true);
      });
  }, [onCityClick]);

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <CityListFallback onCityClick={onCityClick} />
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    />
  );
}
