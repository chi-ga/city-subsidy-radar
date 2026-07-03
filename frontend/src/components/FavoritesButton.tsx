import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../stores';

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
      <svg className="h-[18px] w-[18px]" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M770.784 113.28a293.12 293.12 0 0 0-410.496 57.696L235.712 336.32a31.968 31.968 0 1 0 51.104 38.496l124.576-165.344a229.12 229.12 0 1 1 365.952 275.776l-255.36 338.88a163.84 163.84 0 0 1-261.696-197.184l255.36-338.88a98.528 98.528 0 1 1 157.408 118.624l-216.064 286.752a33.28 33.28 0 1 1-53.184-40.064c86.176-115.616 141.024-189.024 164.544-220.256a32 32 0 1 0-51.136-38.496c-23.616 31.36-78.496 104.8-164.64 220.384a97.28 97.28 0 1 0 155.456 116.96l218.912-290.496c0.992-1.344 1.312-2.912 2.08-4.32 47.36-71.104 32.224-167.456-36.896-219.552a162.56 162.56 0 0 0-227.648 32l-255.36 338.88a227.84 227.84 0 0 0 363.904 274.24l255.36-338.88a293.056 293.056 0 0 0-57.6-410.56z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-seal-red px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
