import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type Auth,
} from "firebase/auth";

// Client-side Firebase, ported from GDGWebsite/lib/firebase.ts (same project,
// separate app instance — RADAR runs its own session rather than sharing
// GDGWebsite's localStorage tokens across origins).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Only initialize on the client, and never let a missing/invalid Firebase
// config crash the site: getAuth() throws auth/invalid-api-key at module
// evaluation, and this module is imported from the root layout via
// AuthProvider. RADAR must keep working anonymously when auth env isn't
// set (same philosophy as app/lib/member.ts) — sign-in just stays
// unavailable.
if (typeof window !== "undefined") {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch {
    app = undefined;
    auth = undefined;
    googleProvider = undefined;
  }
}

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  firebaseSignOut,
};
export type { FirebaseUser };
