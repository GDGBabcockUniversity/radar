"use client";

import { useState } from "react";

interface NewsletterFormProps {
  variant?: "default" | "footer";
  className?: string;
}

export default function NewsletterForm({
  variant = "default",
  className = "",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // TODO: Implement actual subscription logic
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1000);
  };

  const isFooter = variant === "footer";

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div
        className={`
          flex items-center gap-2
          ${isFooter ? "flex-col" : "flex-col sm:flex-row"}
        `}
      >
        {/* Email Input */}
        <div className="relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`
              w-full pl-12 pr-4 py-3
              bg-[var(--color-bg-dark-card)] text-white
              border border-[var(--color-border-dark)]
              rounded-full
              placeholder:text-[var(--color-text-muted)]
              focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]
              transition-all duration-200
            `}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className={`
            inline-flex items-center justify-center gap-2
            px-6 py-3
            bg-[var(--color-primary)] text-white font-medium
            rounded-full
            hover:bg-[var(--color-primary-hover)]
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${isFooter ? "w-full" : "w-full sm:w-auto whitespace-nowrap"}
          `}
        >
          {status === "loading" ? (
            <span className="animate-spin">⏳</span>
          ) : status === "success" ? (
            <>
              Subscribed
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          ) : (
            <>
              Subscribe
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      {!isFooter && (
        <p className="mt-3 text-xs text-center text-[var(--color-text-muted)]">
          No spam. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
