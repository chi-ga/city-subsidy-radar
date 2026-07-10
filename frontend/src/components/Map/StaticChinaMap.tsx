import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts';
import { GeoComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 按需注册 ECharts 模块，避免全量引入
echarts.use([MapChart, GeoComponent, CanvasRenderer]);

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
              ? { areaColor: '#2563EB', borderColor: '#2563EB', borderWidth: 1 }
              : { areaColor: '#f1f5f9' },
            ...(cityInfo && { code: cityInfo.code, count: cityInfo.count }),
          };
        });

        const option: echarts.EChartsCoreOption = {
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
