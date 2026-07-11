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
  {
    id: "board-5",
    groups: [
      {
        title: "Planets",
        words: ["VENUS", "MARS", "SATURN", "NEPTUNE"],
        difficulty: "yellow",
      },
      {
        title: "Chemical elements",
        words: ["MERCURY", "IRON", "NEON", "CARBON"],
        difficulty: "green",
      },
      {
        title: "Nigerian states",
        words: ["DELTA", "RIVERS", "PLATEAU", "OSUN"],
        difficulty: "blue",
      },
      {
        title: "___ BAR",
        words: ["SPACE", "SAND", "CROW", "HANDLE"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-6",
    groups: [
      {
        title: "Afrobeats artists",
        words: ["WIZKID", "DAVIDO", "REMA", "ASAKE"],
        difficulty: "yellow",
      },
      {
        title: "Nigerian dishes",
        words: ["JOLLOF", "SUYA", "AKARA", "EGUSI"],
        difficulty: "green",
      },
      {
        title: "Naija slang",
        words: ["WAHALA", "JAPA", "SAPA", "ABEG"],
        difficulty: "blue",
      },
      {
        title: "___ BOY",
        words: ["BURNA", "YAHOO", "HOME", "COW"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-7",
    groups: [
      {
        title: "Places on campus",
        words: ["HOSTEL", "CHAPEL", "LIBRARY", "CAFE"],
        difficulty: "yellow",
      },
      {
        title: "Ways to be assessed",
        words: ["QUIZ", "TEST", "PROJECT", "DEFENSE"],
        difficulty: "green",
      },
      {
        title: "Things students borrow",
        words: ["NOTES", "CHARGER", "PEN", "UMBRELLA"],
        difficulty: "blue",
      },
      {
        title: "___ CLASS",
        words: ["NIGHT", "FIRST", "WORLD", "MASTER"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-8",
    groups: [
      {
        title: "React vocabulary",
        words: ["PROPS", "STATE", "HOOK", "RENDER"],
        difficulty: "yellow",
      },
      {
        title: "Python keywords",
        words: ["IMPORT", "LAMBDA", "YIELD", "CLASS"],
        difficulty: "green",
      },
      {
        title: "Sorting algorithms",
        words: ["BUBBLE", "MERGE", "QUICK", "SHELL"],
        difficulty: "blue",
      },
      {
        title: "___ FUNCTION",
        words: ["ARROW", "PURE", "HASH", "STEP"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-9",
    groups: [
      {
        title: "Nigerian cities",
        words: ["LAGOS", "KANO", "IBADAN", "ENUGU"],
        difficulty: "yellow",
      },
      {
        title: "African countries",
        words: ["GHANA", "KENYA", "EGYPT", "MALI"],
        difficulty: "green",
      },
      {
        title: "African rivers",
        words: ["NIGER", "NILE", "CONGO", "ZAMBEZI"],
        difficulty: "blue",
      },
      {
        title: "African currencies",
        words: ["NAIRA", "CEDI", "RAND", "SHILLING"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-10",
    groups: [
      {
        title: "Music genres",
        words: ["GOSPEL", "JAZZ", "HIGHLIFE", "FUJI"],
        difficulty: "yellow",
      },
      {
        title: "Instruments",
        words: ["DRUM", "SAX", "PIANO", "FLUTE"],
        difficulty: "green",
      },
      {
        title: "Parts of a studio",
        words: ["MIC", "BOOTH", "MIXER", "CONSOLE"],
        difficulty: "blue",
      },
      {
        title: "___ NOTE",
        words: ["VOICE", "KEY", "HIGH", "STICKY"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-11",
    groups: [
      {
        title: "Bones",
        words: ["SKULL", "FEMUR", "RIB", "SPINE"],
        difficulty: "yellow",
      },
      {
        title: "Organs",
        words: ["HEART", "LIVER", "KIDNEY", "LUNG"],
        difficulty: "green",
      },
      {
        title: "SI units",
        words: ["VOLT", "WATT", "JOULE", "NEWTON"],
        difficulty: "blue",
      },
      {
        title: "Scientists",
        words: ["TESLA", "DARWIN", "CURIE", "FARADAY"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-12",
    groups: [
      {
        title: "Premier League clubs",
        words: ["ARSENAL", "CHELSEA", "LIVERPOOL", "SPURS"],
        difficulty: "yellow",
      },
      {
        title: "Football positions",
        words: ["KEEPER", "WINGER", "STRIKER", "FULLBACK"],
        difficulty: "green",
      },
      {
        title: "Super Eagles legends",
        words: ["OKOCHA", "KANU", "YOBO", "OLISEH"],
        difficulty: "blue",
      },
      {
        title: "___ CARD",
        words: ["RED", "YELLOW", "WILD", "GRAPHICS"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-13",
    groups: [
      {
        title: "HTML tags",
        words: ["DIV", "SPAN", "FORM", "TABLE"],
        difficulty: "yellow",
      },
      {
        title: "CSS properties",
        words: ["MARGIN", "PADDING", "DISPLAY", "POSITION"],
        difficulty: "green",
      },
      {
        title: "Network protocols",
        words: ["TCP", "DNS", "SSH", "FTP"],
        difficulty: "blue",
      },
      {
        title: "___ ENGINE",
        words: ["SEARCH", "GAME", "DIESEL", "RENDER"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-14",
    groups: [
      {
        title: "Movie genres",
        words: ["COMEDY", "HORROR", "THRILLER", "EPIC"],
        difficulty: "yellow",
      },
      {
        title: "Streaming platforms",
        words: ["NETFLIX", "SHOWMAX", "PRIME", "HULU"],
        difficulty: "green",
      },
      {
        title: "Games night classics",
        words: ["WHOT", "LUDO", "CHESS", "SCRABBLE"],
        difficulty: "blue",
      },
      {
        title: "___ SHOW",
        words: ["TALK", "SIDE", "ROAD", "SLIDE"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-15",
    groups: [
      {
        title: "Shapes",
        words: ["CIRCLE", "SQUARE", "PRISM", "CONE"],
        difficulty: "yellow",
      },
      {
        title: "Graph theory",
        words: ["NODE", "EDGE", "PATH", "CYCLE"],
        difficulty: "green",
      },
      {
        title: "Statistics",
        words: ["MEAN", "MODE", "MEDIAN", "RANGE"],
        difficulty: "blue",
      },
      {
        title: "Types of numbers",
        words: ["WHOLE", "REAL", "COMPLEX", "NATURAL"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "board-16",
    groups: [
      {
        title: "Buttery breakfast",
        words: ["BREAD", "EGG", "TEA", "NOODLES"],
        difficulty: "yellow",
      },
      {
        title: "Swallow foods",
        words: ["EBA", "FUFU", "AMALA", "SEMO"],
        difficulty: "green",
      },
      {
        title: "Birds",
        words: ["DODO", "EAGLE", "PARROT", "FALCON"],
        difficulty: "blue",
      },
      {
        title: "___ SOUP",
        words: ["PEPPER", "OKRO", "WHITE", "BITTER"],
        difficulty: "purple",
      },
    ],
  },
];
