import { FavoritesButton } from '../../../components/FavoritesButton';

interface InputHeaderProps {
  mode: string;
  isFromCompare: boolean;
  city?: string;
  completedSteps: number;
  totalSteps: number;
  onReset: () => void;
  onBack: () => void;
}

/**
 * Input 页面头部
 * 包含进度条、返回按钮、重新开始按钮、收藏按钮
 */
export function InputHeader({
  completedSteps,
  totalSteps,
  onReset,
  onBack,
}: InputHeaderProps) {
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
        <button
          onClick={onBack}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:px-3"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">返回</span>
        </button>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onReset}
            className="shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-seal-red/5 hover:text-red-600 sm:px-3"
          >
            重新开始
          </button>
          <FavoritesButton />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">
            {progress}%
          </span>
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 sm:w-32">
            <div
              className="h-full rounded-full bg-civic-blue transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
