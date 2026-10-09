"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import SignInModal from "./SignInModal";
import { clearPendingScores, flushPendingScores } from "../lib/pendingScores";

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
  signUpWithEmail: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  openSignIn: (context?: SignInContext) => void;
}
const AuthContext = createContext<AuthContextType>({
  member: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
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
  const [signInContext, setSignInContext] = useState<SignInContext | null>(
    null,
  );
  const clearError = useCallback(() => setError(null), []);
  const openSignIn = useCallback((context?: SignInContext) => {
    setSignInContext(context ?? null);
    setSignInOpen(true);
  }, []);
  const closeSignIn = useCallback(() => {
    setSignInOpen(false);
    setSignInContext(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setMember(data.authenticated ? data.member : null);
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

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        const message = data.error || "Sign-in failed";
        setError(message);
        throw new Error(message);
      }
      setMember(data.member);
      flushPendingScores();
    },
    [],
  );
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }, []);
  const signUpWithEmail = useCallback(
    async (fullName: string, email: string, password: string) => {
      setError(null);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        const message = data.error || "Account creation failed";
        setError(message);
        throw new Error(message);
      }
      setMember(data.member);
      flushPendingScores();
    },
    [],
  );
  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } finally {
      setMember(null);
      clearPendingScores();
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
        signUpWithEmail,
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
