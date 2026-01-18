interface LiveBadgeProps {
  date: string;
  className?: string;
}

export default function LiveBadge({ date, className = "" }: LiveBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 text-sm font-medium ${className}`}
    >
      {/* Pulsing live dot */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
      </span>

      <span className="text-green-500 uppercase tracking-wide">Live</span>
      <span className="text-[var(--color-text-muted)]">•</span>
      <span className="text-[var(--color-text-muted)] uppercase tracking-wide">
        {date}
      </span>
    </div>
  );
}
