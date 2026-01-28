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
  return (
    <header className="relative">
      {/* Hero Image */}
      <div className="relative aspect-video md:aspect-[21/9] w-full overflow-hidden">
        {mainImage ? (
          <Image
            src={urlFor(mainImage).width(1920).height(820).url()}
            alt={mainImage.alt || title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container pb-8 md:pb-12">
            {/* Tags Row */}
            <div
              className="mb-4 flex items-center gap-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {categories?.map((cat) => (
                <span
                  key={cat.title}
                  className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide rounded-full bg-white/10 text-white/80 backdrop-blur-sm"
                >
                  {cat.title}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed"
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
