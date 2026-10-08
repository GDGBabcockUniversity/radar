"use client";

import { useState } from "react";
import SignalAvatar from "./SignalAvatar";
import type { Reply } from "../api/replies/[signalId]/route";

interface ReplyCardProps {
  reply: Reply;
  currentMemberId?: string;
  onDelete?: (replyId: string) => void;
  isDeleting?: boolean;
}

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

export default function ReplyCard({
  reply,
  currentMemberId,
  onDelete,
  isDeleting,
}: ReplyCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isOwn = currentMemberId === reply.memberId;

  return (
    <div className="reply-card">
      <div className="reply-card-top">
        <SignalAvatar name={reply.name} memberId={reply.memberId} size={28} />
        <div className="reply-card-meta">
          <span className="reply-card-name">{reply.name}</span>
          <span className="reply-card-time">{relativeTime(reply.createdAt)}</span>
        </div>
        {isOwn && onDelete && (
          <div className="signal-card-actions">
            {!showConfirm ? (
              <button
                className="signal-delete-btn"
                onClick={() => setShowConfirm(true)}
                aria-label="Delete reply"
                title="Delete your reply"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            ) : (
              <div className="signal-confirm-delete">
                <button
                  className="signal-confirm-yes"
                  onClick={() => onDelete(reply.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "…" : "Delete"}
                </button>
                <button
                  className="signal-confirm-no"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="reply-card-body">{reply.body}</p>
    </div>
  );
}
