import { useState, useEffect } from 'react';
import { useResultStore } from '../stores';
import { HomeIcon } from './icons';

export function CompareBuyFilterButton() {
  const { compareExcludedCategories, toggleCompareExcludedCategory } = useResultStore();
  const isFiltered = compareExcludedCategories.includes('buy');
  const [toast, setToast] = useState<string | null>(null);

  const handleClick = () => {
    toggleCompareExcludedCategory('buy');
    const nextFiltered = !isFiltered;
    setToast(nextFiltered ? '已过滤购房补贴' : '已显示购房补贴');
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <div className="group fixed bottom-safe right-20 z-40 sm:right-24">
        <button
          type="button"
          onClick={handleClick}
          aria-label={isFiltered ? '取消过滤购房补贴' : '过滤购房补贴'}
          aria-pressed={isFiltered}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border shadow-lg shadow-slate-200/40 backdrop-blur-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-civic-blue/30 sm:h-11 sm:w-11 ${
            isFiltered
              ? 'border-civic-blue/50 bg-civic-blue/10 text-civic-blue'
              : 'border-slate-200 bg-white/90 text-slate-600 hover:border-slate-300 hover:text-ink'
          }`}
        >
          <HomeIcon className="h-5 w-5" />
          {isFiltered && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15" />
              </svg>
            </span>
          )}
        </button>
        <span
          className={`pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md transition-opacity ${
            isFiltered ? 'text-civic-blue' : ''
          } opacity-0 group-hover:opacity-100 hidden sm:inline-block`}
        >
          {isFiltered ? '已过滤购房补贴' : '过滤购房补贴'}
        </span>
      </div>

      {toast && (
        <div className="fixed bottom-safe left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/20 backdrop-blur-md animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );
}
