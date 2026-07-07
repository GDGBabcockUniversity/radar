import SectionHeading from "./SectionHeading";

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
    <section id="signals" className="py-12 md:py-16 scroll-mt-24">
      <div className="container">
        <SectionHeading>Signals This Month</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {signals.map((signal, i) => {
            const color = LABEL_COLORS[signal.label] ?? "#ea4335";
            const card = (
              <div className="h-full rounded-2xl border border-edge bg-surface-raised p-5 transition-colors hover:border-edge-strong">
                <span
                  className="inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-content"
                  style={{ backgroundColor: color }}
                >
                  {signal.label}
                </span>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-content">
                  {signal.headline}
                </h3>
                {signal.blurb && (
                  <p className="mt-2 text-sm leading-relaxed text-content-muted">
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
