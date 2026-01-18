import { ArticleCard } from "../components";

export default function FeaturedSection() {
  return (
    <section
      id="featured"
      className="pb-16"
      style={{
        background:
          "radial-gradient(ellipse at center top, #1a2744 0%, #0a0a0a 70%)",
      }}
    >
      <div className="container">
        <ArticleCard
          variant="featured"
          image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop"
          tag="Featured"
          tagColor="blue"
          date="December 20, 2025"
          title="The Launch Edition"
          description="Welcome to RADAR. In this inaugural edition, we look back at a transformative year for GDG Babcock, spotlight campus innovators, and preview what's next."
          href="/editions/launch"
        />
      </div>
    </section>
  );
}
