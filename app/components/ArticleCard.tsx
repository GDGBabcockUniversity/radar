import Image from "next/image";

interface ArticleCardProps {
  image: string;
  tag?: string;
  tagColor?: "blue" | "default";
  editionNumber?: string;
  date: string;
  title: string;
  description?: string;
  href?: string;
  variant?: "featured" | "default";
  className?: string;
}

export default function ArticleCard({
  image,
  tag,
  editionNumber,
  date,
  title,
  description,
  href = "#",
  variant = "default",
  className = "",
}: ArticleCardProps) {
  const isFeatured = variant === "featured";

  // Featured variant - overlay style
  if (isFeatured) {
    return (
      <a
        href={href}
        className={`
          group relative block overflow-hidden rounded-2xl
          transition-all duration-300 ease-out
          hover:scale-[1.01] aspect-video
          ${className}
        `}
      >
        {/* Background Image */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Tags Row */}
          <div
            className="mb-3 flex items-center gap-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {tag && (
              <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded bg-primary text-white">
                {tag}
              </span>
            )}
          </div>

          {/* Title - Space Grotesk */}
          <h3
            className="text-2xl md:text-3xl font-semibold text-white leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h3>

          {/* Description - Inter */}
          {description && (
            <p
              className="mt-2 text-sm text-white/70 line-clamp-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {description}
            </p>
          )}
        </div>
      </a>
    );
  }

  // Default variant - image on top, content below
  return (
    <a
      href={href}
      className={`
        group block overflow-hidden rounded-2xl bg-[#111] border border-white/10
        transition-all duration-300 ease-out
        hover:border-white/20
        ${className}
      `}
    >
      {/* Image Section */}
      <div className="relative aspect-4/3">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Meta Row - Edition number and date */}
        <div
          className="flex items-center justify-between mb-4"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {/* Edition Number */}
          {editionNumber && (
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {editionNumber}
            </span>
          )}
          {tag && !editionNumber && (
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {tag}
            </span>
          )}

          {/* Date with calendar icon */}
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-70"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" />
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" />
            </svg>
            {date}
          </span>
        </div>

        <div className="h-0.5 bg-[#161616] mb-5 rounded-full" />

        {/* Title - Space Grotesk */}
        <h3
          className="text-xl font-semibold text-white leading-tight mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>

        {/* Description - Inter */}
        {description && (
          <p
            className="text-sm text-gray-400 leading-relaxed line-clamp-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {description}
          </p>
        )}
      </div>
    </a>
  );
}
