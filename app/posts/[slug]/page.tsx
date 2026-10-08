export const revalidate = 60;

import { notFound } from "next/navigation";
import { getPost, getRecentPosts } from "@/app/lib/sanity";
import { Header, Footer } from "@/app/components";
import PostHeader from "@/app/components/PostHeader";
import AuthorCard from "@/app/components/AuthorCard";
import PostBody from "@/app/components/PostBody";
import TableOfContents from "@/app/components/TableOfContents";
import RelatedPosts from "@/app/components/RelatedPosts";
import ViewCounter from "@/app/components/ViewCounter";
import ReadingTracker from "@/app/components/ReadingTracker";
import PostSignals from "@/app/components/PostSignals";
import SignalCount from "@/app/components/SignalCount";
import ShareButtons from "@/app/components/ShareButtons";
import { PAGES } from "@/app/lib/constants";
// import { NewsletterSection } from "@/app/sections";

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
  const relatedPosts = await getRecentPosts();
  const path = PAGES.post ? PAGES.post(slug) : `/posts/${slug}`;

  // Filter out current post from related
  const filteredRelated = relatedPosts.filter(
    (p: { _id: string }) => p._id !== post._id,
  );

  return (
    <>
      <Header />
      <ReadingTracker slug={`/posts/${slug}`} />
      <main className="bg-surface min-h-screen mt-16 md:mt-0">
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

          {!isHidden && (
            <div className="flex items-center gap-3 mt-8">
              <ViewCounter slug={post.slug.current} />
              <SignalCount slug={post.slug.current} />
            </div>
          )}

          {isHidden && (
            <div className="mt-6 rounded-md border border-yellow-500/40 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200">
              This issue is currently hidden from the main site but visible here
              for preview.
            </div>
          )}

          {/* Article body + sidebar TOC */}
          <div className="post-layout">
            <div className="post-content">
              <PostBody body={post.body || []} />
            </div>
            <aside className="post-sidebar">
              <TableOfContents body={post.body || []} />
            </aside>
          </div>

          {/* Share + Signals section — below the article, above the footer */}
          <div className="post-bottom-section">
            {/* Share row */}
            <div className="post-share-row">
              <ShareButtons path={path} title={post.title} />
            </div>

            {/* Signals (comments) */}
            <PostSignals slug={post.slug.current} />
          </div>
        </div>

        <RelatedPosts posts={filteredRelated} />
        {/* <NewsletterSection /> */}
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
