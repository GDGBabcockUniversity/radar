"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "../lib/track";
import { cn } from "../lib/utils";
import {
  RAPID_FIRE_QUESTIONS,
  type RapidFireQuestion,
} from "../lib/gamesData/rapidFireQuestions";
import { localDateKey } from "../lib/gamesData/daily";
import { getGame, leaderboardId } from "../lib/games";
import { queuePendingScore } from "../lib/pendingScores";
import { nudgeSignInAfterGame } from "../lib/signInNudge";
import { shareResult } from "../lib/shareResult";
import { useAuth } from "./AuthProvider";
import GameInfoModal from "./GameInfoModal";

// Rapid Fire — RADAR's replayable 60-second trivia sprint. Unlimited runs;
// the daily leaderboard bucket plus the best-score-only write means your
// best run of the day is what counts. Deliberately NOT streak-eligible —
// an arcade run isn't a daily-habit streak, so the emit carries no
// baseId/streakEligible.

const GAME_NAME = "Rapid Fire"; // working title — change here only
const GAME = getGame("rapid-fire")!;
const RUN_SECONDS = 60;
const POINTS_PER_CORRECT = 10;
const WRONG_PENALTY = 5;
const STREAK_THRESHOLD = 3;
const STREAK_BONUS = 5;

type Phase = "ready" | "playing" | "finished";

function shuffled<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function RapidFireGame() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [questions, setQuestions] = useState<RapidFireQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [runStreak, setRunStreak] = useState(0);
  const [remaining, setRemaining] = useState(RUN_SECONDS);
  const [bestToday, setBestToday] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const startedAt = useRef<number | null>(null);
  const runReported = useRef(false);
  // Live mirrors of score/correct so the timer can end the run without
  // stale-closure gymnastics.
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const { isAuthenticated, openSignIn } = useAuth();

  // Mount: read today's best + first-visit how-to. Deferred out of the
  // synchronous effect body, same pattern as the other games.
  useEffect(() => {
    let cancelled = false;
    const hydrate = () => {
      if (cancelled) return;
      try {
        if (!localStorage.getItem("howto-seen-rapid-fire")) {
          localStorage.setItem("howto-seen-rapid-fire", "1");
          setInfoOpen(true);
        }
        const best = localStorage.getItem(`rapidfire-best-${localDateKey()}`);
        if (best) setBestToday(Number(best));
      } catch {
        /* ignore */
      }
    };
    queueMicrotask(hydrate);
    return () => {
      cancelled = true;
    };
  }, []);

  const finishRun = useCallback(
    (finalScore: number, finalCorrect: number) => {
      // Single emit per run — this is the only place a run terminates.
      if (runReported.current) return;
      runReported.current = true;
      const day = localDateKey();

      const payload = {
        gameId: leaderboardId(GAME, day),
        solved: true,
        correct: finalCorrect,
        score: finalScore,
        day,
      };
      track("game.played", payload);

      try {
        const prevBest = Number(localStorage.getItem(`rapidfire-best-${day}`) ?? 0);
        if (finalScore > prevBest) {
          localStorage.setItem(`rapidfire-best-${day}`, String(finalScore));
          setBestToday(finalScore);
        } else if (prevBest > 0) {
          setBestToday(prevBest);
        }
      } catch {
        /* ignore */
      }

      if (!isAuthenticated) {
        // Anonymous emits are dropped server-side; the queue is what lets
        // this result transition to the account after sign-in.
        queuePendingScore(payload);
        nudgeSignInAfterGame(openSignIn, day);
      }
      setPhase("finished");
    },
    [isAuthenticated, openSignIn]
  );

  // Countdown derived from a wall-clock start, so backgrounded tabs can't
  // stretch the minute. The interval only re-renders; time comes from Date.
  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      if (startedAt.current == null) return;
      const left = RUN_SECONDS - Math.floor((Date.now() - startedAt.current) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        finishRun(scoreRef.current, correctRef.current);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [phase, finishRun]);

  const start = () => {
    setQuestions(shuffled(RAPID_FIRE_QUESTIONS));
    setIndex(0);
    setScore(0);
    setCorrectCount(0);
    setRunStreak(0);
    scoreRef.current = 0;
    correctRef.current = 0;
    setRemaining(RUN_SECONDS);
    runReported.current = false;
    startedAt.current = Date.now();
    setPhase("playing");
  };

  const answer = (optionIndex: number) => {
    if (phase !== "playing") return;
    const question = questions[index];
    if (!question) return;

    const isCorrect = optionIndex === question.correct;
    const nextStreak = isCorrect ? runStreak + 1 : 0;
    // Wrong answers cost points — spamming through the deck no longer pays.
    // A live streak of 3+ correct answers earns a bonus on top of the base
    // 10, rewarding actually knowing the run of questions.
    const gain = isCorrect
      ? POINTS_PER_CORRECT + (nextStreak >= STREAK_THRESHOLD ? STREAK_BONUS : 0)
      : -WRONG_PENALTY;
    const nextScore = Math.max(0, score + gain);
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    setScore(nextScore);
    setCorrectCount(nextCorrect);
    setRunStreak(nextStreak);
    scoreRef.current = nextScore;
    correctRef.current = nextCorrect;

    if (index + 1 >= questions.length) {
      finishRun(nextScore, nextCorrect);
    } else {
      setIndex(index + 1);
    }
  };

  const share = async () => {
    const result = await shareResult(
      `${GAME_NAME} ${localDateKey()} — ${score} pts (${correctCount} correct in 60s)\n\nradar.gdgbabcock.com/games/rapid-fire`
    );
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const question = questions[index];

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-start justify-between gap-3">
        <p className="text-sm text-content-muted">
          Sixty seconds, endless questions. Replay as much as you like — your
          best run of the day makes the board.
          {bestToday != null && (
            <span className="ml-2 font-semibold text-gdg-yellow">
              Today&apos;s best: {bestToday}
            </span>
          )}
        </p>
        <button
          onClick={() => setInfoOpen(true)}
          aria-label="How to play"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-edge text-xs font-bold text-content-muted hover:border-primary hover:text-primary transition-colors"
        >
          ?
        </button>
      </div>

      {phase === "ready" && (
        <div className="rounded-2xl border border-edge bg-surface-raised dark-card p-10 text-center">
          <p className="text-4xl">⚡</p>
          <p className="mt-4 font-semibold text-content">
            Answer as many as you can before the clock runs out.
          </p>
          <button
            onClick={start}
            className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-hover transition-colors"
          >
            Start the clock
          </button>
        </div>
      )}

      {phase === "playing" && question && (
        <>
          {/* Score + timer bar */}
          <div className="mb-4 flex items-center justify-between font-mono text-sm">
            <span className="flex items-center gap-2">
              <span className="font-bold text-primary">{score} pts</span>
              {runStreak >= STREAK_THRESHOLD && (
                <span className="font-bold text-gdg-yellow">
                  🔥 x{runStreak}
                </span>
              )}
            </span>
            <span
              className={cn(
                "font-bold",
                remaining <= 10 ? "text-gdg-red" : "text-content-muted"
              )}
            >
              ⏱ {remaining}s
            </span>
          </div>
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-surface-input">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                remaining <= 10 ? "bg-gdg-red" : "bg-primary"
              )}
              style={{ width: `${(remaining / RUN_SECONDS) * 100}%` }}
            />
          </div>

          <div className="rounded-2xl border border-edge bg-surface-raised dark-card p-6">
            <p className="text-lg font-semibold leading-snug text-content">
              {question.q}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {question.options.map((option, i) => (
              <button
                key={`${index}-${i}`}
                onClick={() => answer(i)}
                className="rounded-xl border border-edge bg-surface-input px-4 py-3.5 text-left text-sm font-medium text-content hover:border-primary hover:text-primary transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "finished" && (
        <div className="rounded-2xl border border-edge bg-surface-raised dark-card p-8 text-center">
          <p className="text-content font-semibold">
            ⏰ Time! You scored{" "}
            <span className="text-primary text-lg font-bold">{score}</span>{" "}
            with {correctCount} correct.
          </p>
          {bestToday != null && score >= bestToday && score > 0 && (
            <p className="mt-1.5 text-sm font-semibold text-gdg-yellow">
              New personal best for today 🎯
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={start}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors"
            >
              Play again
            </button>
            <button
              onClick={share}
              className="rounded-full border border-edge bg-overlay px-6 py-2.5 text-sm font-semibold text-content hover:border-primary hover:text-primary transition-colors"
            >
              {copied ? "Copied!" : "Share result"}
            </button>
          </div>
        </div>
      )}

      <GameInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={GAME_NAME}
      >
        <p>
          A sixty-second sprint through tech trivia. One question at a time,
          four options each.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Every correct answer is worth 10 points.</li>
          <li>Wrong answers cost 5 — guessing wildly doesn&apos;t pay.</li>
          <li>Three or more correct in a row earns a streak bonus (+5 each) while it lasts — shown as 🔥.</li>
          <li>Replay as many times as you want, all day.</li>
          <li>Only your best run of the day counts on the leaderboard, which resets at midnight.</li>
        </ul>
      </GameInfoModal>
    </div>
  );
}
