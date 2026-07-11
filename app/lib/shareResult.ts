// Result sharing for the daily games. On a phone this should open the OS
// share sheet — the direct route into WhatsApp/Instagram/iMessage that
// clipboard-only sharing never reaches. Falls back to clipboard on desktop
// (or anywhere navigator.share is unavailable, e.g. this sandbox).
export async function shareResult(text: string): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      // AbortError (user dismissed the sheet) or any other failure — treat
      // both as "nothing happened", not an error state worth surfacing.
      return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
