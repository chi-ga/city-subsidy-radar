import { useNavigate } from 'react-router-dom';
import { FavoritesButton } from './FavoritesButton';
import { ArrowLeftIcon } from './icons';

interface PageHeaderProps {
  title: string;
  backTo?: string | number;
  backLabel?: string;
  onBack?: () => void;
  showFavorites?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  backTo = '/',
  backLabel = '返回',
  onBack,
  showFavorites = true,
  right,
  className = '',
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof backTo === 'number') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };

  return (
    <header className={`sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl ${className}`}>
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-ring sm:px-3"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{backLabel}</span>
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-ink">{title}</span>

        <div className="flex items-center gap-2">
          {right}
          {showFavorites && <FavoritesButton />}
        </div>
      </div>
    </header>
  );
}
