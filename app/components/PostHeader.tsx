import Image from "next/image";
import { urlFor } from "../lib/sanity";

interface PostHeaderProps {
  title: string;
  description?: string;
  mainImage?: {
    asset: { _ref: string };
    alt?: string;
  };
  categories?: { title: string }[];
}

export default function PostHeader({
  title,
  description,
  mainImage,
  categories,
}: PostHeaderProps) {
  // If no image, use a compact header layout
  if (!mainImage) {
    return (
      <header className="pb-8 md:pb-10 pt-8 md:pt-12">
        <div className="container">
          {/* Tags Row */}
          {categories && categories.length > 0 && (
            <div
              className="mb-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {categories.map((cat) => (
                <span
                  key={cat.title}
                  className="px-2.5 py-1 text-xs font-medium uppercase tracking-wide rounded-full bg-white/10 text-white/80"
                >
                  {cat.title}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p
              className="mt-3 text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {description}
            </p>
          )}
        </div>
      </header>
    );
  }

  // With image, use hero layout
  return (
    <header className="relative">
      {/* Hero Image */}
      <div className="relative aspect-video md:aspect-21/9 w-full overflow-hidden">
        <Image
          src={urlFor(mainImage).width(1920).height(820).url()}
          alt={mainImage.alt || title}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container pb-6 md:pb-10">
            {/* Tags Row */}
            {categories && categories.length > 0 && (
              <div
                className="mb-3 flex items-center gap-2"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {categories.map((cat) => (
                  <span
                    key={cat.title}
                    className="px-2.5 py-1 text-xs font-medium uppercase tracking-wide rounded-full bg-white/10 text-white/80 backdrop-blur-sm"
                  >
                    {cat.title}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                className="mt-3 text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
