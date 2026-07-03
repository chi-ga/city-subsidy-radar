import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'centered' | 'inline';
}

export function EmptyState({ icon, title, description, action, variant = 'centered' }: EmptyStateProps) {
  if (variant === 'inline') {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          {icon}
        </div>
        <p className="mt-4 text-base font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-5 rounded-xl bg-civic-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-civic-blue/90 active:scale-[0.98] focus-ring"
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 rounded-xl bg-civic-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-civic-blue/90 active:scale-[0.98] focus-ring"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
