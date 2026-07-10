"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "./AuthProvider";
import type { GameStats } from "../lib/gameStats";

// Shared "How to play" + "Your stats" modal for the games, modeled on the
// NYT games pattern: auto-opened on a game's first visit, reachable any time
// from a "?" button. Stats are local-first (see lib/gameStats.ts); the
// sign-in line at the bottom is what links streaks across devices.

interface GameInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** How-to-play content — bullets, tile examples, whatever the game needs. */
  children: React.ReactNode;
  stats?: GameStats | null;
}

export default function GameInfoModal({
  isOpen,
  onClose,
  title,
  children,
  stats,
}: GameInfoModalProps) {
  const { isAuthenticated, openSignIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Portals need a real `document`, which doesn't exist during SSR.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const maxBucket = Math.max(
    1,
    ...(stats?.distribution?.map((b) => b.count) ?? [0]),
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[10000] flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-edge bg-surface p-7 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-content">How to play {title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full px-2 text-lg text-content-muted hover:text-content"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-content-secondary">
            {children}
          </div>

          {stats && (
            <div className="mt-6 border-t border-edge pt-5">
              <h3 className="text-xs font-bold uppercase tracking-[2px] text-content-muted">
                Your stats
              </h3>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { value: stats.played, label: "Played" },
                  { value: `${stats.winPct}%`, label: "Win %" },
                  { value: stats.currentStreak, label: "Streak" },
                  { value: stats.maxStreak, label: "Max streak" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-content">{value}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-content-subtle">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {stats.distribution && stats.won > 0 && (
                <div className="mt-5 space-y-1.5">
                  {stats.distribution.map((bucket) => (
                    <div key={bucket.label} className="flex items-center gap-2 text-xs">
                      <span className="w-3 font-mono text-content-subtle">
                        {bucket.label}
                      </span>
                      <div className="flex-1">
                        <div
                          className="flex h-5 min-w-5 items-center justify-end rounded-sm bg-primary/80 px-1.5 font-semibold text-white"
                          style={{ width: `${(bucket.count / maxBucket) * 100}%` }}
                        >
                          {bucket.count > 0 ? bucket.count : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isAuthenticated && (
                <button
                  onClick={() => {
                    onClose();
                    openSignIn();
                  }}
                  className="mt-5 w-full rounded-full border border-edge bg-overlay px-4 py-2.5 text-sm font-semibold text-content hover:border-primary hover:text-primary transition-colors"
                >
                  Sign in to link your streak across devices
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
