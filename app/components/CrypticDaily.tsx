"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { track } from "../lib/track";
import { cn } from "../lib/utils";
import { CRYPTIC_CLUES, type CrypticClue } from "../lib/gamesData/crypticClues";
import { dayIndex, localDateKey, yesterdayDateKey } from "../lib/gamesData/daily";
import { getGame, leaderboardId } from "../lib/games";
import { queuePendingScore } from "../lib/pendingScores";
import { nudgeSignInAfterGame } from "../lib/signInNudge";
import { computeDailyGameStats, type GameStats } from "../lib/gameStats";
import { useAuth } from "./AuthProvider";
import GameInfoModal from "./GameInfoModal";

// Cryptic — RADAR's daily cryptic-clue game, One Minute Cryptic style: one
// clue per local day, solve it fast, and the post-solve explanation teaches
// the wordplay. Scoring rewards clean, quick solves: 400 base, −100 per
// revealed letter (max 3), −5 per 15 seconds, floor 50. Giving up emits
// solved:false with NO score, which the engagement pipeline already skips
// for leaderboards.

const GAME_NAME = "Cryptic"; // working title — change here only
const GAME = getGame("cryptic")!;
const MAX_HINTS = 3;

type Phase = "loading" | "playing" | "won" | "lost";

interface SavedDay {
  hintsUsed: number;
  seconds: number;
  status: "playing" | "won" | "lost";
  startedAt?: number;
}

function ensureAnimationStyles() {
  if (document.getElementById("cryptic-styles")) return;
  const style = document.createElement("style");
  style.id = "cryptic-styles";
  style.textContent = `
    @keyframes cryptic-confetti-fall {
      0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
    @keyframes cryptic-shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    .cryptic-shake { animation: cryptic-shake 450ms ease; }
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
    p.style.cssText = `position:absolute;top:0;left:${Math.random() * 100}%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};animation:cryptic-confetti-fall ${2.5 + Math.random() * 2}s linear ${Math.random() * 0.8}s forwards;`;
    holder.appendChild(p);
  }
  document.body.appendChild(holder);
  setTimeout(() => holder.remove(), 5000);
}

function crypticScore(hintsUsed: number, seconds: number): number {
  return Math.max(50, 400 - hintsUsed * 100 - Math.floor(seconds / 12) * 5);
}

export default function CrypticDaily() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [clue, setClue] = useState<CrypticClue | null>(null);
  const [dayKey, setDayKey] = useState("");
  const [guess, setGuess] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [stats, setStats] = useState<GameStats | null>(null);
  const startedAt = useRef<number | null>(null);
  const reported = useRef(false);
  const { isAuthenticated, openSignIn } = useAuth();

  const openInfo = useCallback(() => {
    setStats(
      computeDailyGameStats("cryptic", localDateKey(), yesterdayDateKey())
    );
    setInfoOpen(true);
  }, []);

  const persist = useCallback((state: SavedDay, key: string) => {
    try {
      localStorage.setItem(`cryptic-${key}`, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, []);

  // Mount hydration — deferred out of the synchronous effect body (same
  // pattern as SignalWordle): dates/localStorage never run during render.
  useEffect(() => {
    ensureAnimationStyles();
    let cancelled = false;

    const hydrate = () => {
      if (cancelled) return;
      const key = localDateKey();
      const todaysClue = CRYPTIC_CLUES[dayIndex() % CRYPTIC_CLUES.length];
      setDayKey(key);
      setClue(todaysClue);

      let restored: SavedDay | null = null;
      try {
        // First-ever visit: open the how-to-play modal before play starts.
        if (!localStorage.getItem("howto-seen-cryptic")) {
          localStorage.setItem("howto-seen-cryptic", "1");
          openInfo();
        }
        const raw = localStorage.getItem(`cryptic-${key}`);
        if (raw) restored = JSON.parse(raw);
      } catch {
        /* corrupted state — start fresh */
      }

      if (restored && restored.status !== "playing") {
        // Finished earlier today — restore terminal state WITHOUT re-emitting.
        reported.current = true;
        setHintsUsed(restored.hintsUsed);
        setFinalSeconds(restored.seconds);
        setPhase(restored.status);
        return;
      }

      // The clock survives a refresh mid-solve: startedAt is persisted with
      // the in-progress save, so reloading doesn't reset the timer.
      const start = restored?.startedAt ?? Date.now();
      startedAt.current = start;
      if (restored) setHintsUsed(restored.hintsUsed);
      persist(
        { hintsUsed: restored?.hintsUsed ?? 0, seconds: 0, status: "playing", startedAt: start },
        key
      );
      setPhase("playing");
    };

    queueMicrotask(hydrate);
    return () => {
      cancelled = true;
    };
  }, [openInfo, persist]);

  // Tick the visible timer while playing.
  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      if (startedAt.current != null) {
        setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const finish = useCallback(
    (won: boolean) => {
      if (!clue || reported.current) return;
      reported.current = true;
      const seconds =
        startedAt.current != null
          ? Math.floor((Date.now() - startedAt.current) / 1000)
          : elapsed;
      setFinalSeconds(seconds);
      persist({ hintsUsed, seconds, status: won ? "won" : "lost" }, dayKey);

      const base = {
        gameId: leaderboardId(GAME, dayKey),
        baseId: leaderboardId(GAME),
        streakEligible: true,
        oneAttempt: true,
        solved: won,
        hints: hintsUsed,
        seconds,
        day: dayKey,
      };
      const payload = won
        ? { ...base, score: crypticScore(hintsUsed, seconds) }
        : base;
      track("game.played", payload);

      if (won) burstConfetti();
      if (!isAuthenticated && won) {
        // Anonymous emits are dropped server-side; the queue is what lets
        // this result transition to the account after sign-in.
        queuePendingScore(payload);
        nudgeSignInAfterGame(openSignIn, dayKey);
      }
      setPhase(won ? "won" : "lost");
    },
    [clue, dayKey, elapsed, hintsUsed, isAuthenticated, openSignIn, persist]
  );

  // Single normalization point: the input stores whatever the keyboard
  // produced (mobile predictive keyboards break if a controlled input
  // rewrites its value on every keystroke); letters-only uppercase happens
  // here, and the CSS `uppercase` class handles the display.
  const normalized = guess.toUpperCase().replace(/[^A-Z]/g, "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "playing" || !clue) return;
    if (normalized.length !== clue.answer.length) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (normalized === clue.answer) {
      finish(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast("Not it — keep cracking");
    }
  };

  const revealLetter = () => {
    if (phase !== "playing" || !clue || hintsUsed >= MAX_HINTS) return;
    const next = hintsUsed + 1;
    setHintsUsed(next);
    persist(
      {
        hintsUsed: next,
        seconds: 0,
        status: "playing",
        startedAt: startedAt.current ?? Date.now(),
      },
      dayKey
    );
  };

  const share = async () => {
    if (!clue) return;
    const won = phase === "won";
    const result = won
      ? `✓ ${hintsUsed} hint${hintsUsed === 1 ? "" : "s"} · ${finalSeconds}s`
      : "✗";
    try {
      await navigator.clipboard.writeText(
        `${GAME_NAME} ${dayKey} ${result}\n\nradar.gdgbabcock.com/games/cryptic`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const finished = phase === "won" || phase === "lost";

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-start justify-between gap-3">
        <p className="text-sm text-content-muted">
          One cryptic clue a day. The clue hides a definition and wordplay —
          crack either to find the answer.
        </p>
        <button
          onClick={openInfo}
          aria-label="How to play and your stats"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-edge text-xs font-bold text-content-muted hover:border-primary hover:text-primary transition-colors"
        >
          ?
        </button>
      </div>

      {clue && (
        <>
          {/* The clue */}
          <div className="rounded-2xl border border-edge bg-surface-raised dark-card p-6">
            <p className="font-serif text-xl leading-relaxed text-content md:text-2xl">
              {clue.clue}
            </p>
            {phase === "playing" && (
              <p className="mt-4 font-mono text-xs text-content-subtle">
                ⏱ {elapsed}s
                {hintsUsed > 0 &&
                  ` · ${hintsUsed} hint${hintsUsed === 1 ? "" : "s"} used`}
              </p>
            )}
          </div>

          {/* Letter slots — hints reveal from the left */}
          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {clue.answer.split("").map((letter, i) => (
              <span
                key={i}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md border-2 text-lg font-bold uppercase",
                  finished || i < hintsUsed
                    ? "border-gdg-green bg-gdg-green/10 text-content"
                    : "border-edge text-content-subtle"
                )}
              >
                {finished || i < hintsUsed ? letter : ""}
              </span>
            ))}
          </div>

          {/* Input + actions */}
          {phase === "playing" && (
            <>
              <form
                onSubmit={submit}
                className={cn("mt-6 flex gap-2", shake && "cryptic-shake")}
              >
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  maxLength={clue.answer.length + 2}
                  placeholder={`${clue.answer.length} letters`}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 rounded-xl border border-edge bg-transparent px-4 py-3 text-center font-mono text-lg uppercase tracking-[0.3em] text-content placeholder:text-sm placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-content-subtle focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={normalized.length !== clue.answer.length}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-40"
                >
                  Submit
                </button>
              </form>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={revealLetter}
                  disabled={hintsUsed >= MAX_HINTS}
                  className="rounded-full border border-edge bg-overlay px-5 py-2.5 text-sm font-semibold text-content hover:border-edge-strong transition-colors disabled:opacity-40"
                >
                  Reveal a letter ({MAX_HINTS - hintsUsed} left)
                </button>
                <button
                  onClick={() => finish(false)}
                  className="rounded-full border border-edge bg-overlay px-5 py-2.5 text-sm font-semibold text-content-muted hover:border-edge-strong hover:text-content transition-colors"
                >
                  Give up
                </button>
              </div>
            </>
          )}

          {/* End panel — the explanation is the payoff */}
          {finished && (
            <div className="mt-6 rounded-2xl border border-edge bg-surface-raised dark-card p-5">
              <p className="text-center font-semibold text-content">
                {phase === "won" ? (
                  <>
                    🎉 Cracked in {finalSeconds}s with {hintsUsed} hint
                    {hintsUsed === 1 ? "" : "s"} —{" "}
                    {crypticScore(hintsUsed, finalSeconds)} points
                  </>
                ) : (
                  <>
                    The answer was{" "}
                    <span className="text-primary">{clue.answer}</span>. A new
                    clue drops tomorrow.
                  </>
                )}
              </p>
              <div className="mt-4 rounded-xl border border-edge bg-overlay p-4">
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-content-subtle">
                  How the wordplay works
                </p>
                <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                  {clue.explanation}
                </p>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={share}
                  className="inline-flex items-center gap-2 rounded-full border border-edge bg-overlay px-5 py-2.5 text-sm font-semibold text-content hover:border-primary hover:text-primary transition-colors"
                >
                  {copied ? "Copied!" : "Share result"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <GameInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={GAME_NAME}
        stats={stats}
      >
        <p>
          Every cryptic clue contains two routes to the same answer: a
          straight definition (usually at the start or end) and wordplay
          (the rest). Crack either one.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>The number in parens is the answer&apos;s letter count.</li>
          <li>
            Watch for device signposts: &quot;scrambled&quot; hints an
            anagram, &quot;hidden in&quot; a buried word, &quot;we hear&quot;
            a sound-alike, &quot;sent back&quot; a reversal.
          </li>
          <li>Stuck? Reveal up to three letters — each costs 100 points.</li>
          <li>Solve fast: the clock trims 5 points every 15 seconds.</li>
          <li>After you finish, the wordplay is explained — that&apos;s how you get better.</li>
        </ul>
        <div className="rounded-xl border border-edge bg-overlay p-3 text-xs leading-relaxed">
          <p className="font-semibold text-content">
            Example: &quot;Stressed, sent back for sweet courses (8)&quot;
          </p>
          <p className="mt-1 text-content-muted">
            &quot;Sent back&quot; says reverse STRESSED → DESSERTS, and
            &quot;sweet courses&quot; is the definition. Answer: DESSERTS.
          </p>
        </div>
      </GameInfoModal>
    </div>
  );
}
