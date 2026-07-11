"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MiniLeaderboard from "./MiniLeaderboard";
import NextPuzzleCountdown from "./NextPuzzleCountdown";
import { getGame, isDailyGame, type Game } from "../lib/games";
import { nextFunnelGame } from "../lib/nextGameFunnel";
import { PAGES } from "../lib/constants";

// The shared tail of every game's end panel: today's top five, a countdown
// to the next daily drop, and a link to whichever daily puzzle is still
// unplayed (or Rapid Fire, once all three are done) — the "one more thing"
// that turns a finish into a loop instead of a dead end.
export default function PostGameLoop({
  gameSlug,
  day,
}: {
  gameSlug: string;
  day: string;
}) {
  const [next, setNext] = useState<Game | null>(null);

  useEffect(() => {
    setNext(nextFunnelGame(day));
  }, [day]);

  const game = getGame(gameSlug);
  if (!game) return null;

  return (
    <div className="mt-5 space-y-4 border-t border-edge pt-5 text-left">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-content-subtle">
          Today&apos;s top five
        </p>
        <MiniLeaderboard gameSlug={gameSlug} />
      </div>
      {isDailyGame(game) && (
        <div className="text-center">
          <NextPuzzleCountdown gameName={game.title} />
        </div>
      )}
      {next && next.slug !== gameSlug && (
        <Link
          href={`${PAGES.games}/${next.slug}`}
          className="block text-center text-sm font-semibold text-primary hover:underline"
        >
          {next.slug === "rapid-fire"
            ? "One more? Rapid Fire is endless →"
            : `Play ${next.title} while you wait →`}
        </Link>
      )}
    </div>
  );
}
