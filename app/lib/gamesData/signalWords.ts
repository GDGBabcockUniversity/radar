// Answer list for Signal, RADAR's daily word game.
//
// Rules for this list:
// - Every entry is EXACTLY five letters, A–Z, uppercase.
// - Tech/dev-flavored where possible, padded with common words so the
//   rotation doesn't feel like a jargon quiz.
// - The order below is the daily order (dayIndex % length picks the word),
//   hand-shuffled at authoring time so consecutive days aren't thematic or
//   alphabetical neighbors. APPEND new words rather than reordering, or
//   every player's "today" shifts.
//
// Guess validation deliberately accepts any five-letter A–Z string instead
// of shipping a ~13k-word dictionary blob; this list only has to guarantee
// that the ANSWER is always a real word. A curated allowed-guess dictionary
// can be added later without touching game logic.

export const SIGNAL_ANSWERS: string[] = [
  "CACHE", "SMILE", "PROXY", "RIVER", "DEBUG", "MANGO", "STACK", "LIGHT",
  "TOKEN", "HORSE", "QUERY", "BREAD", "ARRAY", "STORM", "PIXEL", "HONEY",
  "LINUX", "DREAM", "REACT", "STONE", "ASYNC", "TIGER", "REGEX", "OCEAN",
  "SHELL", "CANDY", "LOGIC", "EAGLE", "INPUT", "WORLD", "MACRO", "PEACH",
  "PARSE", "NIGHT", "ROBOT", "GRAPE", "CODEC", "HEART", "MODEM", "PLANT",
  "MOUSE", "SUGAR", "LAYER", "ZEBRA", "FRAME", "MUSIC", "PATCH", "EARTH",
  "BUILD", "OLIVE", "MERGE", "BRAIN", "FETCH", "SNAKE", "ROUTE", "SPICE",
  "SCOPE", "WATER", "CLASS", "LEMON", "TUPLE", "DANCE", "FLOAT", "MONTH",
  "CONST", "APPLE", "YIELD", "SOUND", "THROW", "GREEN", "AWAIT", "HOUSE",
  "SLICE", "EARLY", "SPLIT", "BLACK", "TRACE", "JUICE", "EVENT", "WHITE",
  "QUEUE", "QUICK", "GRAPH", "ABOUT", "TABLE", "SPEED", "INDEX", "POINT",
  "FIELD", "FRUIT", "VALUE", "SCORE", "LOCAL", "TODAY", "SCALE", "BOARD",
  "SHARD", "CHESS", "BATCH", "ONION", "SWIFT", "LATER", "UNITY", "BROWN",
  "AZURE", "STUDY", "LOGIN", "LEARN", "ADMIN", "TEACH", "EMAIL", "GRADE",
  "INBOX", "LAGOS", "EMOJI", "NAIRA", "CYBER", "ABUJA", "SONAR", "DELTA",
  "RADAR", "MEDIA", "LASER", "PHONE", "DRONE", "SMART", "AUDIO", "POWER",
  "VIDEO", "SOLAR", "BLOCK", "CABLE", "CHAIN", "FIBER", "CRYPT", "OPTIC",
  "MINER", "WIRED", "VAULT", "GUARD", "ALERT", "PAPER", "ERROR", "DRAFT",
  "FAULT", "WRITE", "CRASH", "STORE", "RESET", "SHARE", "SETUP", "PRINT",
  "AGILE", "EMACS", "SCRUM", "BASIC", "COBOL", "SCALA", "PROTO", "JULIA",
];
