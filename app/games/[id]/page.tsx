import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Header,
  Footer,
  CrosswordPuzzle,
  PersonalityQuiz,
  SignalWordle,
  CrosslinksGame,
  CrypticDaily,
  RapidFireGame,
} from "../../components";
import { getGame, type Game } from "../../lib/games";
import { PAGES } from "../../lib/constants";

// Exhaustive game-type → component mapping; the `never` default makes
// forgetting a case a compile error when the Game type union grows.
function renderGame(game: Game) {
  switch (game.type) {
    case "crossword":
      return <CrosswordPuzzle puzzleId={game.refId} />;
    case "quiz":
      return <PersonalityQuiz quizId={game.refId} />;
    case "wordle":
      return <SignalWordle />;
    case "connections":
      return <CrosslinksGame />;
    case "cryptic":
      return <CrypticDaily />;
    case "arcade":
      return <RapidFireGame />;
    default: {
      const exhausted: never = game.type;
      return exhausted;
    }
  }
}

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

          {renderGame(game)}
        </div>
      </section>

      <Footer />
    </main>
  );
}
