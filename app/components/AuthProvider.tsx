"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  firebaseSignOut,
  onIdTokenChanged,
  type FirebaseUser,
} from "../lib/firebase";
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
  const [sessionChecked, setSessionChecked] = useState(false);

  // Mirrors `member` for the Firebase listener below, which must know whether
  // a session already exists without re-subscribing on every member change.
  const hasSessionRef = useRef(false);
  // Set on explicit sign-out. Firebase's own sign-out is best-effort, so
  // without this a failed firebaseSignOut() would let the listener below
  // immediately rebuild the session the user just asked us to end.
  const signedOutRef = useRef(false);
  const applyMember = useCallback((next: Member | null) => {
    hasSessionRef.current = !!next;
    setMember(next);
  }, []);

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
  // valid — avoids re-verifying against Firebase on every load. The route
  // also renews a lapsed token from the refresh cookie, so a day-old session
  // comes back here already restored.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          applyMember(data.authenticated ? data.member : null);
          // Anything played anonymously on this device gets claimed as soon
          // as a signed-in session is confirmed.
          if (data.authenticated) flushPendingScores();
        }
      })
      .catch(() => {
        if (!cancelled) applyMember(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setSessionChecked(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applyMember]);

  const exchangeToken = useCallback(
    async (firebaseUser: FirebaseUser) => {
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
      applyMember(data.member);
      // The session cookie is set now, so queued anonymous scores can land
      // under this member.
      flushPendingScores();
    },
    [applyMember]
  );

  // Last line of defence for the gap the refresh cookie can't cover — it was
  // revoked, or it outlived its 7 days. Firebase keeps its own session in
  // localStorage and silently refreshes the ID token regardless, so when it
  // still knows this user we can rebuild the platform session in the
  // background rather than showing them a sign-in prompt they don't need.
  // Waits for the session check so a healthy cookie never triggers a
  // redundant re-login on page load.
  useEffect(() => {
    if (!auth || !sessionChecked) return;
    return onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || hasSessionRef.current || signedOutRef.current) return;
      try {
        await exchangeToken(firebaseUser);
      } catch {
        // Leave them signed out — the sign-in modal is still there.
      }
    });
  }, [sessionChecked, exchangeToken]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      if (!auth || !googleProvider) {
        throw new Error("Sign-in is not configured on this deployment");
      }
      const result = await signInWithPopup(auth, googleProvider);
      signedOutRef.current = false;
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
        signedOutRef.current = false;
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
    signedOutRef.current = true;
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      if (auth) await firebaseSignOut(auth);
    } catch {
      // best effort
    } finally {
      applyMember(null);
      // Whatever was queued anonymously on this browser dies with the
      // session — the next account to sign in here must not inherit it.
      clearPendingScores();
    }
  }, [applyMember]);

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
