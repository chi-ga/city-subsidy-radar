import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../stores';
import { PinIcon } from './icons';

export function FavoritesButton() {
  const navigate = useNavigate();
  const { favorites } = useFavoritesStore();
  const count = favorites.length;

  return (
    <button
      onClick={() => navigate('/favorites')}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-ring"
      title="我的收藏"
    >
      <PinIcon className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-seal-red px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
