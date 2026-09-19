import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App | undefined;

/**
 * Lazily initializes the Firebase Admin app from FIREBASE_SERVICE_ACCOUNT
 * (a JSON string — the full service account key downloaded from Firebase
 * Console > Project settings > Service accounts > Generate new private key).
 *
 * Returns null (rather than throwing) when the env var isn't set, so the
 * rest of the server still boots fine for deployments that only use the
 * existing email/password auth and haven't set up Firebase.
 */
function getFirebaseApp(): App | null {
  if (app) return app;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;

  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not valid JSON. Paste the full contents of the " +
        "service account key file Firebase Console gives you, as a single-line JSON string.",
    );
  }

  app = initializeApp({ credential: cert(serviceAccount as never) });
  return app;
}

export function isFirebaseConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT;
}

/**
 * Verifies a Firebase ID token sent from the frontend after a successful
 * Firebase Authentication sign-in. Throws if the token is missing/invalid/
 * expired, or if Firebase hasn't been configured on this server.
 */
export async function verifyFirebaseIdToken(idToken: string) {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    throw new Error(
      "Firebase Authentication is not configured on this server. Set FIREBASE_SERVICE_ACCOUNT (see .env.example).",
    );
  }
  return getAuth(firebaseApp).verifyIdToken(idToken);
}
