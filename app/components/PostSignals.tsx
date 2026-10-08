"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import SignalCard from "./SignalCard";
import type { Signal } from "../api/signals/[slug]/route";

interface PostSignalsProps {
  slug: string;
}

const MAX_LENGTH = 500;

export default function PostSignals({ slug }: PostSignalsProps) {
  const { member, isAuthenticated, openSignIn } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch signals on mount
  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`/api/signals/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setSignals(data.signals ?? []);
      }
    } catch {
      // silent — signals are non-critical
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isAuthenticated) return; // don't let them type
    setBody(e.target.value);
    setError(null);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  };

  // When a logged-out user focuses or clicks the textarea → open sign-in modal
  const handleFocusOrClick = () => {
    if (!isAuthenticated) {
      openSignIn({
        title: "Leave a Signal",
        message: "Sign in to share your thoughts on this post.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      openSignIn({
        title: "Leave a Signal",
        message: "Sign in to share your thoughts on this post.",
      });
      return;
    }

    const trimmed = body.trim();
    if (!trimmed) return;

    if (trimmed.length > MAX_LENGTH) {
      setError(`Signal must be ${MAX_LENGTH} characters or fewer`);
      return;
    }

    setSubmitting(true);
    setError(null);

    // Optimistic UI: insert the signal immediately
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticSignal: Signal = {
      id: optimisticId,
      memberId: member!.memberId,
      name: member!.name ?? "Member",
      body: trimmed,
      createdAt: new Date().toISOString(),
      replyCount: 0,
    };
    setSignals((prev) => [optimisticSignal, ...prev]);
    setBody("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch(`/api/signals/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post signal");
      }

      const data = await res.json();
      // Replace optimistic entry with real data
      setSignals((prev) =>
        prev.map((s) => (s.id === optimisticId ? data.signal : s))
      );
    } catch (err) {
      // Roll back optimistic insert
      setSignals((prev) => prev.filter((s) => s.id !== optimisticId));
      setError(err instanceof Error ? err.message : "Failed to post signal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (signalId: string) => {
    setDeletingId(signalId);
    try {
      const res = await fetch(
        `/api/signals/${encodeURIComponent(slug)}?signalId=${encodeURIComponent(signalId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setSignals((prev) => prev.filter((s) => s.id !== signalId));
      }
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && isAuthenticated) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const remaining = MAX_LENGTH - body.length;

  return (
    <section className="post-signals" id="signals">
      {/* Header */}
      <div className="post-signals-header">
        <div className="post-signals-title-row">
          <svg
            className="post-signals-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 className="post-signals-title">
            Signals
            {signals.length > 0 && (
              <span className="post-signals-count">{signals.length}</span>
            )}
          </h3>
        </div>
        <p className="post-signals-subtitle">
          {isAuthenticated
            ? "Share your thoughts on this post"
            : "Sign in to leave a signal · anyone can read"}
        </p>
      </div>

      {/* Compose area — always visible, auth gated on interaction */}
      <div className="post-signals-compose">
        <div className="post-signals-input-row">
          <textarea
            ref={textareaRef}
            className="post-signals-textarea"
            placeholder={
              isAuthenticated ? "Drop a signal…" : "Sign in to drop a signal…"
            }
            value={body}
            onChange={handleInput}
            onFocus={handleFocusOrClick}
            onClick={handleFocusOrClick}
            onKeyDown={handleKeyDown}
            maxLength={isAuthenticated ? MAX_LENGTH : 0}
            rows={1}
            disabled={submitting}
            readOnly={!isAuthenticated}
            aria-label="Write a signal"
          />
        </div>
        <div className="post-signals-compose-footer">
          {isAuthenticated && (
            <span
              className={`post-signals-char-count ${remaining <= 50 ? "warning" : ""} ${remaining <= 0 ? "over" : ""}`}
            >
              {remaining}
            </span>
          )}
          <button
            className="post-signals-submit"
            onClick={handleSubmit}
            disabled={submitting || (isAuthenticated && body.trim().length === 0)}
          >
            {submitting ? (
              <span className="post-signals-spinner" />
            ) : (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {isAuthenticated ? "Send" : "Sign in"}
              </>
            )}
          </button>
        </div>
        {error && <p className="post-signals-error">{error}</p>}
      </div>

      {/* Signals list */}
      <div className="post-signals-list">
        {loading ? (
          <div className="post-signals-loading">
            <span className="post-signals-spinner" />
            <span>Loading signals…</span>
          </div>
        ) : signals.length === 0 ? (
          <div className="post-signals-empty">
            <p>No signals yet — be the first to drop one!</p>
          </div>
        ) : (
          signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              currentMemberId={member?.memberId}
              currentMemberName={member?.name ?? undefined}
              isAuthenticated={isAuthenticated}
              onDelete={handleDelete}
              isDeleting={deletingId === signal.id}
              onReply={() =>
                openSignIn({
                  title: "Leave a Signal",
                  message: "Sign in to reply to this signal.",
                })
              }
            />
          ))
        )}
      </div>
    </section>
  );
}
