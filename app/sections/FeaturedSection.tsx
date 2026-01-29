import { ArticleCard } from "../components";
import { urlFor } from "../lib/sanity";

interface FeaturedPost {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  publishedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mainImage?: any;
  categories?: { title: string }[];
}

interface FeaturedSectionProps {
  post: FeaturedPost | null;
}

export default function FeaturedSection({ post }: FeaturedSectionProps) {
  if (!post) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(675).url()
    : "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop";

  return (
    <section
      id="featured"
      className="pb-16 max-w-3xl mx-auto"
      style={{
        background:
          "radial-gradient(ellipse at center, #1a2744 0%, #0a0a0a 70%)",
      }}
    >
      <div className="container">
        <ArticleCard
          variant="featured"
          image={imageUrl}
          tag="Featured"
          tagColor="blue"
          date={post.publishedAt ? formatDate(post.publishedAt) : ""}
          title={post.title}
          description={post.description}
          href={`/posts/${post.slug.current}`}
        />
      </div>
    </section>
  );
}
