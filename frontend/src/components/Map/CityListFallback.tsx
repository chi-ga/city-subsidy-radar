interface CityListFallbackProps {
  onCityClick?: (cityCode: string) => void;
}

const COVERED_CITIES = [
  { code: 'beijing', name: '北京', count: 11 },
  { code: 'shanghai', name: '上海', count: 14 },
  { code: 'shenzhen', name: '深圳', count: 14 },
  { code: 'guangzhou', name: '广州', count: 6 },
  { code: 'hefei', name: '合肥', count: 2 },
  { code: 'hangzhou', name: '杭州', count: 10 },
  { code: 'nanjing', name: '南京', count: 3 },
  { code: 'chongqing', name: '重庆', count: 16 },
  { code: 'quanzhou', name: '泉州', count: 12 },
  { code: 'wuhan', name: '武汉', count: 13 },
  { code: 'wenzhou', name: '温州', count: 5 },
  { code: 'ningbo', name: '宁波', count: 5 },
  { code: 'changsha', name: '长沙', count: 4 },
  { code: 'chengdu', name: '成都', count: 13 },
  { code: 'jinan', name: '济南', count: 3 },
  { code: 'shaoxing', name: '绍兴', count: 30 },
  { code: 'zhuhai', name: '珠海', count: 11 },
  { code: 'nanning', name: '南宁', count: 7 },
  { code: 'zhengzhou', name: '郑州', count: 3 },
  { code: 'qingdao', name: '青岛', count: 5 },
  { code: 'wuxi', name: '无锡', count: 5 },
  { code: 'fuzhou', name: '福州', count: 6 },
  { code: 'xiamen', name: '厦门', count: 2 },
  { code: 'nanchang', name: '南昌', count: 3 },
  { code: 'kunming', name: '昆明', count: 12 },
  { code: 'tianjin', name: '天津', count: 2 },
  { code: 'suzhou', name: '苏州', count: 4 },
  { code: 'xian', name: '西安', count: 3 },
  { code: 'dongguan', name: '东莞', count: 2 },
  { code: 'foshan', name: '佛山', count: 2 },
  { code: 'huizhou', name: '惠州', count: 4 },
  { code: 'zhongshan', name: '中山', count: 3 },
  { code: 'haikou', name: '海口', count: 2 },
  { code: 'guiyang', name: '贵阳', count: 3 },
  { code: 'shenyang', name: '沈阳', count: 6 },
  { code: 'dalian', name: '大连', count: 6 },
  { code: 'changchun', name: '长春', count: 5 },
  { code: 'harbin', name: '哈尔滨', count: 3 },
  { code: 'shijiazhuang', name: '石家庄', count: 5 },
  { code: 'yantai', name: '烟台', count: 4 },
];

export default function CityListFallback({ onCityClick }: CityListFallbackProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {COVERED_CITIES.map((city) => (
        <button
          key={city.code}
          onClick={() => onCityClick?.(city.code)}
          className="group relative rounded-xl border-2 border-blue-100 bg-blue-50 p-6 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="text-lg font-semibold text-blue-700">{city.name}</div>
          <div className="mt-1 text-xs text-blue-500">{city.count}项人才补贴</div>
          <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
        </button>
      ))}
    </div>
  );
}
