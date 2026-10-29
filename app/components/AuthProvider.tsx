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

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { firebaseAuth, firebaseAuthIfReady } from "../lib/firebase-auth";

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
    // Warm up Firebase so Google popup sign-in can start synchronously.
    firebaseAuth().catch(() => {});
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

  const exchangeIdentity = useCallback(async (user: User) => {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_token: await user.getIdToken(true) }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success)
      throw new Error(data.error || "Sign-in failed");
    setMember(data.member);
    flushPendingScores();
  }, []);

  const authenticate = useCallback(
    async (login: () => Promise<User>) => {
      setError(null);
      try {
        await exchangeIdentity(await login());
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Sign-in failed";
        setError(message);
        throw new Error(message);
      } finally {
        const auth = await firebaseAuth().catch(() => null);
        if (auth) await firebaseSignOut(auth);
      }
    },
    [exchangeIdentity],
  );

  const signInWithEmail = useCallback(
    (email: string, password: string) =>
      authenticate(async () => {
        const credential = await signInWithEmailAndPassword(
          await firebaseAuth(),
          email,
          password,
        );
        return credential.user;
      }),
    [authenticate],
  );
  const signInWithGoogle = useCallback(
    () =>
      authenticate(async () => {
        const auth = firebaseAuthIfReady();
        const credential = await signInWithPopup(
          auth ?? (await firebaseAuth()),
          new GoogleAuthProvider(),
        );
        return credential.user;
      }),
    [authenticate],
  );
  const signUpWithEmail = useCallback(
    (fullName: string, email: string, password: string) =>
      authenticate(async () => {
        if (!fullName.trim()) throw new Error("Full name is required");
        const credential = await createUserWithEmailAndPassword(
          await firebaseAuth(),
          email,
          password,
        );
        await updateProfile(credential.user, { displayName: fullName.trim() });
        return credential.user;
      }),
    [authenticate],
  );
  const signOut = useCallback(async () => {
    const response = await fetch("/api/auth/session", { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Sign-out failed");
      if (response.status !== 503)
        throw new Error(data.error || "Sign-out failed");
    }
    setMember(null);
    clearPendingScores();
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
