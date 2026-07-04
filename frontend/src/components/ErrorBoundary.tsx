import { Component, type ReactNode } from 'react';
import { ExclamationTriangleIcon } from './icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('应用错误:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper p-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-seal-red/10">
              <ExclamationTriangleIcon className="h-8 w-8 text-seal-red" />
            </div>
            <h1 className="mt-4 text-lg font-bold text-ink">页面出错了</h1>
            <p className="mt-1 text-sm text-slate-500">
              应用遇到了一个意外错误，请尝试刷新页面。
            </p>
            {this.state.error && (
              <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-400 break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-civic-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-civic-blue/90 focus-ring"
              >
                刷新页面
              </button>
              <button
                onClick={this.handleReset}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus-ring"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
