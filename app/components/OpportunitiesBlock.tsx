export interface OpportunityItem {
  title: string;
  type: string;
  description?: string;
  link: string;
  deadline?: string;
}

function formatDeadline(date?: string): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Renders the embedded `opportunities` array from an issue (the Opportunity Drop).
export default function OpportunitiesBlock({
  opportunities,
}: {
  opportunities?: OpportunityItem[];
}) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <h2 className="mb-8 text-2xl md:text-3xl font-bold text-white">
          Opportunity Drop
        </h2>
        <div className="flex flex-col gap-3">
          {opportunities.map((opp, i) => {
            const deadline = formatDeadline(opp.deadline);
            return (
              <a
                key={i}
                href={opp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#111] p-5 transition-colors hover:border-primary md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {opp.type}
                    </span>
                    {deadline && (
                      <span className="text-xs text-gray-500">
                        Deadline {deadline}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white group-hover:text-primary transition-colors">
                    {opp.title}
                  </h3>
                  {opp.description && (
                    <p className="mt-1 text-sm leading-relaxed text-gray-400">
                      {opp.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary">
                  Apply →
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
