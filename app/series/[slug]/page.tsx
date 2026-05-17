export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSeriesPost } from "@/app/lib/sanity";
import { Header, Footer } from "@/app/components";
import AuthorCard from "@/app/components/AuthorCard";
import PostBody from "@/app/components/PostBody";
import { NewsletterSection } from "@/app/sections";
import Link from "next/link";
import { PAGES } from "@/app/lib/constants";

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

// Helper to extract YouTube video ID
function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : null;
}

export default async function SeriesPostPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const post = await getSeriesPost(slug);

  if (!post) {
    notFound();
  }

  const ytId = post.youtubeUrl ? getYouTubeId(post.youtubeUrl) : null;

  return (
    <>
      <Header />
      <main className="bg-black min-h-screen pt-16">
        <div className="container max-w-4xl mx-auto py-12">
          
          {/* Breadcrumb / Group Link */}
          {post.group && (
            <Link 
              href={PAGES.series} 
              className="inline-flex items-center text-sm font-medium text-primary hover:text-white transition-colors mb-6"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {post.group.title}
            </Link>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            {post.title}
          </h1>

          {/* YouTube Embed */}
          {ytId && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-12 shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              {post.body ? (
                <PostBody body={post.body} />
              ) : (
                <p className="text-gray-400 italic">No write-up provided for this episode.</p>
              )}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24">
                {post.author && (
                  <AuthorCard
                    author={post.author}
                    publishedAt={post.publishedAt}
                    readingTime={1} // You could calculate reading time here if desired
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SeriesPageProps) {
  const { slug } = await params;
  const post = await getSeriesPost(slug);

  if (!post) {
    return {
      title: "Series Not Found | RADAR",
    };
  }

  return {
    title: `${post.title} | RADAR`,
    description: post.group ? `An episode in ${post.group.title}` : "Watch this series episode on RADAR by GDG Babcock",
  };
}
