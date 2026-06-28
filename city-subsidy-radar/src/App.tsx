import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import { useResultStore } from './stores';

// 懒加载非首屏页面，减小首屏 bundle 体积
const Input = lazy(() => import('./pages/Input'));
const Result = lazy(() => import('./pages/Result'));
const Compare = lazy(() => import('./pages/Compare'));
// AI 服务商设置页 — Demo 阶段隐藏，后续迭代开放
// const Settings = lazy(() => import('./pages/Settings'));
const Policies = lazy(() => import('./pages/Policies'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** 页面级 Loading 占位 */
function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

/**
 * 结果页路由守卫：若无匹配结果，重定向到问卷页
 */
function ResultGuard() {
  const result = useResultStore((s) => s.result);
  if (!result) {
    return <Navigate to="/input" replace />;
  }
  return <Outlet />;
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/input" element={<Input />} />
          {/* 结果页需有匹配数据才能访问 */}
          <Route element={<ResultGuard />}>
            <Route path="/result" element={<Result />} />
          </Route>
          <Route path="/compare" element={<Compare />} />
          {/* AI 服务商设置页 — Demo 阶段隐藏，后续迭代开放
          <Route path="/settings" element={<Settings />} />
          */}
          <Route path="/policies" element={<Policies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
