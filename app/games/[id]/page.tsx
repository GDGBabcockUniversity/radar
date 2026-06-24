import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, CrosswordPuzzle, PersonalityQuiz } from "../../components";
import { getGame } from "../../lib/games";
import { PAGES } from "../../lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const game = getGame(id);
  return {
    title: game ? `${game.title} | RADAR Games` : "Game | RADAR",
    description: game?.blurb,
  };
}

export default async function GamePlayPage({ params }: PageProps) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  return (
    <main className="min-h-screen bg-surface">
      <Header />

      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <Link
            href={PAGES.games}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-content-muted hover:text-content transition-colors mb-6"
          >
            ← All games
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-content tracking-tight mb-8">
            {game.title}
          </h1>

          {game.type === "crossword" ? (
            <CrosswordPuzzle puzzleId={game.refId} />
          ) : (
            <PersonalityQuiz quizId={game.refId} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
