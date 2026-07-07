import Image from "next/image";
import Link from "next/link";
import { urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  publishedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mainImage?: any;
  author?: { name: string };
  categories?: { title: string }[];
}

interface Signal {
  label: "WIN" | "LAUNCH" | "WATCH" | "SHIFT";
  headline: string;
  blurb?: string;
  link?: string;
}

interface Opportunity {
  title: string;
  type?: string;
  description?: string;
  link: string;
  deadline?: string;
}

interface Editorial {
  quote: string;
  note?: string;
  mission?: string;
}

interface Issue {
  _id: string;
  issueNumber?: number;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  signals?: Signal[];
  opportunities?: Opportunity[];
  editorial?: Editorial;
}

interface LatestIssueSectionProps {
  posts: Post[];
  issue?: Issue | null;
}

// Accent color per signal label (presentational only).
const SIGNAL_COLORS: Record<string, string> = {
  WIN: "var(--color-gdg-red)",
  LAUNCH: "var(--color-primary)",
  WATCH: "var(--color-gdg-yellow)",
  SHIFT: "var(--color-gdg-green)",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatIssueDate(dateString: string) {
  const d = new Date(dateString);
  const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const year = d.getFullYear();
  return `${month} ${year}`;
}

export default function LatestIssueSection({
  posts,
  issue,
}: LatestIssueSectionProps) {
  const latestPost = posts?.[0];
  if (!issue && !latestPost) return null;

  // Feature card: prefer the latest issue document; fall back to the latest
  // legacy post (current content still lives in the older post format).
  const feature = issue
    ? {
        title: issue.title,
        href: PAGES.issue(issue.slug.current),
        image: issue.coverImage?.asset
          ? urlFor(issue.coverImage).width(400).height(300).url()
          : null,
        number:
          issue.issueNumber != null
            ? String(issue.issueNumber).padStart(3, "0")
            : String(posts?.length ?? 0).padStart(3, "0"),
        date: issue.publishedAt,
        summary: issue.excerpt,
        author: undefined as string | undefined,
        cta: "Read Issue →",
      }
    : {
        title: latestPost!.title,
        href: PAGES.post(latestPost!.slug.current),
        image: latestPost!.mainImage
          ? urlFor(latestPost!.mainImage).width(400).height(300).url()
          : null,
        number: String(posts.length).padStart(3, "0"),
        date: latestPost!.publishedAt,
        summary: latestPost!.description,
        author: latestPost!.author?.name,
        cta: "Read Latest →",
      };

  const signals = issue?.signals ?? [];
  const opportunities = issue?.opportunities ?? [];
  const editorial = issue?.editorial;
  const hasSignals = signals.length > 0;

  // Bottom row cards — only those with content render.
  const bottomCards: React.ReactNode[] = [];

  if (editorial) {
    bottomCards.push(
      <>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Editorial
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "var(--color-gdg-red)", opacity: 0.4 }}
          />
        </div>
        <h3 className="text-base font-bold text-foreground leading-snug mb-3">
          {editorial.quote}
        </h3>
        {editorial.note && (
          <p className="text-xs text-content-muted leading-relaxed mb-5">
            {editorial.note}
          </p>
        )}
        {editorial.mission && (
          <div className="border border-edge rounded-sm p-4 mt-auto">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: "var(--color-gdg-red)" }}
            >
              Our Mission
            </p>
            <p className="text-xs text-content-muted leading-relaxed italic">
              {editorial.mission}
            </p>
          </div>
        )}
      </>,
    );
  }

  if (opportunities.length > 0) {
    bottomCards.push(
      <>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Opportunity Drop
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "var(--color-primary)", opacity: 0.4 }}
          />
        </div>
        <div className="flex flex-col gap-4">
          {opportunities.map((opp, j) => {
            const meta = [opp.type, opp.deadline ? `Due ${formatDate(opp.deadline)}` : null]
              .filter(Boolean)
              .join(" · ");
            return (
              <a
                key={j}
                href={opp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1"
              >
                <span className="text-sm font-semibold text-content leading-snug group-hover:text-primary transition-colors">
                  {opp.title}
                </span>
                {meta && (
                  <span className="text-[10px] uppercase tracking-wider text-content-subtle font-medium">
                    {meta}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </>,
    );
  }

  return (
    <section id="featured" className="latest-issue-section py-16 md:py-20">
      <div className="container">
        {/* ===== Top Row ===== */}
        <div
          className={`grid grid-cols-1 ${
            hasSignals ? "lg:grid-cols-2" : ""
          } gap-0 border border-edge rounded-sm overflow-hidden bg-surface-raised dark-card`}
        >
          {/* Left — Feature Card */}
          <div
            className={`p-8 md:p-10 ${
              hasSignals ? "border-b lg:border-b-0 lg:border-r border-edge" : ""
            }`}
          >
            {/* Header label */}
            <p className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted) mb-6">
              Latest Issue — {feature.number}
            </p>

            {/* Issue meta */}
            <p className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-4">
              Issue {feature.number}
              {feature.date ? ` · ${formatIssueDate(feature.date)}` : ""}
            </p>

            {/* Title + Image row */}
            <div className="flex gap-6 items-start mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight flex-1">
                {feature.title}
              </h2>
              {feature.image && (
                <div className="hidden sm:block shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                  <Image
                    src={feature.image}
                    width={400}
                    height={300}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            {feature.summary && (
              <p className="text-sm text-(--color-text-muted) leading-relaxed mb-6 max-w-md">
                {feature.summary}
              </p>
            )}

            {/* Separator */}
            <div className="h-px bg-overlay-strong mb-4" />

            {/* Author / meta */}
            <p className="text-xs text-(--color-text-muted) mb-4">
              {feature.author ? `By ${feature.author}` : ""}
              {feature.date ? ` · ${formatDate(feature.date)}` : ""}
            </p>

            {/* Read link */}
            <Link
              href={feature.href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              {feature.cta}
            </Link>
          </div>

          {/* Right — Signals List */}
          {hasSignals && (
            <div className="p-8 md:p-10 flex flex-col">
              <div className="flex flex-col gap-6 flex-1">
                {signals.map((signal, i) => {
                  const row = (
                    <>
                      {/* Tag */}
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider mt-1 shrink-0 w-14"
                        style={{ color: SIGNAL_COLORS[signal.label] }}
                      >
                        {signal.label}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground leading-snug mb-1">
                          {signal.headline}
                        </h4>
                        {signal.blurb && (
                          <p className="text-xs text-(--color-text-muted) leading-relaxed">
                            {signal.blurb}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      {signal.link && (
                        <span className="text-(--color-text-muted) group-hover:text-foreground transition-colors mt-1 shrink-0">
                          →
                        </span>
                      )}
                    </>
                  );

                  return signal.link ? (
                    <a
                      key={i}
                      href={signal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 group"
                    >
                      {row}
                    </a>
                  ) : (
                    <div key={i} className="flex items-start gap-4 group">
                      {row}
                    </div>
                  );
                })}
              </div>

              {/* View All */}
              {issue && (
                <div className="mt-6 pt-4 border-t border-edge">
                  <Link
                    href={feature.href}
                    className="text-xs uppercase tracking-[0.15em] font-semibold text-(--color-text-muted) hover:text-foreground transition-colors"
                  >
                    View All Signals →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== Bottom Row ===== */}
        {bottomCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-x border-b border-edge rounded-b-sm overflow-hidden bg-surface-raised dark-card">
            {bottomCards.map((card, i) => (
              <div
                key={i}
                className={`p-6 md:p-8 flex flex-col ${
                  i < bottomCards.length - 1
                    ? "border-b sm:border-b-0 sm:border-r border-edge"
                    : ""
                }`}
              >
                {card}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
