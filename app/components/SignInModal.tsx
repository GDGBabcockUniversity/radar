"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Situational copy (e.g. the post-game prompt); defaults are generic. */
  title?: string;
  message?: string;
}

export default function SignInModal({
  isOpen,
  onClose,
  title,
  message,
}: SignInModalProps) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    error,
    clearError,
  } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portals need a real `document`, which doesn't exist during SSR.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(fullName, email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : error || (mode === "signup" ? "Sign-up failed" : "Sign-in failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className="animate-backdrop-fade fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          clearError();
          onClose();
        }}
      />
      {/* Bottom sheet on phones, gently rising card on larger screens. */}
      <div className="relative z-[10000] flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div className="animate-sheet-up w-full max-w-none rounded-t-3xl rounded-b-none border border-edge bg-surface p-8 pb-10 shadow-2xl sm:max-w-sm sm:rounded-2xl sm:pb-8">
          <h2 className="text-xl font-semibold text-content">
            {mode === "signin"
              ? (title ?? "Sign in to RADAR")
              : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-content-muted">
            {mode === "signin"
              ? (message ??
                "Use your GDG Babcock account to track reads and game scores on your profile.")
              : "Create a GDG Babcock account to save your reads and game scores."}
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-edge bg-white px-4 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-edge" />
            <span className="text-xs uppercase tracking-wider text-content-subtle">
              or
            </span>
            <div className="h-px flex-1 bg-edge" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                autoComplete="name"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-edge bg-transparent px-4 py-3 text-sm text-content placeholder:text-content-subtle focus:outline-none"
              />
            )}
            <input
              type="email"
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-edge bg-transparent px-4 py-3 text-sm text-content placeholder:text-content-subtle focus:outline-none"
            />
            <input
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "signup" ? 12 : undefined}
              disabled={loading}
              className="w-full rounded-xl border border-edge bg-transparent px-4 py-3 text-sm text-content placeholder:text-content-subtle focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading
                ? mode === "signin"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-content-muted">
            {mode === "signin"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                clearError();
              }}
              className="font-semibold text-primary hover:underline disabled:opacity-50"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full text-center text-xs text-content-muted hover:text-content"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
