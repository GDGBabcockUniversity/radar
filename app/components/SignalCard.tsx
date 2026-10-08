"use client";

import { useState, useRef, useCallback } from "react";
import SignalAvatar from "./SignalAvatar";
import ReplyCard from "./ReplyCard";
import type { Signal } from "../api/signals/[slug]/route";
import type { Reply } from "../api/replies/[signalId]/route";

interface SignalCardProps {
  signal: Signal;
  currentMemberId?: string;
  currentMemberName?: string;
  onDelete?: (signalId: string) => void;
  isDeleting?: boolean;
  onReply?: () => void; // triggers sign-in if not authed
  isAuthenticated: boolean;
}

const MAX_LENGTH = 500;

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SignalCard({
  signal,
  currentMemberId,
  currentMemberName,
  onDelete,
  isDeleting,
  onReply,
  isAuthenticated,
}: SignalCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyCount, setReplyCount] = useState(signal.replyCount ?? 0);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isOwn = currentMemberId === signal.memberId;
  const remaining = MAX_LENGTH - replyBody.length;

  // Fetch replies lazily
  const fetchReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const res = await fetch(`/api/replies/${encodeURIComponent(signal.id)}`);
      if (res.ok) {
        const data = await res.json();
        setReplies(data.replies ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoadingReplies(false);
    }
  }, [signal.id]);

  const handleToggleReplies = () => {
    if (!repliesExpanded && replies.length === 0 && replyCount > 0) {
      fetchReplies();
    }
    setRepliesExpanded((v) => !v);
  };

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      onReply?.(); // triggers sign-in modal in parent
      return;
    }
    setReplyOpen((v) => !v);
    // Focus textarea on next tick
    setTimeout(() => replyTextareaRef.current?.focus(), 50);
  };

  const handleReplyInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyBody(e.target.value);
    setReplyError(null);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  };

  const handleReplySubmit = async () => {
    const trimmed = replyBody.trim();
    if (!trimmed || !isAuthenticated) return;
    if (trimmed.length > MAX_LENGTH) {
      setReplyError(`Reply must be ${MAX_LENGTH} characters or fewer`);
      return;
    }

    setSubmittingReply(true);
    setReplyError(null);

    // Optimistic insert
    const optimisticId = `optimistic-reply-${Date.now()}`;
    const optimisticReply: Reply = {
      id: optimisticId,
      parentId: signal.id,
      memberId: currentMemberId!,
      name: currentMemberName ?? "Member",
      body: trimmed,
      createdAt: new Date().toISOString(),
    };

    setReplies((prev) => [...prev, optimisticReply]);
    setReplyCount((c) => c + 1);
    setRepliesExpanded(true);
    setReplyBody("");
    setReplyOpen(false);
    if (replyTextareaRef.current) replyTextareaRef.current.style.height = "auto";

    try {
      const res = await fetch(
        `/api/replies/${encodeURIComponent(signal.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: trimmed }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post reply");
      }
      const data = await res.json();
      setReplies((prev) =>
        prev.map((r) => (r.id === optimisticId ? data.reply : r))
      );
    } catch (err) {
      setReplies((prev) => prev.filter((r) => r.id !== optimisticId));
      setReplyCount((c) => Math.max(0, c - 1));
      setReplyError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    setDeletingReplyId(replyId);
    try {
      const res = await fetch(
        `/api/replies/${encodeURIComponent(signal.id)}?replyId=${encodeURIComponent(replyId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setReplies((prev) => prev.filter((r) => r.id !== replyId));
        setReplyCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // silent
    } finally {
      setDeletingReplyId(null);
    }
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleReplySubmit();
    }
    if (e.key === "Escape") {
      setReplyOpen(false);
    }
  };

  return (
    <div className="signal-card">
      {/* Top row: avatar + name + time + delete */}
      <div className="signal-card-top">
        <SignalAvatar name={signal.name} memberId={signal.memberId} size={36} />
        <div className="signal-card-meta">
          <span className="signal-card-name">{signal.name}</span>
          <span className="signal-card-time">{relativeTime(signal.createdAt)}</span>
        </div>
        {isOwn && onDelete && (
          <div className="signal-card-actions">
            {!showConfirm ? (
              <button
                className="signal-delete-btn"
                onClick={() => setShowConfirm(true)}
                aria-label="Delete signal"
                title="Delete your signal"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            ) : (
              <div className="signal-confirm-delete">
                <button className="signal-confirm-yes" onClick={() => onDelete(signal.id)} disabled={isDeleting}>
                  {isDeleting ? "…" : "Delete"}
                </button>
                <button className="signal-confirm-no" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <p className="signal-card-body">{signal.body}</p>

      {/* Action row: Reply + View replies toggle */}
      <div className="signal-card-footer">
        <button className="signal-reply-btn" onClick={handleReplyClick}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 17 4 12 9 7" />
            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
          </svg>
          Reply
        </button>

        {replyCount > 0 && (
          <button className="signal-reply-toggle" onClick={handleToggleReplies}>
            {repliesExpanded ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                Hide replies
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                View {replyCount} {replyCount === 1 ? "reply" : "replies"}
              </>
            )}
          </button>
        )}
      </div>

      {/* Inline reply compose */}
      {replyOpen && isAuthenticated && (
        <div className="signal-reply-compose">
          <textarea
            ref={replyTextareaRef}
            className="signal-reply-textarea"
            placeholder={`Reply to ${signal.name}…`}
            value={replyBody}
            onChange={handleReplyInput}
            onKeyDown={handleReplyKeyDown}
            maxLength={MAX_LENGTH}
            rows={1}
            disabled={submittingReply}
          />
          <div className="signal-reply-compose-footer">
            <button className="signal-reply-cancel" onClick={() => { setReplyOpen(false); setReplyBody(""); }}>
              Cancel
            </button>
            <span className={`post-signals-char-count ${remaining <= 50 ? "warning" : ""} ${remaining <= 0 ? "over" : ""}`}>
              {remaining}
            </span>
            <button
              className="post-signals-submit"
              onClick={handleReplySubmit}
              disabled={submittingReply || replyBody.trim().length === 0}
            >
              {submittingReply ? <span className="post-signals-spinner" /> : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Send
                </>
              )}
            </button>
          </div>
          {replyError && <p className="post-signals-error">{replyError}</p>}
        </div>
      )}

      {/* Replies thread */}
      {repliesExpanded && (
        <div className="reply-thread">
          {loadingReplies ? (
            <div className="post-signals-loading">
              <span className="post-signals-spinner" />
              <span>Loading replies…</span>
            </div>
          ) : replies.length === 0 ? (
            <p className="reply-thread-empty">No replies yet.</p>
          ) : (
            replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                currentMemberId={currentMemberId}
                onDelete={handleDeleteReply}
                isDeleting={deletingReplyId === reply.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
