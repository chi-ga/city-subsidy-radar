export function RadarSpinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={`animate-radar-sweep ${className}`}
      style={{ transformOrigin: 'center' }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.35" />
      <line x1="12" y1="12" x2="12" y2="3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
