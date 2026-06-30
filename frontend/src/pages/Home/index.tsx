import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores';
import { clearFormCache } from '../../utils/formCache';
import { CITY_NAMES } from '../../constants';

const DataGlobe = lazy(() => import('../../components/DataGlobe').then((module) => ({ default: module.DataGlobe })));

const DATA_BADGES = [
  { label: '覆盖城市', value: Object.keys(CITY_NAMES).length.toString(), detail: '已接入重点人才城市' },
  { label: '政策条目', value: '147', detail: '持续校准申报口径' },
  { label: '院校库', value: '1,176', detail: '支持院校层次识别' },
  { label: '专业库', value: '805', detail: '按目录匹配专业条件' },
];

const ENTRY_CARDS = [
  {
    title: '我能拿到什么',
    desc: '输入个人信息，智能匹配你可申领的补贴清单',
    tone: 'green',
    icon: 'gift',
  },
  {
    title: '哪个城市更适合我',
    desc: '多维度对比城市补贴与发展机会，找到更优选择',
    tone: 'moss',
    icon: 'pin',
  },
  {
    title: '查看政策库',
    desc: '按城市浏览政策全集，支持关键词搜索与筛选',
    tone: 'orange',
    icon: 'doc',
  },
] as const;

const CITY_COMPARISONS = [
  { city: '北京', amount: '26,800', tags: ['租房补贴', '落户通道', '博士后'] },
  { city: '上海', amount: '24,000', tags: ['留学回国', '临港安家', '人才引进'] },
  { city: '深圳', amount: '34,500', tags: ['青年人才', '重点产业', '区级补贴'], featured: true },
  { city: '广州', amount: '18,000', tags: ['黄埔补贴', '花都人才', '入户奖励'] },
];

const GUIDE_STEPS = ['选城市', '填学历院校', '补充就业/落户', '生成金额和清单'];

function FeatureIcon({ icon }: { icon: (typeof ENTRY_CARDS)[number]['icon'] }) {
  if (icon === 'gift') {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12v8H4v-8m16 0H4m16 0h-5m-6 0H4m7 0v8m2-8v8M7.5 8.5C5.5 8.5 5 7.3 5.4 6.3 6 4.8 8.5 5.1 11 9c2.5-3.9 5-4.2 5.6-2.7.4 1-.1 2.2-2.1 2.2H7.5Z" />
      </svg>
    );
  }
  if (icon === 'pin') {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10.5h.01" />
      </svg>
    );
  }
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h7l3 3v13H7V4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 4v4h4M9 12h6M9 16h5" />
    </svg>
  );
}

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

  const handleEntryClick = (index: number) => {
    if (index === 0) handlePathA();
    if (index === 1) handlePathB();
    if (index === 2) handlePathC();
  };

  return (
    <div className="min-h-screen overflow-hidden bg-subsidy-cream text-subsidy-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(220,180,102,0.18),transparent_28%),radial-gradient(circle_at_76%_18%,rgba(48,91,50,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,242,228,0.82))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[68vh] bg-[url('/icons.svg')] bg-[length:620px_620px] bg-left-top opacity-[0.025]" />

      <header className="relative z-40 border-b border-subsidy-line/80 bg-subsidy-paper/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between px-5 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-subsidy-green"
            aria-label="返回城市补贴雷达首页"
          >
            <img
              src="/logo-new.jpg"
              alt=""
              className="h-12 w-12 rounded-full object-cover shadow-[0_8px_24px_rgba(37,80,43,0.18)] ring-1 ring-subsidy-line [filter:hue-rotate(-88deg)_saturate(0.72)_brightness(0.82)]"
            />
            <span className="text-left">
              <span className="block text-xl font-bold tracking-wide text-subsidy-green">城市补贴雷达</span>
              <span className="mt-0.5 hidden text-xs text-subsidy-muted sm:block">毕业生城市补贴智能查询平台</span>
            </span>
          </button>

          <nav className="hidden items-center gap-9 text-sm font-semibold text-subsidy-ink/80 lg:flex" aria-label="首页导航">
            <a className="relative text-subsidy-green after:absolute after:-bottom-4 after:left-0 after:h-1 after:w-full after:rounded-full after:bg-subsidy-green" href="/">
              首页
            </a>
            <button type="button" onClick={() => handlePathC()} className="transition hover:text-subsidy-green">
              政策库
            </button>
            <button type="button" onClick={handlePathB} className="transition hover:text-subsidy-green">
              城市对比
            </button>
            <a className="transition hover:text-subsidy-green" href="#guide">
              申请指南
            </a>
          </nav>

          <button
            type="button"
            onClick={handlePathA}
            className="hidden rounded-full bg-subsidy-green px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(38,83,42,0.22)] transition hover:bg-subsidy-greenDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-subsidy-gold lg:inline-flex"
          >
            30 秒测算
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-[1480px] items-center gap-10 px-5 pb-8 pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-0 lg:pt-12">
          <div className="relative z-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4ecd8] px-4 py-2 text-sm font-semibold text-subsidy-green shadow-sm ring-1 ring-subsidy-line/70">
              <span className="h-2.5 w-2.5 rounded-full bg-subsidy-green shadow-[0_0_0_6px_rgba(41,82,43,0.1)]" />
              找补贴，用雷达 · 毕业生专属
            </div>

            <h1 className="mt-7 max-w-[760px] text-[3.35rem] font-black leading-[1.05] tracking-tight text-subsidy-ink sm:text-[4.6rem] lg:text-[5.45rem]">
              找准城市补贴
              <span className="block text-subsidy-green">让选择更有价值</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-subsidy-muted sm:text-xl">
              覆盖全国重点城市的人才补贴、租房补贴和落户通道。30 秒测算可申领金额，生成申请材料清单，帮你把城市选择落到具体收益。
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handlePathA}
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-subsidy-green px-8 text-base font-bold text-white shadow-[0_18px_38px_rgba(38,83,42,0.26)] transition hover:-translate-y-0.5 hover:bg-subsidy-greenDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-subsidy-gold"
              >
                开始探索补贴
                <span className="transition group-hover:-translate-y-0.5">↗</span>
              </button>
              <a
                href="#guide"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-subsidy-line bg-white/62 px-8 text-base font-bold text-subsidy-ink shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-subsidy-green"
              >
                了解如何使用
                <span className="grid h-5 w-5 place-items-center rounded-full border border-subsidy-muted text-xs">▶</span>
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-subsidy-muted">
              <div className="flex -space-x-3">
                {['研', '本', '海', '博'].map((item) => (
                  <span key={item} className="grid h-10 w-10 place-items-center rounded-full border-2 border-subsidy-paper bg-white font-bold text-subsidy-green shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
              <div>
                已有 <span className="font-mono font-bold text-subsidy-green">128,672</span> 名毕业生
                <br />
                通过城市补贴雷达找到合适的城市
              </div>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid min-h-[430px] place-items-center rounded-[2.25rem] border border-subsidy-line bg-white/45 text-sm font-semibold text-subsidy-muted lg:min-h-[620px]">
                加载城市机会地球
              </div>
            }
          >
            <DataGlobe onCityClick={handleCityClick} />
          </Suspense>
        </section>

        <section className="relative z-20 mx-auto -mt-2 max-w-[1320px] px-5 lg:-mt-6 lg:px-8" aria-label="核心入口">
          <div className="grid overflow-hidden rounded-[1.8rem] border border-subsidy-line bg-white/78 shadow-[0_28px_80px_rgba(74,60,34,0.13)] backdrop-blur-xl lg:grid-cols-3">
            {ENTRY_CARDS.map((card, index) => (
              <button
                key={card.title}
                type="button"
                onClick={() => handleEntryClick(index)}
                className="group flex min-h-[142px] items-center gap-6 border-b border-subsidy-line px-8 py-6 text-left transition hover:bg-[#fbf6ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-subsidy-green lg:border-b-0 lg:border-r last:lg:border-r-0"
              >
                <span
                  className={[
                    'grid h-20 w-20 shrink-0 place-items-center rounded-full text-white shadow-xl transition group-hover:-translate-y-1',
                    card.tone === 'green' ? 'bg-subsidy-green shadow-green-900/20' : '',
                    card.tone === 'moss' ? 'bg-subsidy-moss shadow-lime-900/15' : '',
                    card.tone === 'orange' ? 'bg-subsidy-orange shadow-orange-800/18' : '',
                  ].join(' ')}
                >
                  <FeatureIcon icon={card.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-bold text-subsidy-ink">{card.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-subsidy-muted">{card.desc}</span>
                </span>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-subsidy-line text-2xl transition group-hover:translate-x-1 group-hover:border-subsidy-gold group-hover:text-subsidy-green">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1320px] gap-6 px-5 py-8 lg:grid-cols-[0.9fr_1.55fr] lg:px-8" id="trust">
          <div className="rounded-[1.6rem] border border-subsidy-line bg-white/72 shadow-[0_24px_70px_rgba(74,60,34,0.09)] backdrop-blur-xl">
            <div className="border-b border-subsidy-line px-7 py-5">
              <h2 className="text-xl font-bold text-subsidy-ink">值得信赖的数据</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-7 px-7 py-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {DATA_BADGES.map((badge) => (
                <div key={badge.label} className="text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#edf1e6] text-subsidy-green ring-1 ring-subsidy-line">✓</div>
                  <div className="mt-4 font-mono text-3xl font-bold text-subsidy-ink">{badge.value}</div>
                  <div className="mt-1 text-sm font-semibold text-subsidy-ink">{badge.label}</div>
                  <div className="mt-1 text-xs text-subsidy-muted">{badge.detail}</div>
                </div>
              ))}
            </div>
            <p className="px-7 pb-6 text-xs text-subsidy-muted">数据来源：各地人社局、发改委、财政局等政府公开政策文件。</p>
          </div>

          <div className="rounded-[1.6rem] border border-subsidy-line bg-white/72 p-6 shadow-[0_24px_70px_rgba(74,60,34,0.09)] backdrop-blur-xl" id="insights">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-subsidy-ink">热门城市补贴对比</h2>
                <p className="mt-1 text-sm text-subsidy-muted">应届本科 · 计算机类 · 默认样例</p>
              </div>
              <button type="button" onClick={handlePathB} className="text-sm font-bold text-subsidy-gold transition hover:text-subsidy-green">
                更多对比 ›
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {CITY_COMPARISONS.map((item) => (
                <button
                  key={item.city}
                  type="button"
                  onClick={() => handleCityClick(item.city === '北京' ? 'beijing' : item.city === '上海' ? 'shanghai' : item.city === '深圳' ? 'shenzhen' : 'guangzhou')}
                  className={[
                    'relative overflow-hidden rounded-2xl border bg-[#fffaf0] p-4 text-left transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-subsidy-green',
                    item.featured ? 'border-subsidy-orange shadow-[0_18px_45px_rgba(231,124,31,0.16)]' : 'border-subsidy-line',
                  ].join(' ')}
                >
                  {item.featured && <span className="absolute right-3 top-3 rounded-full bg-subsidy-orange px-2 py-1 text-xs font-bold text-white">最高</span>}
                  <div className="text-lg font-bold text-subsidy-ink">{item.city}</div>
                  <div className="mt-1 text-xs text-subsidy-muted">最高可领（元）</div>
                  <div className="mt-5 font-mono text-3xl font-bold text-subsidy-ink">{item.amount}</div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-[#eee8d5] px-2 py-1 text-xs text-subsidy-green">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <div className="mx-auto mt-6 flex w-fit gap-2" aria-hidden="true">
              <span className="h-1.5 w-6 rounded-full bg-subsidy-green" />
              <span className="h-1.5 w-6 rounded-full bg-subsidy-line" />
              <span className="h-1.5 w-6 rounded-full bg-subsidy-line" />
              <span className="h-1.5 w-6 rounded-full bg-subsidy-line" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 pb-12 lg:px-8" id="guide">
          <div className="rounded-[1.6rem] border border-subsidy-line bg-white/58 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-subsidy-ink">申请指南</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {GUIDE_STEPS.map((step, index) => (
                <div key={step} className="rounded-2xl bg-subsidy-paper p-5 ring-1 ring-subsidy-line">
                  <div className="font-mono text-sm font-bold text-subsidy-gold">0{index + 1}</div>
                  <div className="mt-3 font-bold text-subsidy-ink">{step}</div>
                  <p className="mt-2 text-sm leading-6 text-subsidy-muted">系统按政策条件逐步收敛，最后输出可执行的申请材料和入口。</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-20 border-t border-subsidy-line bg-subsidy-paper/80">
        <div className="mx-auto max-w-[1320px] px-5 py-5 text-center text-xs text-subsidy-muted lg:px-8">
          城市补贴雷达 · 数据仅供参考，以各地人社局最新政策为准
        </div>
      </footer>

    </div>
  );
}
