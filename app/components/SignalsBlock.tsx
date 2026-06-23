export interface SignalItem {
  label: "WIN" | "LAUNCH" | "WATCH" | "SHIFT";
  headline: string;
  blurb?: string;
  link?: string;
}

const LABEL_COLORS: Record<SignalItem["label"], string> = {
  WIN: "#34a853",
  LAUNCH: "#4285f4",
  WATCH: "#f9ab00",
  SHIFT: "#ea4335",
};

// Renders the embedded `signals` array from an issue (byline-less list items).
export default function SignalsBlock({ signals }: { signals?: SignalItem[] }) {
  if (!signals || signals.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <h2 className="mb-8 text-2xl md:text-3xl font-bold text-white">
          Signals This Month
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {signals.map((signal, i) => {
            const color = LABEL_COLORS[signal.label] ?? "#ea4335";
            const card = (
              <div className="h-full rounded-2xl border border-white/10 bg-[#111] p-5 transition-colors hover:border-white/20">
                <span
                  className="inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: color }}
                >
                  {signal.label}
                </span>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-white">
                  {signal.headline}
                </h3>
                {signal.blurb && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    {signal.blurb}
                  </p>
                )}
              </div>
            );

            return signal.link ? (
              <a
                key={i}
                href={signal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {card}
              </a>
            ) : (
              <div key={i}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
