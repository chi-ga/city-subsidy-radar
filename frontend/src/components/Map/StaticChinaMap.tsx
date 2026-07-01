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
