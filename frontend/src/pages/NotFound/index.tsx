import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <EmptyState
        icon={<span className="font-data text-3xl font-extrabold text-slate-300">404</span>}
        title="页面不存在"
        description="你访问的页面不存在或已被移除"
        action={{
          label: '返回首页',
          onClick: () => navigate('/'),
        }}
      />
    </div>
  );
}
