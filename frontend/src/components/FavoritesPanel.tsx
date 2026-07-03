import { useState, useEffect, useRef } from 'react';
import { useFavoritesStore } from '../stores';
import { CITY_NAMES } from '../constants';
import { categoryStyles, PolicyIcon } from './PolicyCard';
import type { CityCode } from '../constants';

export function FavoritesPanel() {
  const { favorites, removeFavorite, clearFavorites } = useFavoritesStore();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Escape 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const count = favorites.length;

  return (
    <>
      {/* 收藏面板 */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-40 right-6 z-50 w-[calc(100vw-3rem)] max-w-96 animate-fade-slide-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <svg className="h-4 w-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              我的收藏
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {count}
              </span>
            </h3>
            <div className="flex items-center gap-1">
              {count > 0 && (
                <button
                  onClick={() => clearFavorites()}
                  className="rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  清空
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 列表 */}
          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10">
                <svg className="mb-3 h-10 w-10 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <p className="text-sm text-slate-400">还没有收藏政策</p>
                <p className="mt-1 text-xs text-slate-300">点击政策卡片上的心形图标收藏</p>
              </div>
            ) : (
              <div className="p-2">
                {favorites.map((item) => {
                  const style = categoryStyles[item.category];
                  const cityLabel = CITY_NAMES[item.city as CityCode] || item.city;
                  const amountText =
                    item.amountMin === item.amountMax
                      ? `${item.amountMax.toLocaleString()}${item.unit}`
                      : `${item.amountMin.toLocaleString()} – ${item.amountMax.toLocaleString()}${item.unit}`;

                  return (
                    <div
                      key={item.id}
                      className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      {/* 分类图标 */}
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.light}`}>
                        <PolicyIcon category={item.category} className={`h-4 w-4 ${style.text}`} />
                      </div>

                      {/* 内容 */}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-800">{item.name}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            {cityLabel}
                          </span>
                          <span className={`font-semibold ${style.text}`}>{amountText}</span>
                        </div>
                      </div>

                      {/* 移除按钮 */}
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                        title="取消收藏"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB 按钮 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-600/30 ${open ? 'ring-4 ring-blue-200' : ''}`}
        title="我的收藏"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        {/* 计数徽标 */}
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
    </>
  );
}
