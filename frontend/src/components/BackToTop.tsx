import { useEffect, useState } from 'react';
import { ArrowUpIcon } from './icons';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="回到顶部"
      className={`fixed bottom-safe right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-lg shadow-slate-200/40 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-ink hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-civic-blue/30 sm:right-6 sm:h-11 sm:w-11 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none'
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
