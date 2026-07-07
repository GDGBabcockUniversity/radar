interface LiveBadgeProps {
  date: string;
  className?: string;
}

export default function LiveBadge({ date, className = "" }: LiveBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-overlay border border-edge text-xs ${className}`}
    >
      {/* Pulsing live dot */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
      </span>

      <span className="text-content-muted uppercase tracking-wider font-medium">
        Live
      </span>
      <span className="text-content-subtle">•</span>
      <span className="text-content-muted uppercase tracking-wider">{date}</span>
    </div>
  );
}
