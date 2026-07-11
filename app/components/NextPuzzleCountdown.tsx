"use client";

import { useEffect, useState } from "react";

function msUntilNextLocalMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

function format(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// Ticks toward the player's local midnight — derived fresh from Date each
// second, so a backgrounded tab can't drift the countdown.
export default function NextPuzzleCountdown({ gameName }: { gameName: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(msUntilNextLocalMidnight());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (remaining === null) return null;

  return (
    <p className="text-xs font-mono text-content-subtle">
      Next {gameName} in {format(remaining)}
    </p>
  );
}
