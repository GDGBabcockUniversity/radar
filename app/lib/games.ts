// Registry of standalone-playable RADAR games. These are the same interactive
// blocks that can be embedded in articles (crossword/quiz), surfaced here as
// their own NYT-style destination. Later this could become a Sanity `game`
// document; a static registry is enough for the hub skeleton.

export interface Game {
  slug: string; // route: /games/[slug]
  title: string;
  type: "crossword" | "quiz";
  refId: string; // puzzleId / quizId passed to the component
  blurb: string;
}

export const GAMES: Game[] = [
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

// Leaderboard key — matches the gameId emitted by the components.
export function leaderboardId(game: Game): string {
  return `${game.type}:${game.refId}`;
}

export function getGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}
