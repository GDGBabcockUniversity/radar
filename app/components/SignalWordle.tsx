"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { track } from "../lib/track";
import { cn } from "../lib/utils";
import { SIGNAL_ANSWERS } from "../lib/gamesData/signalWords";
import { dayIndex, localDateKey, yesterdayDateKey } from "../lib/gamesData/daily";
import { getGame, leaderboardId } from "../lib/games";
import { useAuth } from "./AuthProvider";

// Signal — RADAR's daily five-letter word game. One word per local day for
// everyone; six guesses. Scoring is guess-count based (700 − (g−1)×100),
// never time based — people leave tabs open for hours, and guess count is
// the Wordle skill metric the share-grid culture is built on. A loss emits
// solved:false with NO score, which the engagement pipeline already skips
// for leaderboards.

const GAME_NAME = "Signal"; // working title — change here only
const GAME = getGame("signal")!;
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

type Phase = "loading" | "playing" | "won" | "lost";
type TileState = "correct" | "present" | "absent";

interface SavedDay {
  guesses: string[];
  status: "playing" | "won" | "lost";
}

interface Streak {
  count: number;
  lastWinDate: string;
}

// Classic two-pass evaluation — greens first (consuming letter counts), then
// yellows only while unconsumed copies remain, so duplicate letters behave
// exactly like the original.
function evaluateGuess(guess: string, answer: string): TileState[] {
  const result: TileState[] = new Array(WORD_LENGTH).fill("absent");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
    } else {
      remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] !== "correct" && remaining[guess[i]] > 0) {
      result[i] = "present";
      remaining[guess[i]] -= 1;
    }
  }
  return result;
}

const TILE_EMOJI: Record<TileState, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

function buildShareText(dayKey: string, guesses: string[], answer: string, won: boolean): string {
  const header = `${GAME_NAME} ${dayKey} ${won ? guesses.length : "X"}/${MAX_GUESSES}`;
  const grid = guesses
    .map((g) => evaluateGuess(g, answer).map((s) => TILE_EMOJI[s]).join(""))
    .join("\n");
  return `${header}\n\n${grid}\n\nradar.gdgbabcock.com/games/signal`;
}

// Runtime-injected keyframes, same pattern as PersonalityQuiz's confetti —
// keeps game-only animation out of the global stylesheet.
function ensureAnimationStyles() {
  if (document.getElementById("signal-styles")) return;
  const style = document.createElement("style");
  style.id = "signal-styles";
  style.textContent = `
    @keyframes signal-flip {
      0% { transform: rotateX(0deg); }
      50% { transform: rotateX(90deg); }
      100% { transform: rotateX(0deg); }
    }
    @keyframes signal-shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    @keyframes signal-confetti-fall {
      0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
    .signal-flip { animation: signal-flip 500ms ease; }
    .signal-shake { animation: signal-shake 450ms ease; }
  `;
  document.head.appendChild(style);
}

function burstConfetti() {
  const colors = ["#4285f4", "#34a853", "#f9ab00", "#ea4335"];
  const holder = document.createElement("div");
  holder.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  for (let i = 0; i < 80; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;top:0;left:${Math.random() * 100}%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};animation:signal-confetti-fall ${2.5 + Math.random() * 2}s linear ${Math.random() * 0.8}s forwards;`;
    holder.appendChild(p);
  }
  document.body.appendChild(holder);
  setTimeout(() => holder.remove(), 5000);
}

export default function SignalWordle() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [answer, setAnswer] = useState("");
  const [dayKey, setDayKey] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [streak, setStreak] = useState(0);
  const [copied, setCopied] = useState(false);
  const reported = useRef(false);
  const { isAuthenticated, openSignIn } = useAuth();

  // Mount: everything date/localStorage lives here — never in render, both
  // for SSR-hydration safety (server timezone ≠ player timezone) and the
  // react-hooks/purity lint rule. The init runs in a queued task rather
  // than the synchronous effect body (react-hooks/set-state-in-effect);
  // the pre-init render is the same empty board the server produced.
  useEffect(() => {
    ensureAnimationStyles();
    let cancelled = false;

    const hydrate = () => {
      if (cancelled) return;
      const key = localDateKey();
      const todaysAnswer = SIGNAL_ANSWERS[dayIndex() % SIGNAL_ANSWERS.length];
      setDayKey(key);
      setAnswer(todaysAnswer);

      try {
        const rawStreak = localStorage.getItem("signal-streak");
        if (rawStreak) {
          const s: Streak = JSON.parse(rawStreak);
          // A streak only reads as alive if the last win was today or yesterday.
          setStreak(
            s.lastWinDate === key || s.lastWinDate === yesterdayDateKey()
              ? s.count
              : 0
          );
        }
        const raw = localStorage.getItem(`signal-${key}`);
        if (raw) {
          const saved: SavedDay = JSON.parse(raw);
          setGuesses(saved.guesses);
          if (saved.status !== "playing") {
            // Finished earlier today — restore terminal state WITHOUT
            // re-emitting the score (the emit happened when the game ended).
            reported.current = true;
            setPhase(saved.status);
            return;
          }
        }
      } catch {
        /* corrupted state — start fresh */
      }
      setPhase("playing");
    };

    queueMicrotask(hydrate);
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    (nextGuesses: string[], status: SavedDay["status"], key: string) => {
      try {
        localStorage.setItem(
          `signal-${key}`,
          JSON.stringify({ guesses: nextGuesses, status } satisfies SavedDay)
        );
      } catch {
        /* ignore */
      }
    },
    []
  );

  const recordWinStreak = useCallback((key: string): number => {
    let next = 1;
    try {
      const raw = localStorage.getItem("signal-streak");
      if (raw) {
        const s: Streak = JSON.parse(raw);
        if (s.lastWinDate === yesterdayDateKey()) next = s.count + 1;
      }
      localStorage.setItem(
        "signal-streak",
        JSON.stringify({ count: next, lastWinDate: key } satisfies Streak)
      );
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const submitGuess = useCallback(() => {
    if (phase !== "playing" || revealingRow !== null) return;
    if (current.length !== WORD_LENGTH || !/^[A-Z]{5}$/.test(current)) {
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    const nextGuesses = [...guesses, current];
    const won = current === answer;
    const lost = !won && nextGuesses.length >= MAX_GUESSES;
    const status: SavedDay["status"] = won ? "won" : lost ? "lost" : "playing";

    setGuesses(nextGuesses);
    setCurrent("");
    setRevealingRow(nextGuesses.length - 1);
    persist(nextGuesses, status, dayKey);

    // Emit immediately on the terminal guess (not after the animation) so a
    // refresh mid-reveal can't lose the score; the restored state's
    // reported-ref guard keeps it from ever firing twice.
    if ((won || lost) && !reported.current) {
      reported.current = true;
      if (won) {
        const g = nextGuesses.length;
        track("game.played", {
          gameId: leaderboardId(GAME, dayKey),
          baseId: leaderboardId(GAME),
          streakEligible: true,
          solved: true,
          guesses: g,
          day: dayKey,
          score: 700 - (g - 1) * 100,
        });
        setStreak(recordWinStreak(dayKey));
        if (!isAuthenticated) {
          toast("Sign in to save this score to the leaderboard", {
            action: { label: "Sign in", onClick: openSignIn },
          });
        }
      } else {
        track("game.played", {
          gameId: leaderboardId(GAME, dayKey),
          solved: false,
          guesses: nextGuesses.length,
          day: dayKey,
        });
      }
    }

    // Let the staggered flip play out before switching to the end panel.
    const revealMs = WORD_LENGTH * 200 + 500;
    setTimeout(() => {
      setRevealingRow(null);
      if (won) {
        setPhase("won");
        burstConfetti();
      } else if (lost) {
        setPhase("lost");
      }
    }, revealMs);
  }, [
    phase,
    revealingRow,
    current,
    guesses,
    answer,
    dayKey,
    persist,
    recordWinStreak,
    isAuthenticated,
    openSignIn,
  ]);

  const handleKey = useCallback(
    (key: string) => {
      if (phase !== "playing" || revealingRow !== null) return;
      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACK") {
        setCurrent((c) => c.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
        setCurrent((c) => c + key);
      }
    },
    [phase, revealingRow, current.length, submitGuess]
  );

  // Physical keyboard.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") handleKey("ENTER");
      else if (e.key === "Backspace") handleKey("BACK");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  // Best-known state per keyboard letter (correct beats present beats absent).
  const keyStates = useMemo(() => {
    const rank: Record<TileState, number> = { absent: 0, present: 1, correct: 2 };
    const states: Record<string, TileState> = {};
    if (!answer) return states;
    for (const guess of guesses) {
      const evals = evaluateGuess(guess, answer);
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        const state = evals[i];
        if (!states[letter] || rank[state] > rank[states[letter]]) {
          states[letter] = state;
        }
      }
    }
    return states;
  }, [guesses, answer]);

  const tileClass = (state: TileState | "empty" | "typed"): string => {
    switch (state) {
      case "correct":
        return "bg-gdg-green border-gdg-green text-white";
      case "present":
        return "bg-gdg-yellow border-gdg-yellow text-black";
      case "absent":
        return "bg-surface-input border-surface-input text-content-subtle";
      case "typed":
        return "border-edge-strong text-content";
      default:
        return "border-edge";
    }
  };

  const keyClass = (state?: TileState): string => {
    switch (state) {
      case "correct":
        return "bg-gdg-green text-white";
      case "present":
        return "bg-gdg-yellow text-black";
      case "absent":
        return "bg-surface-input text-content-subtle";
      default:
        return "bg-overlay-strong text-content";
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        buildShareText(dayKey, guesses, answer, phase === "won")
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const finished = phase === "won" || phase === "lost";

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm text-content-muted mb-6">
        Guess the five-letter word in six tries. Same word for everyone —
        new signal at midnight.
        {streak > 0 && (
          <span className="ml-2 font-semibold text-gdg-yellow">
            🔥 {streak}-day streak
          </span>
        )}
      </p>

      {/* Board */}
      <div className="grid grid-rows-6 gap-1.5 mb-6" role="grid" aria-label={`${GAME_NAME} board`}>
        {Array.from({ length: MAX_GUESSES }).map((_, row) => {
          const submitted = row < guesses.length;
          const isCurrentRow = row === guesses.length && phase === "playing";
          const word = submitted ? guesses[row] : isCurrentRow ? current : "";
          const evals = submitted && answer ? evaluateGuess(guesses[row], answer) : null;
          return (
            <div
              key={row}
              className={cn(
                "grid grid-cols-5 gap-1.5",
                isCurrentRow && shakeRow && "signal-shake"
              )}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, col) => {
                const letter = word[col] ?? "";
                const state: TileState | "empty" | "typed" = evals
                  ? evals[col]
                  : letter
                    ? "typed"
                    : "empty";
                return (
                  <div
                    key={col}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md border-2 text-2xl font-bold uppercase select-none",
                      tileClass(state),
                      revealingRow === row && "signal-flip"
                    )}
                    style={
                      revealingRow === row
                        ? { animationDelay: `${col * 200}ms` }
                        : undefined
                    }
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* End panel */}
      {finished && (
        <div className="mb-6 rounded-2xl border border-edge bg-surface-raised dark-card p-5 text-center">
          {phase === "won" ? (
            <p className="text-content font-semibold">
              🎉 Got it in {guesses.length}/{MAX_GUESSES}
              {streak > 1 ? ` — ${streak} days running!` : "!"}
            </p>
          ) : (
            <p className="text-content font-semibold">
              The word was <span className="text-primary">{answer}</span>. A
              new signal arrives tomorrow.
            </p>
          )}
          <button
            onClick={share}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-edge bg-overlay px-5 py-2.5 text-sm font-semibold text-content hover:border-primary hover:text-primary transition-colors"
          >
            {copied ? "Copied!" : "Share result"}
          </button>
        </div>
      )}

      {/* Keyboard */}
      <div className="space-y-1.5" aria-label="On-screen keyboard">
        {KEYBOARD_ROWS.map((rowKeys, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {rowKeys.map((k) => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                disabled={phase !== "playing"}
                aria-label={k === "BACK" ? "Backspace" : k}
                className={cn(
                  "h-12 rounded-md text-sm font-bold uppercase transition-colors disabled:opacity-50",
                  k === "ENTER" || k === "BACK" ? "px-3 text-xs" : "flex-1 max-w-9",
                  keyClass(keyStates[k])
                )}
              >
                {k === "BACK" ? "⌫" : k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
