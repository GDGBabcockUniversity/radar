"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  contentProgress,
  EngagementProgress,
} from "@/app/lib/article-engagement";

export function useArticleEngagement(
  articleId: string,
  content: RefObject<HTMLElement | null>,
) {
  // Reuse initialization across Strict Mode's effect replay.
  const visit = useRef<{ id: string; token: Promise<string | null> } | null>(
    null,
  );
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const endpoint = `/api/articles/${encodeURIComponent(articleId)}/views`;
    if (visit.current?.id !== articleId) {
      visit.current = {
        id: articleId,
        token: fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "open", visitId: crypto.randomUUID() }),
        })
          .then(async (res) =>
            res.ok ? ((await res.json()).token as string) : null,
          )
          .catch(() => null),
      };
    }
    const token = visit.current.token;
    const progress = new EngagementProgress();
    let disposed = false;
    let ready = false;
    void token.then((proof) => {
      if (!disposed && proof) {
        ready = true;
        sample();
      }
    });
    const send = (event: "engaged" | "completion") => {
      void token.then(async (proof) => {
        if (!proof || disposed) return;
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              event,
              token: proof,
              activeMs: Math.floor(progress.activeMs),
              depth: progress.depth,
            }),
          });
          if (res.ok && event === "engaged")
            window.dispatchEvent(
              new CustomEvent("article-engaged", { detail: articleId }),
            );
        } catch {
          /* Analytics must never interrupt reading. No automatic retries. */
        }
      });
    };
    const sample = () => {
      if (!ready) return;
      const rect = element.getBoundingClientRect();
      const events = progress.update(
        performance.now(),
        document.visibilityState === "visible" && document.hasFocus(),
        contentProgress(rect.top, rect.height, window.innerHeight),
      );
      if (events.engaged) send("engaged");
      if (events.completed) send("completion");
    };
    const observer = new ResizeObserver(sample);
    observer.observe(element);
    window.addEventListener("scroll", sample, { passive: true });
    window.addEventListener("resize", sample);
    window.addEventListener("focus", sample);
    window.addEventListener("blur", sample);
    document.addEventListener("visibilitychange", sample);
    const timer = window.setInterval(sample, 250);
    sample();
    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener("scroll", sample);
      window.removeEventListener("resize", sample);
      window.removeEventListener("focus", sample);
      window.removeEventListener("blur", sample);
      document.removeEventListener("visibilitychange", sample);
    };
  }, [articleId, content]);
}
