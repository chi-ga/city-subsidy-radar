interface CityListFallbackProps {
  onCityClick?: (cityCode: string) => void;
}

const COVERED_CITIES = [
  { code: 'beijing', name: '北京', count: 11 },
  { code: 'shanghai', name: '上海', count: 14 },
  { code: 'shenzhen', name: '深圳', count: 14 },
  { code: 'guangzhou', name: '广州', count: 6 },
  { code: 'hefei', name: '合肥', count: 2 },
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
