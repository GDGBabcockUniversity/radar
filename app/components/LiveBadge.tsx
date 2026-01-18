interface LiveBadgeProps {
  date: string;
  className?: string;
}

export default function LiveBadge({ date, className = "" }: LiveBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs ${className}`}
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {/* Pulsing live dot */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
      </span>

      <span className="text-gray-400 uppercase tracking-wider font-medium">
        Live
      </span>
      <span className="text-gray-500">•</span>
      <span className="text-gray-400 uppercase tracking-wider">{date}</span>
    </div>
  );
}
