import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../stores';
import { CITY_NAMES, CATEGORY_NAMES } from '../constants';
import type { CityCode, SubsidyCategory } from '../constants';

export function FavoritesPanel() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavoritesStore();

  if (favorites.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">我的收藏</h3>
        <button
          onClick={() => navigate('/favorites')}
          className="text-xs font-semibold text-civic-blue hover:underline focus-ring rounded-md"
        >
          查看全部
        </button>
      </div>
      <div className="space-y-2">
        {favorites.slice(0, 5).map((fav) => (
          <div
            key={fav.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-paper px-3 py-2.5"
          >
            <button
              onClick={() => navigate('/favorites')}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-medium text-ink">{fav.name}</p>
              <p className="truncate text-xs text-slate-500">
                {CITY_NAMES[fav.city as CityCode] || fav.city} · {CATEGORY_NAMES[fav.category as SubsidyCategory]}
              </p>
            </button>
            <button
              onClick={() => removeFavorite(fav.id)}
              className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-seal-red/10 hover:text-seal-red focus-ring"
              title="取消收藏"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {favorites.length > 5 && (
          <p className="pt-1 text-center text-xs text-slate-400">还有 {favorites.length - 5} 条收藏</p>
        )}
      </div>
    </div>
  );
}
