import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores';
import { ChinaMap } from '../../components/Map';
import { GitHubPromo } from '../../components/GitHubPromo';
import { FavoritesButton } from '../../components/FavoritesButton';
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

  const coveredCount = Object.keys(CITY_NAMES).length;

  return (
    <div className="flex min-h-screen flex-col bg-paper lg:h-screen lg:overflow-hidden">
      {/* Header */}
      <header className="relative z-50 shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-new.jpg"
              alt="城市补贴雷达"
              className="h-8 w-8 rounded-lg object-cover shadow-sm shadow-civic-blue/30"
            />
            <span className="text-lg font-bold tracking-tight text-ink">城市补贴雷达</span>
          </div>
          <FavoritesButton />
        </div>
      </header>

      {/* Main: 桌面端分屏，移动端纯内容 */}
      <main className="relative flex-1 lg:overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-start gap-8 px-5 lg:pl-4 lg:pr-16 lg:gap-8">
          {/* Left: Map — 仅桌面端显示 */}
          <section className="hidden h-full flex-1 overflow-hidden lg:block">
            <div className="relative h-full w-full overflow-hidden">
              <ChinaMap onCityClick={handleCityClick} />
              {/* 底部提示 */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-civic-blue" />
                蓝色区域为已覆盖城市
                <span className="text-slate-300">|</span>
                点击区域开始查询
              </div>
            </div>
          </section>

          {/* Right: Product name + slogan + path entries */}
          <section className="flex w-full flex-col lg:h-full lg:max-w-[440px] lg:flex-none lg:pb-5 lg:pt-10">
            <div className="shrink-0">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-civic-blue/15 bg-civic-blue/5 px-3 py-1.5 text-xs font-semibold text-civic-blue sm:px-3.5 sm:py-1.5 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-civic-blue/60 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-civic-blue" />
                </span>
                已覆盖 {coveredCount} 座城市 · 持续更新中
              </div>

              {/* Title */}
              <div className="mt-8">
                <div className="font-display text-4xl font-bold leading-tight text-ink sm:text-4xl lg:text-[3.25rem]">
                  找到属于你的
                </div>
                <div className="mt-1.5 font-display text-4xl font-bold leading-tight text-civic-blue sm:text-4xl lg:mt-2 lg:text-[3.25rem]">
                  城市补贴
                </div>
              </div>
            </div>

            {/* Path entries */}
            <div className="mt-8 flex shrink-0 flex-col justify-center space-y-3.5 lg:mt-5 lg:space-y-3">
              <PathCard
                onClick={handlePathA}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                color="civic-blue"
                title="我能拿到什么"
                description="选择目标城市，智能匹配全部可领补贴"
              />

              <PathCard
                onClick={handlePathB}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                color="celadon"
                title="哪个城市对我更好"
                description="一键对比多城市补贴总额，数据帮你做决策"
              />

              <PathCard
                onClick={handlePathC}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                }
                color="amber"
                title="查看政策"
                description="按城市、区域浏览全部人才政策，了解补贴详情"
              />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 border-t border-slate-200/80 bg-white/60">
        <div className="mx-auto max-w-7xl px-5 py-2.5 text-center text-xs text-slate-400">
          城市补贴雷达 · 数据仅供参考，以各地人社局最新政策为准
        </div>
        <div className="mx-auto max-w-7xl px-5 pb-3 text-center md:hidden">
          <a
            href="https://github.com/chi-ga/city-subsidy-radar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-ink"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            觉得好用，给个Fork支持一下
          </a>
        </div>
      </footer>

      <GitHubPromo />
    </div>
  );
}

interface PathCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  color: 'civic-blue' | 'celadon' | 'amber';
  title: string;
  description: string;
}

const colorMap = {
  'civic-blue': {
    bg: 'bg-civic-blue',
    shadow: 'shadow-civic-blue/20',
    borderHover: 'hover:border-civic-blue/30',
    iconBg: 'bg-civic-blue/10',
    iconText: 'text-civic-blue',
    arrow: 'text-civic-blue',
  },
  celadon: {
    bg: 'bg-celadon',
    shadow: 'shadow-celadon/20',
    borderHover: 'hover:border-celadon/30',
    iconBg: 'bg-celadon/10',
    iconText: 'text-celadon',
    arrow: 'text-celadon',
  },
  amber: {
    bg: 'bg-amber',
    shadow: 'shadow-amber/20',
    borderHover: 'hover:border-amber/30',
    iconBg: 'bg-amber/10',
    iconText: 'text-amber',
    arrow: 'text-amber',
  },
};

function PathCard({ onClick, icon, color, title, description }: PathCardProps) {
  const c = colorMap[color];
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-[104px] w-full shrink-0 items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 pl-4 text-left shadow-sm transition-all ${c.borderHover} hover:shadow-md sm:gap-4 lg:h-24 lg:p-3.5 lg:pl-4`}
    >
      {/* 左侧微色块：与图标色系呼应 */}
      <div className={`absolute left-0 top-0 h-full w-1 ${c.bg} opacity-70`} />
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.iconBg} ${c.iconText} sm:h-11 sm:w-11`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-bold text-ink sm:text-base">{title}</h3>
        <p className="mt-1 text-sm leading-snug text-slate-500 sm:text-sm">{description}</p>
      </div>
      <svg
        className={`h-5 w-5 shrink-0 ${c.arrow} transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
