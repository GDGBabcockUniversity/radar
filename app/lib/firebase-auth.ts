"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";

let ready: ReturnType<typeof initializeAuth> | undefined;
async function initializeAuth() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (
    !config.apiKey ||
    !config.authDomain ||
    !config.projectId ||
    !config.appId
  )
    throw new Error("Firebase sign-in is not configured");
  const app =
    getApps().find((app) => app.name === "radar-auth") ??
    initializeApp(config, "radar-auth");
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  return auth;
}

export function firebaseAuth() {
  ready ??= initializeAuth().catch((error) => {
    ready = undefined;
    throw error;
  });
  return ready;
}
