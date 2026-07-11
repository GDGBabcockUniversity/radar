import { track } from "./track";

// Anonymous score claims. When a signed-out player finishes a game, the
// server drops the emit (no member to attribute it to) — so the exact same
// payload is queued here, and flushed through track() again the moment the
// player signs in. Server-side idempotency makes the replay safe: the
// leaderboard ZADD only keeps a member's best score, and the streak write
// no-ops when that day is already counted. Payloads carry their original
// `day`, so a claim always lands on the day it was actually played.

const STORAGE_KEY = "radar-pending-scores";
const MAX_PENDING = 20;

interface PendingScore {
  type: "game.played";
  payload: Record<string, unknown>;
}

function read(): PendingScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function queuePendingScore(payload: Record<string, unknown>): void {
  try {
    const queue = read();
    queue.push({ type: "game.played", payload });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(queue.slice(-MAX_PENDING)),
    );
  } catch {
    // storage unavailable — the score is simply not claimable later
  }
}

// Sign-out hygiene: a queued anonymous score must never survive into the
// NEXT account's session on the same browser — flushing there would credit
// player A's result to player B.
export function clearPendingScores(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function flushPendingScores(): void {
  try {
    const queue = read();
    if (queue.length === 0) return;
    localStorage.removeItem(STORAGE_KEY);
    for (const entry of queue) {
      track(entry.type, entry.payload);
    }
  } catch {
    // ignore
  }
}
