import { useResultStore } from '../stores';

export function CompareBuyFilterButton() {
  const { compareExcludedCategories, toggleCompareExcludedCategory } = useResultStore();
  const isFiltered = compareExcludedCategories.includes('buy');

  return (
    <div className="group fixed bottom-safe right-20 z-40 sm:right-24">
      <button
        type="button"
        onClick={() => toggleCompareExcludedCategory('buy')}
        aria-label={isFiltered ? '取消过滤购房补贴' : '过滤购房补贴'}
        aria-pressed={isFiltered}
        className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg shadow-slate-200/40 backdrop-blur-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-civic-blue/30 sm:h-11 sm:w-11 ${
          isFiltered
            ? 'border-civic-blue/50 bg-civic-blue/10 text-civic-blue'
            : 'border-slate-200 bg-white/90 text-slate-600 hover:border-slate-300 hover:text-ink'
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
          {isFiltered && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 4.5l15 15"
            />
          )}
        </svg>
      </button>
      <span
        className={`pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md transition-opacity ${
          isFiltered ? 'text-civic-blue' : ''
        } opacity-0 group-hover:opacity-100`}
      >
        {isFiltered ? '已过滤购房补贴' : '过滤购房补贴'}
      </span>
    </div>
  );
}
