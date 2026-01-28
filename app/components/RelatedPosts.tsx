import { ArticleCard } from "./";

interface RelatedPostsProps {
  posts: {
    _id: string;
    title: string;
    slug: { current: string };
    description?: string;
    publishedAt?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mainImage?: any;
  }[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="py-16 border-t border-white/10">
      <div className="container">
        <h2
          className="text-2xl md:text-3xl font-bold text-white mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          More from RADAR
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl">
          {posts.slice(0, 2).map((post) => (
            <ArticleCard
              key={post._id}
              variant="default"
              image={
                post.mainImage
                  ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${post.mainImage.asset._ref.replace("image-", "").replace("-jpg", ".jpg").replace("-png", ".png").replace("-webp", ".webp")}`
                  : "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=450&fit=crop"
              }
              date={post.publishedAt ? formatDate(post.publishedAt) : ""}
              title={post.title}
              description={post.description}
              href={`/posts/${post.slug.current}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
