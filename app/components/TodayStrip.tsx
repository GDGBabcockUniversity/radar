"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGame } from "../lib/games";
import { localDateKey } from "../lib/gamesData/daily";
import { PAGES } from "../lib/constants";

const DAILY_SLUGS = ["signal", "crosslinks", "cryptic"] as const;

function isDailyDone(slug: string, day: string): boolean {
  try {
    const raw = localStorage.getItem(`${slug}-${day}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.status === "won" || parsed?.status === "lost";
  } catch {
    return false;
  }
}

function rapidFirePlayed(day: string): boolean {
  try {
    return localStorage.getItem(`rapidfire-best-${day}`) !== null;
  } catch {
    return false;
  }
}

// Pure localStorage, so it renders nothing meaningful until hydrated —
// avoids an SSR/client mismatch on state that only exists in the browser.
export default function TodayStrip() {
  const [done, setDone] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const day = localDateKey();
      const next: Record<string, boolean> = {};
      for (const slug of DAILY_SLUGS) next[slug] = isDailyDone(slug, day);
      next["rapid-fire"] = rapidFirePlayed(day);
      setDone(next);
    });
  }, []);

  if (!done) return null;

  const dailyDoneCount = DAILY_SLUGS.filter((slug) => done[slug]).length;
  const rows = [...DAILY_SLUGS, "rapid-fire"] as const;

  return (
    <div className="mb-10 rounded-2xl border border-edge bg-surface-raised dark-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[2px] text-content-subtle">
          Today
        </p>
        <p className="text-xs font-semibold text-content-muted">
          {dailyDoneCount} of {DAILY_SLUGS.length} dailies done
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rows.map((slug) => {
          const game = getGame(slug);
          if (!game) return null;
          const complete = done[slug];
          return (
            <Link
              key={slug}
              href={`${PAGES.games}/${slug}`}
              className="flex items-center gap-2 rounded-xl border border-edge px-3 py-2.5 text-sm font-medium text-content hover:border-edge-strong transition-colors"
            >
              <span
                className={
                  complete
                    ? "flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gdg-green text-[10px] text-white"
                    : "h-4 w-4 shrink-0 rounded-full border border-edge-strong"
                }
              >
                {complete ? "✓" : ""}
              </span>
              <span className="truncate">{game.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
