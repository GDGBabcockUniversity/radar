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
  tagColor = "default",
  editionNumber,
  date,
  title,
  description,
  href = "#",
  variant = "default",
  className = "",
}: ArticleCardProps) {
  const isFeatured = variant === "featured";

  const tagStyles = {
    blue: "bg-[var(--color-primary)] text-white",
    default: "bg-[var(--color-primary)] text-white",
  };

  return (
    <a
      href={href}
      className={`
        group relative block overflow-hidden rounded-xl
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-[var(--shadow-card)]
        ${isFeatured ? "aspect-[16/9]" : "aspect-[4/3]"}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Tags Row */}
        <div className="mb-3 flex items-center gap-3">
          {tag && (
            <span
              className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded ${tagStyles[tagColor]}`}
            >
              {tag}
            </span>
          )}
          {editionNumber && (
            <span className="px-2 py-1 text-xs font-medium uppercase tracking-wide rounded bg-[var(--color-primary)] text-white">
              {editionNumber}
            </span>
          )}
          <span className="text-xs text-white/70">{date}</span>
        </div>

        {/* Title */}
        <h3
          className={`
            font-heading font-semibold text-white leading-tight
            ${isFeatured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}
          `}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mt-2 text-sm text-white/70 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </a>
  );
}
