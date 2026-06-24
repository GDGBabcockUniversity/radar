import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "../components";
import { GAMES } from "../lib/games";
import { PAGES } from "../lib/constants";

export const metadata: Metadata = {
  title: "Games | RADAR",
  description: "Crosswords, quizzes and more from the RADAR desk.",
};

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Header />

      <section className="py-16 md:py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[3px] text-primary mb-4">
              RADAR Games
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-content tracking-tight mb-4">
              Play
            </h1>
            <p className="text-content-muted max-w-xl">
              Crosswords, quizzes and other diversions from the RADAR desk. Sign
              in to save your scores and streaks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map((game) => (
              <Link
                key={game.slug}
                href={`${PAGES.games}/${game.slug}`}
                className="group flex flex-col rounded-2xl border border-edge bg-surface-raised p-6 hover:border-edge-strong transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-content-subtle mb-4">
                  {game.type}
                </span>
                <h2 className="text-xl font-bold text-content leading-snug mb-2 group-hover:text-primary transition-colors">
                  {game.title}
                </h2>
                <p className="text-sm text-content-muted leading-relaxed flex-1">
                  {game.blurb}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Play →
                </span>
              </Link>
            ))}
          </div>

          {/* High scores — placeholder until scores accumulate */}
          <div className="mt-16 rounded-2xl border border-edge bg-surface-raised p-8 text-center">
            <h3 className="text-sm font-bold uppercase tracking-[2px] text-content-muted mb-2">
              High Scores
            </h3>
            <p className="text-content-subtle text-sm">
              Leaderboards light up here once members start playing.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
