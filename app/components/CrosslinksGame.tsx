"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { track } from "../lib/track";
import { cn } from "../lib/utils";
import {
  CROSSLINKS_BOARDS,
  type CrosslinksBoard,
  type CrosslinksDifficulty,
} from "../lib/gamesData/crosslinksBoards";
import { dayIndex, localDateKey, yesterdayDateKey } from "../lib/gamesData/daily";
import { getGame, leaderboardId } from "../lib/games";
import { useAuth } from "./AuthProvider";

// Crosslinks — RADAR's daily grouping game (Connections-style). Sixteen
// terms, four hidden groups, four mistakes. Score = solvedGroups×100 +
// (4−mistakes)×50, emitted on BOTH win and loss — partial credit is
// meaningful in this format and gives new players a foothold on the
// leaderboard (600 ceiling, aligned with Signal's).

const GAME_NAME = "Crosslinks"; // working title — change here only
const GAME = getGame("crosslinks")!;
const MAX_MISTAKES = 4;

const DIFFICULTY_COLOR: Record<CrosslinksDifficulty, string> = {
  yellow: "#f9ab00",
  green: "#34a853",
  blue: "#4285f4",
  purple: "#a855f7",
};
const DIFFICULTY_EMOJI: Record<CrosslinksDifficulty, string> = {
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  purple: "🟪",
};
const DIFFICULTY_RANK: Record<CrosslinksDifficulty, number> = {
  yellow: 0,
  green: 1,
  blue: 2,
  purple: 3,
};
// Yellow tiles need dark text; the rest read fine in white.
const DIFFICULTY_TEXT: Record<CrosslinksDifficulty, string> = {
  yellow: "#111111",
  green: "#ffffff",
  blue: "#ffffff",
  purple: "#ffffff",
};

type Phase = "loading" | "playing" | "won" | "lost";

interface SavedDay {
  boardId: string;
  solvedGroups: number[];
  mistakes: number;
  guessHistory: CrosslinksDifficulty[][];
  pastGuesses: string[];
  status: "playing" | "won" | "lost";
}

interface Streak {
  count: number;
  lastWinDate: string;
}

function shuffled<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function ensureAnimationStyles() {
  if (document.getElementById("crosslinks-styles")) return;
  const style = document.createElement("style");
  style.id = "crosslinks-styles";
  style.textContent = `
    @keyframes crosslinks-confetti-fall {
      0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
    @keyframes crosslinks-pop {
      0% { transform: scale(0.94); opacity: 0.6; }
      100% { transform: scale(1); opacity: 1; }
    }
    .crosslinks-pop { animation: crosslinks-pop 250ms ease; }
  `;
  document.head.appendChild(style);
}

function burstConfetti() {
  const colors = Object.values(DIFFICULTY_COLOR);
  const holder = document.createElement("div");
  holder.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  for (let i = 0; i < 80; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;top:0;left:${Math.random() * 100}%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};animation:crosslinks-confetti-fall ${2.5 + Math.random() * 2}s linear ${Math.random() * 0.8}s forwards;`;
    holder.appendChild(p);
  }
  document.body.appendChild(holder);
  setTimeout(() => holder.remove(), 5000);
}

export default function CrosslinksGame() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [board, setBoard] = useState<CrosslinksBoard | null>(null);
  const [dayKey, setDayKey] = useState("");
  const [tiles, setTiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [guessHistory, setGuessHistory] = useState<CrosslinksDifficulty[][]>([]);
  const [pastGuesses, setPastGuesses] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [copied, setCopied] = useState(false);
  const reported = useRef(false);
  const { isAuthenticated, openSignIn } = useAuth();

  // Mount hydration — deferred out of the synchronous effect body (same
  // pattern and reasoning as SignalWordle): dates/localStorage never run
  // during render, and the pre-init markup matches the server's.
  useEffect(() => {
    ensureAnimationStyles();
    let cancelled = false;

    const hydrate = () => {
      if (cancelled) return;
      const key = localDateKey();
      const todaysBoard =
        CROSSLINKS_BOARDS[dayIndex() % CROSSLINKS_BOARDS.length];
      setDayKey(key);
      setBoard(todaysBoard);

      let restored: SavedDay | null = null;
      try {
        const raw = localStorage.getItem(`crosslinks-${key}`);
        if (raw) {
          const saved: SavedDay = JSON.parse(raw);
          if (saved.boardId === todaysBoard.id) restored = saved;
        }
        const rawStreak = localStorage.getItem("crosslinks-streak");
        if (rawStreak) {
          const s: Streak = JSON.parse(rawStreak);
          setStreak(
            s.lastWinDate === key || s.lastWinDate === yesterdayDateKey()
              ? s.count
              : 0
          );
        }
      } catch {
        /* corrupted state — start fresh */
      }

      if (restored) {
        setSolvedGroups(restored.solvedGroups);
        setMistakes(restored.mistakes);
        setGuessHistory(restored.guessHistory);
        setPastGuesses(restored.pastGuesses);
        const solvedWords = new Set(
          restored.solvedGroups.flatMap((gi) => todaysBoard.groups[gi].words)
        );
        setTiles(
          shuffled(
            todaysBoard.groups
              .flatMap((g) => g.words)
              .filter((w) => !solvedWords.has(w))
          )
        );
        if (restored.status !== "playing") {
          // Finished earlier today — restore without re-emitting.
          reported.current = true;
          setPhase(restored.status);
          return;
        }
      } else {
        setTiles(shuffled(todaysBoard.groups.flatMap((g) => g.words)));
      }
      setPhase("playing");
    };

    queueMicrotask(hydrate);
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    (state: Omit<SavedDay, "boardId">, boardId: string, key: string) => {
      try {
        localStorage.setItem(
          `crosslinks-${key}`,
          JSON.stringify({ ...state, boardId } satisfies SavedDay)
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
      const raw = localStorage.getItem("crosslinks-streak");
      if (raw) {
        const s: Streak = JSON.parse(raw);
        if (s.lastWinDate === yesterdayDateKey()) next = s.count + 1;
      }
      localStorage.setItem(
        "crosslinks-streak",
        JSON.stringify({ count: next, lastWinDate: key } satisfies Streak)
      );
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const difficultyOf = useCallback(
    (word: string): CrosslinksDifficulty => {
      const group = board?.groups.find((g) =>
        (g.words as readonly string[]).includes(word)
      );
      return group?.difficulty ?? "yellow";
    },
    [board]
  );

  const toggleTile = (word: string) => {
    if (phase !== "playing") return;
    setSelected((sel) =>
      sel.includes(word)
        ? sel.filter((w) => w !== word)
        : sel.length < 4
          ? [...sel, word]
          : sel
    );
  };

  const submit = () => {
    if (phase !== "playing" || !board || selected.length !== 4) return;

    const guessKey = [...selected].sort().join("|");
    if (pastGuesses.includes(guessKey)) {
      toast("Already guessed that combination");
      return;
    }

    const nextPastGuesses = [...pastGuesses, guessKey];
    const guessRow = selected.map(difficultyOf);
    const nextHistory = [...guessHistory, guessRow];

    // How many of the selected words share a single group?
    let matchedGroup = -1;
    let bestOverlap = 0;
    board.groups.forEach((g, gi) => {
      const overlap = selected.filter((w) =>
        (g.words as readonly string[]).includes(w)
      ).length;
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        matchedGroup = gi;
      }
    });

    if (bestOverlap === 4) {
      const nextSolved = [...solvedGroups, matchedGroup];
      const solvedWords = new Set(board.groups[matchedGroup].words);
      const nextTiles = tiles.filter((w) => !solvedWords.has(w));
      const won = nextSolved.length === 4;

      setSolvedGroups(nextSolved);
      setTiles(nextTiles);
      setSelected([]);
      setGuessHistory(nextHistory);
      setPastGuesses(nextPastGuesses);
      persist(
        {
          solvedGroups: nextSolved,
          mistakes,
          guessHistory: nextHistory,
          pastGuesses: nextPastGuesses,
          status: won ? "won" : "playing",
        },
        board.id,
        dayKey
      );

      if (won) {
        finishGame(true, nextSolved.length, mistakes);
      }
      return;
    }

    // Wrong group — charge a mistake, hint if one away.
    const nextMistakes = mistakes + 1;
    const lost = nextMistakes >= MAX_MISTAKES;

    setMistakes(nextMistakes);
    setGuessHistory(nextHistory);
    setPastGuesses(nextPastGuesses);
    setSelected([]);
    if (bestOverlap === 3 && !lost) toast("One away!");
    persist(
      {
        solvedGroups,
        mistakes: nextMistakes,
        guessHistory: nextHistory,
        pastGuesses: nextPastGuesses,
        status: lost ? "lost" : "playing",
      },
      board.id,
      dayKey
    );

    if (lost) {
      finishGame(false, solvedGroups.length, nextMistakes);
    }
  };

  const finishGame = (won: boolean, solvedCount: number, finalMistakes: number) => {
    if (!reported.current) {
      reported.current = true;
      const score = solvedCount * 100 + (MAX_MISTAKES - finalMistakes) * 50;
      track("game.played", {
        gameId: leaderboardId(GAME, dayKey),
        baseId: leaderboardId(GAME),
        streakEligible: true,
        solved: won,
        score,
        mistakes: finalMistakes,
        day: dayKey,
      });
      if (won) {
        setStreak(recordWinStreak(dayKey));
        if (finalMistakes === 0) burstConfetti();
      }
      if (!isAuthenticated) {
        toast("Sign in to save this score to the leaderboard", {
          action: { label: "Sign in", onClick: openSignIn },
        });
      }
    }
    setPhase(won ? "won" : "lost");
  };

  const shuffleTiles = () => setTiles((t) => shuffled(t));
  const deselectAll = () => setSelected([]);

  const share = async () => {
    const finalMistakes = mistakes;
    const header = `${GAME_NAME} ${dayKey} ${
      phase === "won" ? `✓ (${finalMistakes} mistake${finalMistakes === 1 ? "" : "s"})` : "✗"
    }`;
    const grid = guessHistory
      .map((row) => row.map((d) => DIFFICULTY_EMOJI[d]).join(""))
      .join("\n");
    try {
      await navigator.clipboard.writeText(
        `${header}\n\n${grid}\n\nradar.gdgbabcock.com/games/crosslinks`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Rails to display: groups the player solved (in solve order), plus — after
  // a loss — the unsolved remainder revealed easiest-first.
  const rails = useMemo(() => {
    if (!board) return [];
    const revealed = [...solvedGroups];
    if (phase === "lost") {
      board.groups.forEach((g, gi) => {
        if (!revealed.includes(gi)) revealed.push(gi);
      });
      const found = new Set(solvedGroups);
      revealed.sort((a, b) => {
        const aFound = found.has(a) ? 0 : 1;
        const bFound = found.has(b) ? 0 : 1;
        if (aFound !== bFound) return aFound - bFound;
        if (aFound === 0) return solvedGroups.indexOf(a) - solvedGroups.indexOf(b);
        return (
          DIFFICULTY_RANK[board.groups[a].difficulty] -
          DIFFICULTY_RANK[board.groups[b].difficulty]
        );
      });
    }
    return revealed.map((gi) => ({ index: gi, group: board.groups[gi] }));
  }, [board, solvedGroups, phase]);

  const finished = phase === "won" || phase === "lost";

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-sm text-content-muted mb-6">
        Find four groups of four related terms. Watch out — some words fit
        more than one group.
        {streak > 0 && (
          <span className="ml-2 font-semibold text-gdg-yellow">
            🔥 {streak}-day streak
          </span>
        )}
      </p>

      {/* Solved / revealed group rails */}
      {rails.length > 0 && (
        <div className="space-y-2 mb-2">
          {rails.map(({ index, group }) => (
            <div
              key={index}
              className="crosslinks-pop rounded-xl px-4 py-3 text-center"
              style={{
                backgroundColor: DIFFICULTY_COLOR[group.difficulty],
                color: DIFFICULTY_TEXT[group.difficulty],
              }}
            >
              <p className="text-xs font-extrabold uppercase tracking-wider">
                {group.title}
                {phase === "lost" && !solvedGroups.includes(index) && " (missed)"}
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {group.words.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tile grid */}
      {!finished && tiles.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {tiles.map((word) => {
            const isSelected = selected.includes(word);
            return (
              <button
                key={word}
                onClick={() => toggleTile(word)}
                className={cn(
                  "rounded-xl px-1 py-4 text-xs sm:text-sm font-bold uppercase break-words transition-colors select-none",
                  isSelected
                    ? "bg-content text-surface"
                    : "bg-surface-input text-content hover:bg-overlay-strong"
                )}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {/* Mistake dots + controls */}
      {!finished && phase !== "loading" && (
        <>
          <div className="flex items-center justify-center gap-2 mb-5 text-sm text-content-muted">
            <span>Mistakes remaining:</span>
            <span className="inline-flex gap-1.5">
              {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-3 w-3 rounded-full",
                    i < MAX_MISTAKES - mistakes ? "bg-primary" : "bg-surface-input"
                  )}
                />
              ))}
            </span>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={shuffleTiles}
              className="rounded-full border border-edge bg-overlay px-5 py-2.5 text-sm font-semibold text-content hover:border-edge-strong transition-colors"
            >
              Shuffle
            </button>
            <button
              onClick={deselectAll}
              disabled={selected.length === 0}
              className="rounded-full border border-edge bg-overlay px-5 py-2.5 text-sm font-semibold text-content hover:border-edge-strong transition-colors disabled:opacity-40"
            >
              Deselect all
            </button>
            <button
              onClick={submit}
              disabled={selected.length !== 4}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-40"
            >
              Submit
            </button>
          </div>
        </>
      )}

      {/* End panel */}
      {finished && (
        <div className="mt-4 rounded-2xl border border-edge bg-surface-raised dark-card p-5 text-center">
          {phase === "won" ? (
            <p className="text-content font-semibold">
              🎉 All four groups
              {mistakes === 0 ? " — a perfect board!" : ` with ${mistakes} mistake${mistakes === 1 ? "" : "s"}.`}
              {streak > 1 ? ` ${streak} days running.` : ""}
            </p>
          ) : (
            <p className="text-content font-semibold">
              Out of mistakes — the missed groups are revealed above. A new
              board drops tomorrow.
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
    </div>
  );
}
