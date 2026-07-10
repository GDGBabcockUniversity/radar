// Boards for Crosslinks, RADAR's daily grouping game (Connections-style).
//
// Authoring rules:
// - 16 UNIQUE words per board, 4 groups of 4.
// - Difficulty tiers follow the NYT convention: yellow easiest → purple
//   hardest (usually a wordplay/"___ X" group).
// - Deliberate cross-group misdirection is the point: several words should
//   plausibly fit two groups (e.g. PATCH reads as both an HTTP method and a
//   git concept) so solving order matters.
// - Daily rotation is CROSSLINKS_BOARDS[dayIndex % length] — append new
//   boards rather than reordering existing ones.

export type CrosslinksDifficulty = "yellow" | "green" | "blue" | "purple";

export interface CrosslinksGroup {
  title: string;
  words: [string, string, string, string];
  difficulty: CrosslinksDifficulty;
}

export interface CrosslinksBoard {
  id: string;
  groups: [CrosslinksGroup, CrosslinksGroup, CrosslinksGroup, CrosslinksGroup];
}

export const CROSSLINKS_BOARDS: CrosslinksBoard[] = [
  {
    id: "board-1",
    groups: [
      {
        title: "HTTP methods",
        words: ["POST", "PUT", "PATCH", "DELETE"],
        difficulty: "yellow",
      },
      {
        title: "Git commands",
        words: ["CLONE", "COMMIT", "REBASE", "STASH"],
        difficulty: "green",
      },
      {
        title: "SQL keywords",
        words: ["SELECT", "WHERE", "JOIN", "GROUP"],
        difficulty: "blue",
      },
      {
        title: "___BOARD",
        words: ["KEY", "DASH", "LEADER", "MOTHER"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-2",
    groups: [
      {
        title: "JavaScript array methods",
        words: ["MAP", "FILTER", "REDUCE", "PUSH"],
        difficulty: "yellow",
      },
      {
        title: "Terminal commands",
        words: ["GREP", "CHMOD", "CURL", "ECHO"],
        difficulty: "green",
      },
      {
        title: "Databases",
        words: ["MONGO", "REDIS", "MYSQL", "SQLITE"],
        difficulty: "blue",
      },
      {
        title: "Google ___",
        words: ["DRIVE", "MEET", "PLAY", "LENS"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-3",
    groups: [
      {
        title: "Tech giants",
        words: ["APPLE", "META", "AMAZON", "GOOGLE"],
        difficulty: "yellow",
      },
      {
        title: "Programming languages",
        words: ["SWIFT", "RUST", "GO", "KOTLIN"],
        difficulty: "green",
      },
      {
        title: "Keyboard keys",
        words: ["SHIFT", "TAB", "ESCAPE", "ENTER"],
        difficulty: "blue",
      },
      {
        title: "___ MODE",
        words: ["DARK", "GOD", "BEAST", "GUEST"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-4",
    groups: [
      {
        title: "Seen at a GDG event",
        words: ["SWAG", "DEMO", "PITCH", "BADGE"],
        difficulty: "yellow",
      },
      {
        title: "Data structures",
        words: ["STACK", "QUEUE", "HEAP", "TRIE"],
        difficulty: "green",
      },
      {
        title: "Browsers",
        words: ["CHROME", "SAFARI", "OPERA", "EDGE"],
        difficulty: "blue",
      },
      {
        title: "___FLOW",
        words: ["WORK", "CASH", "OVER", "AIR"],
        difficulty: "purple",
      },
    ],
  },
];
