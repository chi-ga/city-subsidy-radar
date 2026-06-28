import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
          <span className="text-4xl font-extrabold text-slate-300">404</span>
        </div>
        <h1 className="mt-6 text-xl font-bold text-slate-900">页面不存在</h1>
        <p className="mt-2 text-sm text-slate-500">你访问的页面不存在或已被移除</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
