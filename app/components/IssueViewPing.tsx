"use client";

import { useEffect } from "react";

export default function IssueViewPing({ issueId }: { issueId: string }) {
  useEffect(() => {
    fetch(`/api/issues/${encodeURIComponent(issueId)}/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "open", visitId: crypto.randomUUID() }),
    }).catch(() => {});
  }, [issueId]);
  return null;
}
