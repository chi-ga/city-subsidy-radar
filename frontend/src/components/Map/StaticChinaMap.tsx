import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface StaticChinaMapProps {
  onCityClick?: (cityCode: string) => void;
}

const COVERED_CITIES = [
  { name: '北京', code: 'beijing', adcode: '110000', count: 11 },
  { name: '上海', code: 'shanghai', adcode: '310000', count: 14 },
  { name: '深圳市', code: 'shenzhen', adcode: '440300', count: 14 },
  { name: '广州市', code: 'guangzhou', adcode: '440100', count: 6 },
  { name: '合肥市', code: 'hefei', adcode: '340100', count: 2 },
];

export default function StaticChinaMap(_props: StaticChinaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current!, undefined, {
      renderer: 'canvas',
    });

    // 从本地加载城市级地图数据
    fetch('/geo/china-cities.json')
      .then((res) => {
        if (!res.ok) throw new Error('加载地图数据失败');
        return res.json();
      })
      .then((geoData) => {
        if (!geoData || !geoData.features) {
          throw new Error('地图数据格式错误');
        }

        echarts.registerMap('china', geoData as never);

        // 构建所有城市数据 - 已覆盖的城市强制设置蓝色
        const allCities = geoData.features.map((f: { properties: { name: string; code: string } }) => {
          const featureCode = String(f.properties.code);
          const cityInfo = COVERED_CITIES.find((c) => c.adcode === featureCode);
          const isCovered = !!cityInfo;
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
          tooltip: { show: false },
          series: [
            {
              type: 'map',
              map: 'china',
              roam: false,
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
