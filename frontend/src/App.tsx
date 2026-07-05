import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { BackToTop } from './components/BackToTop';
import { ScrollToTop } from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const Input = lazy(() => import('./pages/Input'));
const Result = lazy(() => import('./pages/Result'));
const Compare = lazy(() => import('./pages/Compare'));
const Policies = lazy(() => import('./pages/Policies'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppContent() {
  const { pathname } = useLocation();
  const showBackToTop = pathname !== '/';

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<Input />} />
        <Route path="/result" element={<Result />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showBackToTop && <BackToTop />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-paper">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-civic-blue border-t-transparent" />
          </div>
        }
      >
        <AppContent />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
