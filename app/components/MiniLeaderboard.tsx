"use client";

import { useEffect, useState } from "react";
import { publicDisplayName, avatarColor } from "../lib/displayName";
import { localDateKey } from "../lib/gamesData/daily";
import { useAuth } from "./AuthProvider";

interface Entry {
  member: string;
  name: string | null;
  score: number;
}

// Today's top-5 for a single game, dropped straight into the end panel —
// the immediate "where do I stand" a player wants right after finishing.
export default function MiniLeaderboard({ gameSlug }: { gameSlug: string }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const { member } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const day = localDateKey();
    fetch(`/api/games/${gameSlug}/leaderboard?day=${day}`)
      .then((res) => (res.ok ? res.json() : { top: [] }))
      .then((data) => {
        if (!cancelled) setEntries(Array.isArray(data.top) ? data.top : []);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [gameSlug]);

  if (entries === null) return null;

  if (entries.length === 0) {
    return (
      <p className="text-xs text-content-subtle">
        Today&apos;s board is warming up.
      </p>
    );
  }

  return (
    <ol className="space-y-2 text-left">
      {entries.map((entry, i) => {
        const isSelf = member?.memberId === entry.member;
        const label = publicDisplayName(entry.name, entry.member);
        return (
          <li
            key={entry.member}
            className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm ${
              isSelf ? "border border-primary" : ""
            }`}
          >
            <span
              className={
                i === 0
                  ? "font-mono text-xs font-bold text-gdg-yellow"
                  : "font-mono text-xs text-content-subtle"
              }
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: avatarColor(entry.member) }}
            >
              {label[0]?.toUpperCase()}
            </span>
            <span className="flex-1 truncate text-content-secondary">
              {isSelf ? "You" : label}
            </span>
            <span className="font-bold text-primary">{entry.score}</span>
          </li>
        );
      })}
    </ol>
  );
}
