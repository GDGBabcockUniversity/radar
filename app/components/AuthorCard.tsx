import Image from "next/image";
import { urlFor } from "../lib/sanity";

interface AuthorCardProps {
  author?: {
    name: string;
    image?: {
      asset: { _ref: string };
    };
    bio?: string;
  };
  publishedAt?: string;
  readingTime?: number;
}

export default function AuthorCard({
  author,
  publishedAt,
  readingTime,
}: AuthorCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="flex items-center gap-4 py-6 border-b border-white/10"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Author Avatar */}
      {author?.image ? (
        <Image
          src={urlFor(author.image).width(48).height(48).url()}
          alt={author.name}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-semibold text-lg">
            {author?.name?.charAt(0) || "R"}
          </span>
        </div>
      )}

      {/* Author Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <span className="text-white font-medium">
          {author?.name || "RADAR Team"}
        </span>
        <span className="hidden sm:block text-gray-500 mx-2">•</span>
        {publishedAt && (
          <>
            <span className="text-gray-400 text-sm">
              {formatDate(publishedAt)}
            </span>
            {readingTime && (
              <>
                <span className="hidden sm:block text-gray-500 mx-2">•</span>
                <span className="text-gray-400 text-sm">
                  {readingTime} min read
                </span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
