import { getGame, type Game } from "./games";

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

// The end-of-game funnel: point the player at whichever daily puzzle they
// haven't finished yet today, or Rapid Fire once all three are done. Keeps
// the loop "one more thing to do" instead of a dead end.
export function nextFunnelGame(day: string): Game {
  for (const slug of DAILY_SLUGS) {
    if (!isDailyDone(slug, day)) return getGame(slug)!;
  }
  return getGame("rapid-fire")!;
}
