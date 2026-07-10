// Daily-rotation helpers for RADAR's daily games (Signal, Crosslinks).
// Both are pure functions of an optional Date so game components can call
// them from a mount effect (never during render — the react-hooks/purity
// rule forbids new Date() there) and tests can pin any date.
//
// Local time on purpose: the puzzle rolls over at the *player's* midnight,
// NYT-style, rather than at UTC midnight.

/** Days-since-epoch counter shared by every daily game. */
const DAILY_EPOCH = new Date(2026, 0, 1); // Jan 1 2026, local midnight

/** "YYYY-MM-DD" in the player's local timezone. */
export function localDateKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days since the shared epoch, at local midnight boundaries. */
export function dayIndex(d: Date = new Date()): number {
  const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffMs = localMidnight.getTime() - DAILY_EPOCH.getTime();
  return Math.max(0, Math.round(diffMs / (24 * 60 * 60 * 1000)));
}

/** Yesterday's date key — used for streak continuity checks. */
export function yesterdayDateKey(d: Date = new Date()): string {
  const yesterday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  return localDateKey(yesterday);
}
