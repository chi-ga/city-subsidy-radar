import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../../stores';
import { CITY_NAMES } from '../../constants';
import { PolicyCard } from '../../components/PolicyCard';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { PinIcon } from '../../components/icons';
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
      <PageHeader
        title="我的收藏"
        backTo={-1}
        backLabel="返回"
        showFavorites={false}
      />

      {/* 内容 */}
      <main className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-10">
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-20">
            <EmptyState
              icon={<PinIcon className="h-8 w-8 text-slate-400" />}
              title="还没有收藏政策"
              description="在匹配结果或政策库中点击回形针图标收藏"
              action={{
                label: '去查询补贴',
                onClick: () => navigate('/input'),
              }}
            />
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
