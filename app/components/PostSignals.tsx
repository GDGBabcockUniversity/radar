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
    setBody(e.target.value);
    setError(null);
    // Auto-grow
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  };

  const handleFocus = () => {
    if (!isAuthenticated) {
      openSignIn({
        title: "Leave a Signal",
        message: "Sign in to share your thoughts on this post.",
      });
    }
  };

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || !isAuthenticated) return;

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
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
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
            <path d="M2 10V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" />
            <path d="M12 14v4" />
            <path d="M2 10l10 4 10-4" />
            <path d="M8 22h8" />
          </svg>
          <h3 className="post-signals-title">
            Signals
            {signals.length > 0 && (
              <span className="post-signals-count">{signals.length}</span>
            )}
          </h3>
        </div>
        <p className="post-signals-subtitle">
          Share your thoughts on this post
        </p>
      </div>

      {/* Compose area */}
      <div className="post-signals-compose">
        {isAuthenticated ? (
          <>
            <div className="post-signals-input-row">
              <textarea
                ref={textareaRef}
                className="post-signals-textarea"
                placeholder="Drop a signal…"
                value={body}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                maxLength={MAX_LENGTH}
                rows={1}
                disabled={submitting}
              />
            </div>
            <div className="post-signals-compose-footer">
              <span
                className={`post-signals-char-count ${remaining <= 50 ? "warning" : ""} ${remaining <= 0 ? "over" : ""}`}
              >
                {remaining}
              </span>
              <button
                className="post-signals-submit"
                onClick={handleSubmit}
                disabled={submitting || body.trim().length === 0}
              >
                {submitting ? (
                  <span className="post-signals-spinner" />
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send
                  </>
                )}
              </button>
            </div>
            {error && <p className="post-signals-error">{error}</p>}
          </>
        ) : (
          <button
            className="post-signals-signin-prompt"
            onClick={() =>
              openSignIn({
                title: "Leave a Signal",
                message: "Sign in to share your thoughts on this post.",
              })
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in to leave a Signal
          </button>
        )}
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
            <p>No signals yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              currentMemberId={member?.memberId}
              onDelete={handleDelete}
              isDeleting={deletingId === signal.id}
            />
          ))
        )}
      </div>
    </section>
  );
}
