import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "../components";
import {
  GAMES,
  isDailyGame,
  hasDailyLeaderboard,
  leaderboardId,
  type Game,
} from "../lib/games";
import { getLeaderboard, type LeaderboardEntry } from "../lib/engagement";
import { publicDisplayName, avatarColor } from "../lib/displayName";
import { PAGES } from "../lib/constants";
import TodayStrip from "../components/TodayStrip";
import MiniLeaderboard from "../components/MiniLeaderboard";

export const metadata: Metadata = {
  title: "Games | RADAR",
  description: "Crosswords, quizzes and more from the RADAR desk.",
};

// Redis reads make this page dynamic; 60s ISR keeps it fast while scores
// stay fresh enough for bragging rights.
export const revalidate = 60;

interface GameBoard {
  game: Game;
  streaks: LeaderboardEntry[];
}

// Streak boards only — the "today" top-5 per game renders client-side via
// MiniLeaderboard instead of being fetched here. This page is an async
// Server Component with no player-local timezone to draw on, so a
// server-computed "today" key (resolving to the server's own UTC clock)
// would read the wrong day's board for anyone not in UTC, right around
// their own local midnight. Streaks have no date component, so they're
// unaffected and stay server-rendered. Defensive by design: a Redis
// hiccup renders as an empty streak list, never a 500.
async function fetchBoards(): Promise<GameBoard[]> {
  const dailyGames = GAMES.filter(hasDailyLeaderboard);
  const results = await Promise.allSettled(
    dailyGames.map(async (game) => {
      const streaks = await getLeaderboard(`streak:${leaderboardId(game)}`, 5);
      return { game, streaks };
    })
  );
  return results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { game: dailyGames[i], streaks: [] }
  );
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
              One puzzle a day. Same for everyone — brag, argue, rematch
              tomorrow. Sign in to get on the board.
            </p>
          </div>

          <TodayStrip />

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
                  {game.type === "arcade" && (
                    <span className="rounded-full bg-gdg-yellow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gdg-yellow">
                      Replayable
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
              {boards.map(({ game, streaks }) => (
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
                  <div className="mt-4">
                    <MiniLeaderboard gameSlug={game.slug} />
                  </div>
                  {streaks.length > 0 && (
                    <div className="mt-5 border-t border-edge pt-4">
                      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[2px] text-content-subtle">
                        Streaks 🔥
                      </p>
                      <ol className="space-y-2">
                        {streaks.map((entry, i) => (
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
                            <span
                              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                              style={{ backgroundColor: avatarColor(entry.member) }}
                            >
                              {publicDisplayName(entry.name, entry.member)[0]?.toUpperCase()}
                            </span>
                            <span className="flex-1 truncate text-content-secondary">
                              {publicDisplayName(entry.name, entry.member)}
                            </span>
                            <span className="font-bold text-gdg-yellow">
                              {entry.score}d
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
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
