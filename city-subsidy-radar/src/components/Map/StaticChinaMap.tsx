import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface StaticChinaMapProps {
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

export default function StaticChinaMap(_props: StaticChinaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current!, undefined, {
      renderer: 'canvas',
    });

    // 加载全国省级地图 + 各省级下属城市地图
    const nationPromise = fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then((res) => res.json().catch(() => null))
      .catch(() => null);

    const provincePromises = PROVINCE_ADCODES.map((adcode) =>
      fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`)
        .then((res) => res.json().catch(() => null))
        .catch(() => null)
    );

    Promise.all([nationPromise, ...provincePromises])
      .then(([nationGeo, ...provinceGeos]) => {
        if (nationGeo && nationGeo.features) {
          echarts.registerMap('china_provinces', nationGeo as never);
        }

        // 收集所有城市级 feature
        const allCityFeatures: { type: string; properties: { name: string; adcode: string }; geometry: unknown }[] = [];
        provinceGeos.forEach((geo) => {
          if (geo && geo.features) {
            geo.features.forEach((feature: { type: string; properties: { name: string; adcode: string }; geometry: unknown }) => {
              if (feature.properties && feature.properties.adcode) {
                allCityFeatures.push(feature);
              }
            });
          }
        });

        // 构建城市级 GeoJSON
        const cityGeoJson = {
          type: 'FeatureCollection',
          features: allCityFeatures,
        };

        echarts.registerMap('china_cities', cityGeoJson as never);

        // 构建所有城市数据 - 已覆盖的城市强制设置蓝色
        const allCities = allCityFeatures.map((f) => {
          const cityInfo = COVERED_CITIES.find((c) => c.adcode === f.properties.adcode);
          const isCovered = !!cityInfo;
          return {
            name: f.properties.name,
            value: isCovered ? 1 : 0,
            itemStyle: isCovered ? { areaColor: '#3b82f6' } : { areaColor: '#94a3b8' },
            ...cityInfo,
          };
        });

        const option: echarts.EChartsOption = {
          backgroundColor: 'transparent',
          tooltip: { show: false },
          series: [
            {
              name: 'province',
              type: 'map',
              map: 'china_provinces',
              roam: false,
              layoutCenter: ['50%', '50%'],
              layoutSize: '92%',
              aspectScale: 0.72,
              zoom: 1.32,
              center: [104, 36.5],
              label: { show: false },
              itemStyle: {
                areaColor: 'transparent',
                borderColor: '#334155',
                borderWidth: 1.5,
              },
              emphasis: {
                disabled: true,
              },
              select: {
                disabled: true,
              },
              silent: true,
            },
            {
              name: 'city',
              type: 'map',
              map: 'china_cities',
              roam: false,
              layoutCenter: ['50%', '50%'],
              layoutSize: '92%',
              aspectScale: 0.72,
              zoom: 1.32,
              center: [104, 36.5],
              label: { show: false },
              itemStyle: {
                borderColor: '#cbd5e1',
                borderWidth: 0.5,
              },
              emphasis: {
                disabled: true,
              },
              select: {
                disabled: true,
              },
              data: allCities,
              silent: true,
            },
          ],
        };

        chart.setOption(option);

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.dispose();
        };
      })
      .catch(() => {
        if (chartRef.current) {
          chartRef.current.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:14px">
              地图加载失败
            </div>
          `;
        }
      });
  }, []);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%', minHeight: '360px' }}
    />
  );
}
