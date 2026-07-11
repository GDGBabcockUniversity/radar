// Regenerates app/lib/gamesData/signalGuessList.ts from the
// an-array-of-english-words devDependency. Run from the repo root:
//
//   node scripts/generate-guess-list.mjs
//
// The output file is committed so the dictionary ships without the
// package ever entering the client bundle.
import { writeFileSync } from "node:fs";
import words from "an-array-of-english-words" with { type: "json" };

const five = [...new Set(words.filter((w) => /^[a-z]{5}$/.test(w)))]
  .map((w) => w.toUpperCase())
  .sort();

const header = `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/generate-guess-list.mjs
// Every five-letter English word Signal accepts as a guess (${five.length} words).
// Answers live separately in signalWords.ts; the game unions the two sets.
`;

writeFileSync(
  new URL("../app/lib/gamesData/signalGuessList.ts", import.meta.url),
  `${header}export const SIGNAL_GUESSES: string[] = ${JSON.stringify(five)};\n`
);

console.log(`Wrote ${five.length} words to app/lib/gamesData/signalGuessList.ts`);
