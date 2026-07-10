import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "../components";
import { GAMES, isDailyGame, leaderboardId, type Game } from "../lib/games";
import { getLeaderboard, type LeaderboardEntry } from "../lib/engagement";
import { publicDisplayName } from "../lib/displayName";
import { localDateKey } from "../lib/gamesData/daily";
import { PAGES } from "../lib/constants";

export const metadata: Metadata = {
  title: "Games | RADAR",
  description: "Crosswords, quizzes and more from the RADAR desk.",
};

// Redis reads make this page dynamic; 60s ISR keeps it fast while scores
// stay fresh enough for bragging rights.
export const revalidate = 60;

interface GameBoard {
  game: Game;
  top: LeaderboardEntry[];
}

// One top-5 board per daily game only — a permanent leaderboard doesn't mean
// anything for a one-off/seasonal puzzle, so non-daily games don't get one.
// Defensive by design: a Redis hiccup renders as empty boards, never a 500.
async function fetchBoards(): Promise<GameBoard[]> {
  const dailyGames = GAMES.filter(isDailyGame);
  const today = localDateKey();
  const results = await Promise.allSettled(
    dailyGames.map(async (game) => ({
      game,
      top: await getLeaderboard(leaderboardId(game, today), 5),
    }))
  );
  const boards = results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { game: dailyGames[i], top: [] }
  );
  // Lead the section with boards that have life in them.
  return boards.sort((a, b) => Number(b.top.length > 0) - Number(a.top.length > 0));
}

export default async function GamesPage() {
  const boards = await fetchBoards();
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
                className="group flex flex-col rounded-2xl border border-edge bg-surface-raised dark-card p-6 hover:border-edge-strong transition-colors"
              >
                <span className="mb-4 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[2px] text-content-subtle">
                    {game.type}
                  </span>
                  {isDailyGame(game) && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Daily
                    </span>
                  )}
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

          {/* High scores — live top-5 per game */}
          <div className="mt-16">
            <h3 className="text-sm font-bold uppercase tracking-[2px] text-content-muted mb-6">
              High Scores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map(({ game, top }) => (
                <div
                  key={game.slug}
                  className="rounded-2xl border border-edge bg-surface-raised dark-card p-6"
                >
                  <Link
                    href={`${PAGES.games}/${game.slug}`}
                    className="text-base font-bold text-content hover:text-primary transition-colors"
                  >
                    {game.title}
                  </Link>
                  {top.length === 0 ? (
                    <p className="mt-4 text-sm text-content-subtle">
                      No scores yet — be the first.
                    </p>
                  ) : (
                    <ol className="mt-4 space-y-2.5">
                      {top.map((entry, i) => (
                        <li
                          key={entry.member}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span
                            className={
                              i === 0
                                ? "font-mono text-xs font-bold text-gdg-yellow"
                                : "font-mono text-xs text-content-subtle"
                            }
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 truncate text-content-secondary">
                            {publicDisplayName(entry.name, entry.member)}
                          </span>
                          <span className="font-bold text-primary">
                            {entry.score}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
