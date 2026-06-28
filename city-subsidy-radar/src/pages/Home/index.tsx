import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores';
import { ChinaMap, StaticChinaMap } from '../../components/Map';
import { clearFormCache } from '../../utils/formCache';
import { CITY_NAMES } from '../../constants';
import { useState, useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const { resetProfile } = useUserStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePathA = () => {
    clearFormCache();
    resetProfile();
    navigate('/input?mode=single');
  };

  const handlePathB = () => {
    clearFormCache();
    resetProfile();
    navigate('/input?mode=compare');
  };

  const handlePathC = () => {
    navigate('/policies');
  };

  const handleCityClick = (city: string) => {
    clearFormCache();
    resetProfile();
    navigate(`/input?mode=single&city=${city}`);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-600/30">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">城市补贴雷达</span>
          </div>
          {/* AI 服务商设置入口 — Demo 阶段隐藏，后续迭代开放
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 服务商
          </button>
          */}
        </div>
      </header>

      {/* Main: Split-screen hero — map left, content right */}
      <main className="relative flex-1 overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-6 px-6 py-4 lg:gap-10 lg:px-10">
          {/* Left: Map — 无框，平铺整个左侧区域 */}
          <section className="order-2 h-full flex-1 overflow-hidden lg:order-1 lg:basis-[60%]">
            <div className="relative h-full w-full overflow-hidden">
              {isMobile ? (
                <StaticChinaMap />
              ) : (
                <ChinaMap onCityClick={handleCityClick} />
              )}
              {/* 底部提示 */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                蓝色区域为已覆盖城市
                {!isMobile && <span className="text-slate-300">|</span>}
                {!isMobile && '点击区域开始查询'}
              </div>
            </div>
          </section>

          {/* Right: Product name + slogan + path entries */}
          <section className="order-1 flex max-h-full flex-col justify-center overflow-y-auto py-2 lg:order-2 lg:basis-[40%] lg:pr-4">
            <div className="shrink-0">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                已覆盖 {Object.keys(CITY_NAMES).length} 座城市 · 持续更新中
              </div>

              {/* Title */}
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                找到属于你的
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  城市补贴
                </span>
              </h1>

              {/* Slogan */}
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-500">
                输入你的信息，帮你匹配能领的补贴
              </p>
            </div>

            {/* Path entries */}
            <div className="mt-7 shrink-0 space-y-4">
              <button
                onClick={handlePathA}
                className="group relative flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-50 opacity-60 transition-transform group-hover:scale-150" />
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/20">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="relative flex-1">
                  <h3 className="text-base font-bold text-slate-900">我能拿到什么</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    选择目标城市，智能匹配全部可领补贴
                  </p>
                </div>
                <svg className="relative h-5 w-5 shrink-0 text-blue-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handlePathB}
                className="group relative flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-50 opacity-60 transition-transform group-hover:scale-150" />
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/20">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="relative flex-1">
                  <h3 className="text-base font-bold text-slate-900">哪个城市对我更好</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    一键对比多城市补贴总额，数据帮你做决策
                  </p>
                </div>
                <svg className="relative h-5 w-5 shrink-0 text-emerald-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handlePathC}
                className="group relative flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-amber-50 opacity-60 transition-transform group-hover:scale-150" />
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-500/20">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="relative flex-1">
                  <h3 className="text-base font-bold text-slate-900">查看政策</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    按城市、区域浏览全部人才政策，了解补贴详情
                  </p>
                </div>
                <svg className="relative h-5 w-5 shrink-0 text-amber-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 border-t border-slate-100 bg-white/50">
        <div className="mx-auto max-w-7xl px-6 py-2.5 text-center text-xs text-slate-400">
          城市补贴雷达 · 数据仅供参考，以各地人社局最新政策为准
        </div>
      </footer>
    </div>
  );
}
