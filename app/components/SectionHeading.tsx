// Editorial section header: an uppercase tracked kicker with a hairline rule
// running to the edge — the rhythm marker between sections of an issue.
export default function SectionHeading({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="mb-8 flex items-center gap-4 scroll-mt-24">
      <h2 className="shrink-0 text-xs font-bold uppercase tracking-[2px] text-primary">
        {children}
      </h2>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
