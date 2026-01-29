import { ArticleCard } from "../components";
import { urlFor } from "../lib/sanity";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  publishedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mainImage?: any;
  categories?: { title: string }[];
}

interface PastEditionsSectionProps {
  posts: Post[];
}

export default function PastEditionsSection({
  posts,
}: PastEditionsSectionProps) {
  if (!posts || posts.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section id="editions" className="bg-black py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="mb-10">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Past Editions
          </h2>
          <p
            className="text-gray-400"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            The history of GDG Babcock, documented.
          </p>
        </div>

        {/* Editions Grid */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl">
          {posts.map((post) => {
            const imageUrl = post.mainImage
              ? urlFor(post.mainImage).width(600).height(450).url()
              : "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=450&fit=crop";

            return (
              <ArticleCard
                key={post._id}
                variant="default"
                image={imageUrl}
                date={post.publishedAt ? formatDate(post.publishedAt) : ""}
                title={post.title}
                description={post.description}
                href={`/posts/${post.slug.current}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
