import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../../stores';
import { CITY_NAMES } from '../../constants';
import { PolicyCard } from '../../components/PolicyCard';
import { getSubsidiesByCity } from '../../data';
import type { CityCode } from '../../constants';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, clearFavorites } = useFavoritesStore();

  // 从收藏项还原完整 Subsidy 对象（用于 PolicyCard 渲染）
  const favoriteSubsidies = favorites
    .map((fav) => {
      const cityData = getSubsidiesByCity(fav.city);
      return cityData.find((s) => s.id === fav.id);
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-ring sm:px-3"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">返回</span>
          </button>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-ink">我的收藏</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {favorites.length}
            </span>
          </div>
        </div>
      </header>

      {/* 内容 */}
      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-10">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" viewBox="0 0 1024 1024" fill="currentColor">
                <path d="M770.784 113.28a293.12 293.12 0 0 0-410.496 57.696L235.712 336.32a31.968 31.968 0 1 0 51.104 38.496l124.576-165.344a229.12 229.12 0 1 1 365.952 275.776l-255.36 338.88a163.84 163.84 0 0 1-261.696-197.184l255.36-338.88a98.528 98.528 0 1 1 157.408 118.624l-216.064 286.752a33.28 33.28 0 1 1-53.184-40.064c86.176-115.616 141.024-189.024 164.544-220.256a32 32 0 1 0-51.136-38.496c-23.616 31.36-78.496 104.8-164.64 220.384a97.28 97.28 0 1 0 155.456 116.96l218.912-290.496c0.992-1.344 1.312-2.912 2.08-4.32 47.36-71.104 32.224-167.456-36.896-219.552a162.56 162.56 0 0 0-227.648 32l-255.36 338.88a227.84 227.84 0 0 0 363.904 274.24l255.36-338.88a293.056 293.056 0 0 0-57.6-410.56z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-ink">还没有收藏政策</h2>
            <p className="mt-1 text-sm text-slate-500">在匹配结果或政策库中点击回形针图标收藏</p>
            <button
              onClick={() => navigate('/input')}
              className="mt-6 rounded-xl bg-civic-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-civic-blue/90 focus-ring"
            >
              去查询补贴
            </button>
          </div>
        ) : (
          <>
            {/* 顶部操作栏 */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                共收藏了 <span className="font-data font-semibold text-ink">{favorites.length}</span> 条政策
                {(() => {
                  const cities = [...new Set(favorites.map((f) => f.city))];
                  return cities.length > 1 ? (
                    <span className="ml-1">
                      ，覆盖 <span className="font-data font-semibold text-ink">{cities.length}</span> 个城市
                    </span>
                  ) : (
                    <span className="ml-1">
                      （{CITY_NAMES[cities[0] as CityCode] || cities[0]}）
                    </span>
                  );
                })()}
              </p>
              <button
                onClick={() => {
                  if (confirm('确定清空所有收藏？')) clearFavorites();
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-seal-red focus-ring"
              >
                清空全部
              </button>
            </div>

            {/* 政策卡片列表 */}
            <div className="space-y-4">
              {favoriteSubsidies.map((subsidy) => {
                if (!subsidy) return null;
                return (
                  <PolicyCard
                    key={subsidy.id}
                    subsidy={subsidy}
                    defaultExpanded={false}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
