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

  return (
    <a
      href={href}
      className={`
        group relative block overflow-hidden rounded-2xl
        transition-all duration-300 ease-out
        hover:scale-[1.01]
        ${isFeatured ? "aspect-video" : "aspect-4/3"}
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
          {editionNumber && (
            <span className="px-2 py-1 text-xs font-medium uppercase tracking-wide rounded bg-primary text-white">
              {editionNumber}
            </span>
          )}
          <span className="text-xs text-white/60 flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-60"
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

        {/* Title - Space Grotesk */}
        <h3
          className={`
            font-semibold text-white leading-tight
            ${isFeatured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}
          `}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>

        {/* Description - Inter */}
        {description && (
          <p
            className="mt-2 text-sm text-white/60 line-clamp-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {description}
          </p>
        )}
      </div>
    </a>
  );
}
