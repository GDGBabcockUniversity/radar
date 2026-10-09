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
  const { signInWithEmail, signUpWithEmail, error, clearError } = useAuth();
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
            {mode === "signin" ? title ?? "Sign in to RADAR" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-content-muted">
            {mode === "signin"
              ? message ??
                "Use your GDG Babcock account to track reads and game scores on your profile."
              : "Create a GDG Babcock account to save your reads and game scores."}
          </p>

          <form onSubmit={handleEmailSubmit} className="mt-6 space-y-3">
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
    document.body
  );
}
