"use client";

import { useEffect } from "react";

export default function ReadingTracker({ slug }: { slug: string }) {

  useEffect(() => {
    const postId = slug;
    const sessionId = crypto.randomUUID();
    let active = 0;
    let last = performance.now();

    const tick = () => {
      if (document.visibilityState === "visible") {
        active += performance.now() - last;
      }
      last = performance.now();
    };

    const flush = () => {
      tick();
      const seconds = Math.round(active / 1000);
      if (seconds < 1) return;

      const maxScroll = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((window.scrollY + window.innerHeight) /
              Math.max(document.body.scrollHeight, 1)) *
              100,
          ),
        ),
      );
      const body = JSON.stringify({ postId, sessionId, seconds, maxScroll });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/reads",
          new Blob([body], { type: "application/json" }),
        );
        return;
      }

      fetch("/api/reads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    };

    const timer = window.setInterval(tick, 1000);
    const onVisibility = () => {
      tick();
      if (document.hidden) flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [slug]);

  return null;
}
