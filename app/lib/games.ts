// Registry of standalone-playable RADAR games. These are the same interactive
// blocks that can be embedded in articles (crossword/quiz), surfaced here as
// their own NYT-style destination. Later this could become a Sanity `game`
// document; a static registry is enough for the hub skeleton.

export interface Game {
  slug: string; // route: /games/[slug]
  title: string;
  type: "crossword" | "quiz" | "wordle" | "connections" | "cryptic";
  refId: string; // puzzleId / quizId passed to the component
  blurb: string;
}

/** Daily games rotate their content at the player's local midnight. */
export function isDailyGame(game: Game): boolean {
  return (
    game.type === "wordle" ||
    game.type === "connections" ||
    game.type === "cryptic"
  );
}

export const GAMES: Game[] = [
  {
    slug: "signal",
    title: "Signal",
    type: "wordle",
    refId: "signal",
    blurb:
      "The daily five-letter word from the RADAR desk. Six guesses, one signal.",
  },
  {
    slug: "crosslinks",
    title: "Crosslinks",
    type: "connections",
    refId: "crosslinks",
    blurb:
      "Sixteen terms, four hidden groups, four mistakes. Find the connections.",
  },
  {
    slug: "cryptic",
    title: "Cryptic",
    type: "cryptic",
    refId: "cryptic",
    blurb: "One cryptic clue a day. Crack the wordplay, beat the clock.",
  },
  {
    slug: "new-year-new-lies",
    title: "New Year, New Lies",
    type: "crossword",
    refId: "new-year-new-lies",
    blurb: "A themed crossword to start the year. Fill the grid, beat the clock.",
  },
  {
    slug: "valentines-2026",
    title: "Valentine's Match",
    type: "quiz",
    refId: "valentines-2026",
    blurb: "Seven questions to find your RADAR Valentine personality.",
  },
  {
    slug: "track-finder-2026",
    title: "Find Your Track",
    type: "quiz",
    refId: "track-finder-2026",
    blurb: "Which tech path fits you? A quick nine-question finder.",
  },
];

// Leaderboard key — matches the gameId emitted by the components. Daily
// games get a per-day bucket (reset at local midnight, same boundary the
// content rotation already uses) so "today's" leaderboard actually means
// today; one-off/seasonal games keep a single permanent bucket.
export function leaderboardId(game: Game, date?: string): string {
  const base = `${game.type}:${game.refId}`;
  return isDailyGame(game) && date ? `${base}:${date}` : base;
}

export function getGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}
