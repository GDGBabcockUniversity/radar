import { ArticleCard } from "../components";

const pastEditions = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=450&fit=crop",
    editionNumber: "RADAR 001",
    date: "December 26, 2025",
    title: "The Launch Edition",
    description:
      "Welcome to RADAR. In this inaugural edition, we look back at a transformative year for GDG Babcock, spotlight campus innovators, and...",
    href: "/editions/001",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=450&fit=crop",
    editionNumber: "RADAR 000",
    date: "November 28, 2025",
    title: "The Beta Test",
    description: "A look back at the semester's beginning.",
    href: "/editions/000",
  },
];

export default function PastEditionsSection() {
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
          {pastEditions.map((edition) => (
            <ArticleCard
              key={edition.id}
              variant="default"
              image={edition.image}
              editionNumber={edition.editionNumber}
              date={edition.date}
              title={edition.title}
              description={edition.description}
              href={edition.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
