import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Only initialize when configured, so the app still runs (with the Firebase
// sign-in options simply hidden) in environments that haven't set up
// Firebase yet — see .env.example.
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = app ? getAuth(app) : null;

const googleProvider = new GoogleAuthProvider();

function requireAuth() {
  if (!firebaseAuth) {
    throw new Error(
      'Firebase is not configured. Set VITE_FIREBASE_* environment variables — see .env.example.',
    );
  }
  return firebaseAuth;
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(requireAuth(), googleProvider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(requireAuth(), email, password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(requireAuth(), email, password);
  return result.user;
}

export async function signOutOfFirebase(): Promise<void> {
  if (!firebaseAuth) return;
  await firebaseSignOut(firebaseAuth);
}

export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

export type { FirebaseUser };
