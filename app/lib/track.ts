// Client-side fire-and-forget engagement tracking. Prefers sendBeacon (survives
// page unload, ideal for reading-time), falls back to keepalive fetch. Always
// fail-silent — tracking must never affect the UX.
export function track(type: string, payload: Record<string, unknown>): void {
  try {
    const body = JSON.stringify({ type, payload });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/engagement",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    fetch("/api/engagement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
