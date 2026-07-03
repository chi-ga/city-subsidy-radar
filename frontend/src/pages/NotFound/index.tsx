import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
          <span className="font-data text-4xl font-extrabold text-slate-300">404</span>
        </div>
        <h1 className="mt-6 font-display text-xl font-bold text-ink">页面不存在</h1>
        <p className="mt-2 text-sm text-slate-500">你访问的页面不存在或已被移除</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-xl bg-civic-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-civic-blue/90 focus-ring"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
