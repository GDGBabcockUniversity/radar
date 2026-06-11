import Image from "next/image";
import Link from "next/link";
import { urlFor } from "../lib/sanity";

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

interface LatestIssueSectionProps {
  posts: Post[];
}

// Static signals data (could be fetched from CMS later)
const SIGNALS = [
  {
    tag: "WIN",
    tagColor: "#ea4335",
    title: "Babcock student team places top 10 at GDG DevFest hackathon",
    description:
      "Three-person squad shipped a campus logistics tool in 36 hours.",
  },
  {
    tag: "LAUNCH",
    tagColor: "#4285f4",
    title: "New developer co-op opens off-campus near the SoCS building",
    description: "Coworking + mentorship — open to all student builders.",
  },
  {
    tag: "WATCH",
    tagColor: "#f9ab00",
    title: "Final-year project pipeline trending toward AI tooling",
    description:
      "Five of nine standout pitches center on agents and inference.",
  },
  {
    tag: "SHIFT",
    tagColor: "#34a853",
    title: "Curriculum review adds practical software engineering track",
    description: "Effective from the 2026 academic year per faculty memo.",
  },
];

const BOTTOM_SECTIONS = [
  {
    label: "EDITORIAL",
    accentColor: "#ea4335",
    title: '"We often fear what we do not understand..."',
    description:
      "An opening note on the philosophy of RADAR and why we document the ecosystem.",
    card: {
      label: "OUR MISSION",
      labelColor: "#ea4335",
      text: '"To document, preserve, and amplify the signals of the Babcock Tech Ecosystem."',
    },
  },
  {
    label: "OPPORTUNITY DROP",
    accentColor: "#ffffff",
    title: null,
    description: null,
    card: {
      label: "ECOSYSTEM SIGNALS",
      labelColor: "#ffffff",
      items: [
        { num: "01", text: "DevFest Lagos Highlights" },
        { num: "02", text: "Academic Weapon: AI Tools" },
      ],
    },
  },
  {
    label: "SECTION 3",
    accentColor: "#ea4335",
    title: null,
    description: null,
    card: null,
  },
  {
    label: "SECTION 4",
    accentColor: "#ffffff",
    title: null,
    description: null,
    card: null,
  },
];

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

export default function LatestIssueSection({ posts }: LatestIssueSectionProps) {
  if (!posts || posts.length === 0) return null;

  const latestPost = posts[0];
  const imageUrl = latestPost.mainImage
    ? urlFor(latestPost.mainImage).width(400).height(300).url()
    : null;

  const issueNumber = String(posts.length).padStart(3, "0");

  return (
    <section id="featured" className="latest-issue-section py-16 md:py-20">
      <div className="container">
        {/* ===== Top Row ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/10 rounded-sm overflow-hidden">
          {/* Left — Latest Issue Card */}
          <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Header label */}
            <p className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted) mb-6">
              Latest Issue — {issueNumber}
            </p>

            {/* Issue meta */}
            <p className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-4">
              Issue {issueNumber} ·{" "}
              {latestPost.publishedAt
                ? formatIssueDate(latestPost.publishedAt)
                : ""}
            </p>

            {/* Title + Image row */}
            <div className="flex gap-6 items-start mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight flex-1">
                {latestPost.title}
              </h2>
              {imageUrl && (
                <div className="hidden sm:block shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    width={400}
                    height={300}
                    alt={latestPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            {latestPost.description && (
              <p className="text-sm text-(--color-text-muted) leading-relaxed mb-6 max-w-md">
                {latestPost.description}
              </p>
            )}

            {/* Separator */}
            <div className="h-px bg-white/10 mb-4" />

            {/* Author / meta */}
            <p className="text-xs text-(--color-text-muted) mb-4">
              {latestPost.author?.name ? `By ${latestPost.author.name}` : ""}
              {latestPost.publishedAt &&
                ` · ${formatDate(latestPost.publishedAt)}`}
            </p>

            {/* Read link */}
            <Link
              href={`/posts/${latestPost.slug.current}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Read Issue →
            </Link>
          </div>

          {/* Right — Signals List */}
          <div className="p-8 md:p-10 flex flex-col">
            <div className="flex flex-col gap-6 flex-1">
              {SIGNALS.map((signal, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  {/* Tag */}
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider mt-1 shrink-0 w-14"
                    style={{ color: signal.tagColor }}
                  >
                    {signal.tag}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground leading-snug mb-1">
                      {signal.title}
                    </h4>
                    <p className="text-xs text-(--color-text-muted) leading-relaxed">
                      {signal.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span className="text-(--color-text-muted) group-hover:text-foreground transition-colors mt-1 shrink-0">
                    →
                  </span>
                </div>
              ))}
            </div>

            {/* View All */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <Link
                href="#"
                className="text-xs uppercase tracking-[0.15em] font-semibold text-(--color-text-muted) hover:text-foreground transition-colors"
              >
                View All Signals →
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Bottom Row ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-x border-b border-white/10 rounded-b-sm overflow-hidden">
          {BOTTOM_SECTIONS.map((section, i) => (
            <div
              key={i}
              className={`p-6 md:p-8 ${
                i < BOTTOM_SECTIONS.length - 1
                  ? "border-b sm:border-b-0 sm:border-r border-white/10"
                  : ""
              } ${i === 2 ? "sm:border-b lg:border-b-0" : ""}`}
            >
              {/* Section label with accent line */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                  {section.label}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: section.accentColor, opacity: 0.4 }}
                />
              </div>

              {/* Title */}
              {section.title && (
                <h3
                  className="text-base font-bold text-foreground leading-snug mb-3"
                  // style={{ fontFamily: "var(--font-serif)" }}
                >
                  {section.title}
                </h3>
              )}

              {/* Description */}
              {section.description && (
                <p className="text-xs text-(--color-text-muted) leading-relaxed mb-5">
                  {section.description}
                </p>
              )}

              {/* Card */}
              {section.card && (
                <div className="border border-white/10 rounded-sm p-4 mt-auto">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                    style={{ color: section.card.labelColor }}
                  >
                    {section.card.label}
                  </p>

                  {"text" in section.card && section.card.text && (
                    <p
                      className="text-xs text-gray-400 leading-relaxed italic"
                      // style={{
                      //   fontFamily: "var(--font-serif)",
                      //   fontStyle: "italic",
                      // }}
                    >
                      {section.card.text}
                    </p>
                  )}

                  {"items" in section.card && section.card.items && (
                    <div className="flex flex-col gap-3">
                      {section.card.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 font-medium">
                            {item.num}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
