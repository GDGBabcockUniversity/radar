"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  firebaseSignOut,
  type FirebaseUser,
} from "../lib/firebase";
import SignInModal from "./SignInModal";
import { flushPendingScores } from "../lib/pendingScores";

interface Member {
  memberId: string;
  name?: string;
  email?: string;
}

export interface SignInContext {
  title?: string;
  message?: string;
}

interface AuthContextType {
  member: Member | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  /**
   * Opens the sign-in modal from anywhere in the tree — not just the header.
   * Optional context swaps in situational copy (e.g. the post-game prompt).
   */
  openSignIn: (context?: SignInContext) => void;
}

const AuthContext = createContext<AuthContextType>({
  member: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
  clearError: () => {},
  openSignIn: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInContext, setSignInContext] = useState<SignInContext | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const openSignIn = useCallback((context?: SignInContext) => {
    setSignInContext(context ?? null);
    setSignInOpen(true);
  }, []);
  const closeSignIn = useCallback(() => {
    setSignInOpen(false);
    setSignInContext(null);
  }, []);

  // On mount: ask the server whether the gdg_token cookie is present and
  // valid — avoids re-verifying against Firebase on every load.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setMember(data.authenticated ? data.member : null);
          // Anything played anonymously on this device gets claimed as soon
          // as a signed-in session is confirmed.
          if (data.authenticated) flushPendingScores();
        }
      })
      .catch(() => {
        if (!cancelled) setMember(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const exchangeToken = useCallback(async (firebaseUser: FirebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_token: idToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Sign-in failed");
    }
    setMember(data.member);
    // The session cookie is set now, so queued anonymous scores can land
    // under this member.
    flushPendingScores();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      if (!auth || !googleProvider) {
        throw new Error("Sign-in is not configured on this deployment");
      }
      const result = await signInWithPopup(auth, googleProvider);
      await exchangeToken(result.user);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
      throw err;
    }
  }, [exchangeToken]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        if (!auth) {
          throw new Error("Sign-in is not configured on this deployment");
        }
        const result = await signInWithEmailAndPassword(auth, email, password);
        await exchangeToken(result.user);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Sign-in failed";
        setError(message);
        throw err;
      }
    },
    [exchangeToken]
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      if (auth) await firebaseSignOut(auth);
    } catch {
      // best effort
    } finally {
      setMember(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        member,
        loading,
        error,
        isAuthenticated: !!member,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        clearError,
        openSignIn,
      }}
    >
      {children}
      <SignInModal
        isOpen={signInOpen}
        onClose={closeSignIn}
        title={signInContext?.title}
        message={signInContext?.message}
      />
    </AuthContext.Provider>
  );
}
