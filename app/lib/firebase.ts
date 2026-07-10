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
let auth: Auth;
let googleProvider: GoogleAuthProvider;

// Only initialize on the client — avoids SSR/build-time errors when the env
// vars aren't set (auth stays a no-op, matching the rest of the CREDENTIALS
// pattern in app/lib/constants.ts).
if (typeof window !== "undefined") {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  firebaseSignOut,
};
export type { FirebaseUser };
