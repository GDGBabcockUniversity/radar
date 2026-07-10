// Local-first personal stats for the daily games, computed from the same
// per-day localStorage entries the games already save (`signal-2026-07-10`,
// `crosslinks-2026-07-10`, ...). Nothing here talks to the server — like
// NYT's signed-out stats, these live on the device; signing in is what links
// the streak across devices (server-side streaks in engagement.ts).

export interface DistributionBucket {
  label: string;
  count: number;
}

export interface GameStats {
  played: number;
  won: number;
  winPct: number;
  currentStreak: number;
  maxStreak: number;
  distribution?: DistributionBucket[];
}

const DAY_SUFFIX = /^\d{4}-\d{2}-\d{2}$/;

// "YYYY-MM-DD" minus one day, in UTC so the math never crosses a timezone.
function prevDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

/**
 * Scans localStorage for `${prefix}-YYYY-MM-DD` entries and aggregates them.
 * @param prefix       storage key prefix, e.g. "signal"
 * @param todayKey     localDateKey() — passed in so this stays date-pure
 * @param yesterdayKey yesterdayDateKey()
 * @param bucketOf     optional: maps a saved day to a distribution bucket
 *                     label (return null to skip), e.g. guess count for wins
 * @param bucketLabels optional: fixed bucket order, e.g. ["1".."6"]
 */
export function computeDailyGameStats(
  prefix: string,
  todayKey: string,
  yesterdayKey: string,
  bucketOf?: (saved: Record<string, unknown>) => string | null,
  bucketLabels?: string[],
): GameStats {
  let played = 0;
  const winDays: string[] = [];
  const buckets = new Map<string, number>(
    (bucketLabels ?? []).map((l) => [l, 0]),
  );

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`${prefix}-`)) continue;
      const day = key.slice(prefix.length + 1);
      if (!DAY_SUFFIX.test(day)) continue;

      let saved: Record<string, unknown>;
      try {
        saved = JSON.parse(localStorage.getItem(key) ?? "");
      } catch {
        continue;
      }
      const status = saved?.status;
      if (status !== "won" && status !== "lost") continue;

      played++;
      if (status === "won") {
        winDays.push(day);
        const label = bucketOf?.(saved);
        if (label != null) buckets.set(label, (buckets.get(label) ?? 0) + 1);
      }
    }
  } catch {
    // storage unavailable — everything stays zero
  }

  // Streaks: walk the sorted win days counting consecutive-day runs. The
  // current streak only counts if its last win was today or yesterday.
  winDays.sort();
  let maxStreak = 0;
  let run = 0;
  for (let i = 0; i < winDays.length; i++) {
    run = i > 0 && prevDay(winDays[i]) === winDays[i - 1] ? run + 1 : 1;
    if (run > maxStreak) maxStreak = run;
  }
  const lastWin = winDays[winDays.length - 1];
  const currentStreak =
    lastWin === todayKey || lastWin === yesterdayKey ? run : 0;

  return {
    played,
    won: winDays.length,
    winPct: played > 0 ? Math.round((winDays.length / played) * 100) : 0,
    currentStreak,
    maxStreak,
    distribution: bucketLabels
      ? bucketLabels.map((label) => ({ label, count: buckets.get(label) ?? 0 }))
      : undefined,
  };
}
