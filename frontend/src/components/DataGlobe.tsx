import Globe, { type GlobeMethods } from 'react-globe.gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type CitySignal = {
  city: string;
  label: string;
  lat: number;
  lng: number;
  value: string;
  amount: string;
  color: string;
};

type FlowArc = {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  color: [string, string];
};

const CITY_SIGNALS: CitySignal[] = [
  {
    city: 'beijing',
    label: '北京',
    lat: 39.9042,
    lng: 116.4074,
    value: '博士后 / 落户通道',
    amount: '26,800',
    color: '#e87819',
  },
  {
    city: 'shanghai',
    label: '上海',
    lat: 31.2304,
    lng: 121.4737,
    value: '留学回国 / 临港安家',
    amount: '24,000',
    color: '#e87819',
  },
  {
    city: 'guangzhou',
    label: '广州',
    lat: 23.1291,
    lng: 113.2644,
    value: '黄埔 / 花都人才',
    amount: '18,000',
    color: '#e87819',
  },
  {
    city: 'shenzhen',
    label: '深圳',
    lat: 22.5431,
    lng: 114.0579,
    value: '青年人才新政',
    amount: '34,500',
    color: '#f47a18',
  },
];

const FLOW_ARCS: FlowArc[] = [
  { fromLat: 1.3521, fromLng: 103.8198, toLat: 39.9042, toLng: 116.4074, color: ['rgba(215,166,73,0.08)', 'rgba(215,166,73,0.72)'] },
  { fromLat: 35.6762, fromLng: 139.6503, toLat: 31.2304, toLng: 121.4737, color: ['rgba(255,255,255,0.18)', 'rgba(215,166,73,0.68)'] },
  { fromLat: 13.7563, fromLng: 100.5018, toLat: 23.1291, toLng: 113.2644, color: ['rgba(215,166,73,0.08)', 'rgba(215,166,73,0.62)'] },
  { fromLat: 25.033,
    fromLng: 121.5654,
    toLat: 22.5431,
    toLng: 114.0579,
    color: ['rgba(255,255,255,0.16)', 'rgba(244,122,24,0.72)'] },
];

type DataGlobeProps = {
  onCityClick: (city: string) => void;
};

export function DataGlobe({ onCityClick }: DataGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 720, height: 620 });

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      setDimensions({
        width: Math.max(340, Math.round(rect.width)),
        height: Math.max(360, Math.round(rect.height)),
      });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(shell);

    return () => observer.disconnect();
  }, []);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    controls.autoRotate = false;
    globe.pointOfView({ lat: 29, lng: 108, altitude: 1.5 }, 0);

    window.setTimeout(() => {
      globe.pointOfView({ lat: 29, lng: 108, altitude: 1.5 }, 0);
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 0.045;
    }, 1800);

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.72;
    controls.minDistance = 160;
    controls.maxDistance = 420;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.maxPolarAngle = Math.PI * 0.82;
  }, [reducedMotion]);

  const makeHtmlMarker = useCallback(
    (data: object) => {
      const signal = data as CitySignal;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'globe-city-marker';
      el.setAttribute('aria-label', `选择${signal.label}，最高可领${signal.amount}元`);
      el.innerHTML = `
        <span class="globe-city-marker__dot"></span>
        <span class="globe-city-marker__text">
          <strong>${signal.label}</strong>
        </span>
      `;
      el.onclick = () => onCityClick(signal.city);
      return el;
    },
    [onCityClick]
  );

  return (
    <section className="relative min-h-[430px] overflow-hidden rounded-[2.25rem] lg:min-h-[620px]">
      <div className="absolute inset-x-2 bottom-4 top-14 rounded-[48%] bg-[radial-gradient(circle,rgba(218,190,124,0.36),rgba(255,255,255,0)_68%)] blur-2xl" />
      <div className="absolute right-4 top-8 z-20 rounded-[1.5rem] border border-subsidy-line bg-white/76 px-5 py-4 shadow-[0_24px_70px_rgba(72,54,21,0.13)] backdrop-blur-xl">
        <div className="text-sm font-semibold text-subsidy-ink">实时政策更新</div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-mono text-3xl font-bold text-subsidy-green">147</span>
          <span className="pb-1 text-xs font-bold text-subsidy-gold">+12</span>
        </div>
        <div className="mt-1 text-xs text-subsidy-muted">本月新增政策</div>
      </div>

      <div ref={shellRef} className="relative mx-auto h-[430px] w-full max-w-[780px] cursor-grab active:cursor-grabbing lg:h-[650px]">
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-subsidy-line bg-white/78 px-3 py-1.5 text-xs font-semibold text-subsidy-muted shadow-sm backdrop-blur-xl md:block">
          拖拽旋转 · 滚轮缩放
        </div>
        <div className="pointer-events-none absolute inset-[3%] rounded-full border border-subsidy-gold/22" />
        <div className="pointer-events-none absolute inset-x-0 top-[20%] h-[58%] rotate-[-13deg] rounded-[50%] border border-subsidy-gold/35" />
        <div className="pointer-events-none absolute inset-x-[4%] top-[26%] h-[42%] rotate-[9deg] rounded-[50%] border border-white/75" />

        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="/globe/earth-blue-marble.jpg"
          bumpImageUrl="/globe/earth-topology.jpg"
          showAtmosphere
          atmosphereColor="#f4dda1"
          atmosphereAltitude={0.18}
          globeCurvatureResolution={6}
          pointsData={CITY_SIGNALS}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.035}
          pointRadius={0.34}
          pointResolution={32}
          onPointClick={(point) => onCityClick((point as CitySignal).city)}
          ringsData={CITY_SIGNALS}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => ['rgba(244,122,24,0.38)', 'rgba(244,122,24,0.02)']}
          ringMaxRadius={3.6}
          ringPropagationSpeed={1.1}
          ringRepeatPeriod={1900}
          arcsData={FLOW_ARCS}
          arcStartLat="fromLat"
          arcStartLng="fromLng"
          arcEndLat="toLat"
          arcEndLng="toLng"
          arcColor="color"
          arcAltitude={0.28}
          arcStroke={0.55}
          arcDashLength={0.72}
          arcDashGap={1.8}
          arcDashAnimateTime={3800}
          htmlElementsData={CITY_SIGNALS}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.055}
          htmlElement={makeHtmlMarker}
          htmlElementVisibilityModifier={(el, isVisible) => {
            el.style.opacity = isVisible ? '1' : '0';
            el.style.pointerEvents = isVisible ? 'auto' : 'none';
          }}
          htmlTransitionDuration={0}
          onGlobeReady={handleGlobeReady}
          enablePointerInteraction
        />
      </div>

      <div className="absolute bottom-8 right-8 z-20 hidden rounded-[1.4rem] border border-subsidy-line bg-white/76 px-6 py-4 shadow-[0_24px_70px_rgba(72,54,21,0.13)] backdrop-blur-xl sm:block">
        <div className="text-sm font-semibold text-subsidy-ink">覆盖城市</div>
        <div className="mt-1 font-mono text-3xl font-bold text-subsidy-green">19</div>
        <div className="mt-1 text-xs text-subsidy-muted">持续增加中</div>
      </div>

      <div className="relative z-30 mt-4 grid grid-cols-2 gap-3 md:hidden">
        {CITY_SIGNALS.map((signal) => (
          <button
            key={signal.city}
            type="button"
            onClick={() => onCityClick(signal.city)}
            className="rounded-2xl border border-subsidy-line bg-white/82 px-3 py-2 text-left shadow-sm backdrop-blur transition hover:border-subsidy-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-subsidy-green"
          >
            <span className="block font-semibold text-subsidy-ink">{signal.label}</span>
            <span className="text-xs text-subsidy-muted">{signal.value}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
