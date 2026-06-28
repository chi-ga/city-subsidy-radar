import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores';
import { ChinaMap } from '../../components/Map';
import { GitHubPromo } from '../../components/GitHubPromo';
import { clearFormCache } from '../../utils/formCache';
import { CITY_NAMES } from '../../constants';

export default function Home() {
  const navigate = useNavigate();
  const { resetProfile } = useUserStore();

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
    <div className="flex min-h-screen flex-col bg-slate-50 lg:h-screen lg:overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-new.jpg"
              alt="城市补贴雷达"
              className="h-8 w-8 rounded-lg object-cover shadow-sm shadow-blue-600/30"
            />
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

      {/* Main: 桌面端分屏，移动端纯内容 */}
      <main className="relative flex-1 lg:overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-start gap-6 px-5 pt-4 pb-6 lg:px-10 lg:pt-2 lg:pb-4 lg:gap-10">
          {/* Left: Map — 仅桌面端显示 */}
          <section className="hidden h-full flex-1 overflow-hidden lg:block lg:basis-[60%]">
            <div className="relative h-full w-full overflow-hidden">
              <ChinaMap onCityClick={handleCityClick} />
              {/* 底部提示 */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                蓝色区域为已覆盖城市
                <span className="text-slate-300">|</span>
                点击区域开始查询
              </div>
            </div>
          </section>

          {/* Right: Product name + slogan + path entries */}
          <section className="flex w-full flex-col justify-start lg:justify-center lg:basis-[40%] lg:pr-4">
            <div className="shrink-0">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 sm:px-3.5 sm:py-1.5 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                已覆盖 {Object.keys(CITY_NAMES).length} 座城市 · 持续更新中
              </div>

              {/* Title */}
              <h1 className="mt-3 text-3xl font-extrabold leading-snug text-slate-900 sm:mt-4 sm:text-4xl lg:text-[3.25rem]">
                找到属于你的
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  城市补贴
                </span>
              </h1>

              {/* Slogan */}
              <p className="mt-3 text-base leading-relaxed text-slate-500 sm:mt-4 sm:text-lg">
                输入你的信息，帮你匹配能领的补贴
              </p>
            </div>

            {/* Path entries */}
            <div className="mt-6 shrink-0 space-y-3 sm:mt-7 sm:space-y-4">
              <button
                onClick={handlePathA}
                className="group relative flex w-full shrink-0 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 sm:gap-4 sm:p-5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-50 opacity-60 transition-transform group-hover:scale-150" />
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/20 sm:h-12 sm:w-12">
                  <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="relative flex-1">
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">我能拿到什么</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:mt-1 sm:text-sm">
                    选择目标城市，智能匹配全部可领补贴
                  </p>
                </div>
                <svg className="relative h-5 w-5 shrink-0 text-blue-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handlePathB}
                className="group relative flex w-full shrink-0 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 sm:gap-4 sm:p-5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-50 opacity-60 transition-transform group-hover:scale-150" />
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/20 sm:h-12 sm:w-12">
                  <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="relative flex-1">
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">哪个城市对我更好</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:mt-1 sm:text-sm">
                    一键对比多城市补贴总额，数据帮你做决策
                  </p>
                </div>
                <svg className="relative h-5 w-5 shrink-0 text-emerald-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handlePathC}
                className="group relative flex w-full shrink-0 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/5 sm:gap-4 sm:p-5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-amber-50 opacity-60 transition-transform group-hover:scale-150" />
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-500/20 sm:h-12 sm:w-12">
                  <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="relative flex-1">
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">查看政策</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:mt-1 sm:text-sm">
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
      <footer className="shrink-0 border-t border-slate-100 bg-white/50 lg:hidden">
        <div className="mx-auto px-5 py-3 text-center text-xs text-slate-400">
          城市补贴雷达 · 数据仅供参考，以各地人社局最新政策为准
        </div>
      </footer>

      <GitHubPromo />
    </div>
  );
}
