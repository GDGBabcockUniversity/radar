export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPost, getRecentPosts } from "@/app/lib/sanity";
import { Header, Footer } from "@/app/components";
import PostHeader from "@/app/components/PostHeader";
import AuthorCard from "@/app/components/AuthorCard";
import PostBody from "@/app/components/PostBody";
import RelatedPosts from "@/app/components/RelatedPosts";
import ViewCounter from "@/app/components/ViewCounter";
import { NewsletterSection } from "@/app/sections";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(body: unknown[]): number {
  if (!body) return 5;

  let wordCount = 0;
  const countWords = (obj: unknown): void => {
    if (typeof obj === "string") {
      wordCount += obj.split(/\s+/).filter(Boolean).length;
    } else if (Array.isArray(obj)) {
      obj.forEach(countWords);
    } else if (obj && typeof obj === "object") {
      Object.values(obj).forEach(countWords);
    }
  };

  countWords(body);
  return Math.max(1, Math.ceil(wordCount / 200));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const isHidden = post.hidden === true;
  const readingTime = calculateReadingTime(post.body);
  const relatedPosts = await getRecentPosts(3);

  // Filter out current post from related
  const filteredRelated = relatedPosts.filter(
    (p: { _id: string }) => p._id !== post._id,
  );

  return (
    <>
      <Header />
      <main className="bg-black min-h-screen">
        <PostHeader
          title={post.title}
          description={post.description}
          mainImage={post.mainImage}
          categories={post.categories}
        />

        <div className="container">
          <AuthorCard
            author={post.author}
            publishedAt={post.publishedAt}
            readingTime={readingTime}
          />

          {!isHidden && <ViewCounter slug={post.slug.current} />}

          {isHidden && (
            <div className="mt-6 rounded-md border border-yellow-500/40 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200">
              This issue is currently hidden from the main site but visible here
              for preview.
            </div>
          )}

          <PostBody body={post.body || []} />
        </div>

        <RelatedPosts posts={filteredRelated} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found | RADAR",
    };
  }

  return {
    title: `${post.title} | RADAR`,
    description:
      post.description || "Read the latest from RADAR by GDG Babcock",
  };
}
