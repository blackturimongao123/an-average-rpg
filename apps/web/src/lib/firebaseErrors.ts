import { FirebaseError } from "firebase/app";

const friendlyMessages: Record<string, string> = {
  "auth/email-already-in-use": "That email is already registered.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/unauthorized-domain":
    "This site is not authorized for sign-in. Add it in Firebase Auth → Settings → Authorized domains.",
  "functions/not-found":
    "Game server is not available yet. Check that the latest Firebase deployment completed.",
  "functions/unavailable":
    "Game server is temporarily unavailable. Please try again in a moment.",
  "functions/internal":
    "The game server could not complete that action. Please try again.",
  "functions/already-exists": "You already have a bloodline.",
  "functions/invalid-argument": "Invalid family name or username.",
  "functions/unauthenticated": "You must be signed in first.",
  "permission-denied":
    "Database access denied. Firestore rules may need updating — try again after the latest deploy.",
};

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code?.startsWith("functions/") && error.message && error.message !== "INTERNAL") {
      return error.message;
    }
    return friendlyMessages[error.code] ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function isFunctionsUnavailable(error: unknown): boolean {
  if (!(error instanceof FirebaseError)) return false;

  return ["functions/not-found", "functions/unavailable"].includes(error.code);
}
