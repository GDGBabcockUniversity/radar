import { toast } from "sonner";
import type { SignInContext } from "../components/AuthProvider";

// Post-game sign-in prompt for anonymous players, shared by every game.
// The full sheet auto-opens only once per local day — after the first game
// finished that day — and later finishes fall back to a toast. The queued
// pending score (see pendingScores.ts) is what actually carries the result
// through sign-in.

const PROMPT_FLAG_PREFIX = "radar-signin-prompt-";

export function nudgeSignInAfterGame(
  openSignIn: (context?: SignInContext) => void,
  dayKey: string,
): void {
  let promptedToday = true;
  try {
    const flag = `${PROMPT_FLAG_PREFIX}${dayKey}`;
    promptedToday = localStorage.getItem(flag) !== null;
    if (!promptedToday) localStorage.setItem(flag, "1");
  } catch {
    // storage unavailable — stick with the quieter toast
  }

  if (!promptedToday) {
    openSignIn({
      title: "Sign in to keep your score",
      message:
        "Save today's result to the leaderboard and build your streak — the game you just played counts once you're in.",
    });
  } else {
    toast("Sign in to save this score to the leaderboard", {
      action: { label: "Sign in", onClick: () => openSignIn() },
    });
  }
}
