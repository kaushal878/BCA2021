import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export type FirebaseHandles = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  googleProvider: GoogleAuthProvider;
};

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId
);

let handles: FirebaseHandles | null = null;

export const getFirebase = (): FirebaseHandles | null => {
  if (!isFirebaseConfigured) return null;
  if (handles) return handles;
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const googleProvider = new GoogleAuthProvider();
  handles = { app, auth, db, storage, googleProvider };
  return handles;
};

export const adminEmails = (
  import.meta.env.VITE_ADMIN_EMAILS as string | undefined
)
  ?.split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean) ?? [];

export const isAdminEmail = (email?: string | null) =>
  Boolean(email && adminEmails.includes(email.toLowerCase()));
