"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";
import { cn } from "../lib/utils";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { signInWithGoogle, signInWithEmail, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portals need a real `document`, which doesn't exist during SSR.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      toast.error(error || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch {
      toast.error(error || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          clearError();
          onClose();
        }}
      />
      <div className="relative z-[10000] flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-edge bg-surface p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-content">
            Sign in to RADAR
          </h2>
          <p className="mt-2 text-sm text-content-muted">
            Use your GDG Babcock account to track reads and game scores on
            your profile.
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className={cn(
              "mt-6 flex w-full items-center justify-center gap-2 rounded-full",
              "bg-white px-4 py-3 text-sm font-medium text-black transition-transform",
              "hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-edge" />
            <span className="text-xs uppercase tracking-wider text-content-subtle">
              or
            </span>
            <div className="h-px flex-1 bg-edge" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-edge bg-transparent px-4 py-3 text-sm text-content placeholder:text-content-subtle focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-edge bg-transparent px-4 py-3 text-sm text-content placeholder:text-content-subtle focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

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
