import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { createPlayerBloodline } from "@/firebase/createAccount";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import {
  isUsernameAllowed,
  normalizeUsername,
  validateFamilyName,
  validateUsername,
  USERNAME_VALIDATION_MESSAGE,
} from "@/lib/validation";

const ALLOW_REGISTRATION = import.meta.env.VITE_ALLOW_REGISTRATION !== "false";
const googleProvider = new GoogleAuthProvider();

async function userHasLineage(userId: string): Promise<boolean> {
  const lineagesQuery = query(
    collection(db, "lineages"),
    where("ownerUid", "==", userId),
    limit(1)
  );
  const snapshot = await getDocs(lineagesQuery);
  return !snapshot.empty;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finishBloodlineSetup = async (userId: string) => {
    const trimmedFamilyName = familyName.trim();
    const normalizedUsername = normalizeUsername(username);

    if (!validateUsername(normalizedUsername)) {
      throw new Error(USERNAME_VALIDATION_MESSAGE);
    }

    if (!isUsernameAllowed(normalizedUsername)) {
      throw new Error("That username is not on the invite list");
    }

    if (!validateFamilyName(trimmedFamilyName)) {
      throw new Error(
        "Family name must be 2-30 characters. Spaces and special characters are allowed, but not /."
      );
    }

    await createPlayerBloodline(userId, trimmedFamilyName, normalizedUsername);
    navigate("/create-heir");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!ALLOW_REGISTRATION) {
          setError("Registration is currently closed. Contact the game admin.");
          return;
        }

        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await finishBloodlineSetup(user.uid);
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        const hasLineage = await userHasLineage(user.uid);

        if (!hasLineage) {
          if (ALLOW_REGISTRATION) {
            setNeedsProfileSetup(true);
          } else {
            await signOut(auth);
            setError("Registration is closed and this account has no bloodline yet.");
          }
          return;
        }

        navigate("/character");
      }
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;
    if (!user) {
      setError("You must be signed in first.");
      return;
    }

    setLoading(true);

    try {
      await finishBloodlineSetup(user.uid);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const hasLineage = await userHasLineage(user.uid);

      if (hasLineage) {
        navigate("/character");
        return;
      }

      if (!ALLOW_REGISTRATION) {
        await signOut(auth);
        setError("Registration is closed. Ask the game admin for an invite.");
        return;
      }

      setNeedsProfileSetup(true);
      setIsSignUp(false);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const showSignupFields = isSignUp || needsProfileSetup;
  const title = needsProfileSetup
    ? "Finish Your Profile"
    : isSignUp
      ? "Begin Your Bloodline"
      : "Continue Your Legacy";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-gold mb-2">
            An Average RPG
          </h1>
          <p className="text-muted-foreground">
            A roguelite RPG where death is just the beginning
          </p>
        </div>

        <div className="card p-6">
          <h2 className="card-title text-center mb-6">{title}</h2>

          {!needsProfileSetup && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-secondary w-full mb-4 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or use email</span>
                </div>
              </div>
            </>
          )}

          <form
            onSubmit={needsProfileSetup ? handleProfileSetup : handleEmailSubmit}
            className="space-y-4"
          >
            {!needsProfileSetup && (
              <>
                <div>
                  <label htmlFor="email" className="label block mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label block mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                    required={!needsProfileSetup}
                    minLength={6}
                  />
                </div>
              </>
            )}

            {showSignupFields && (
              <>
                <div>
                  <label htmlFor="username" className="label block mb-1.5">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input"
                    placeholder="Your name"
                    required
                    minLength={2}
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {USERNAME_VALIDATION_MESSAGE}
                  </p>
                </div>

                <div>
                  <label htmlFor="familyName" className="label block mb-1.5">
                    Family Name
                  </label>
                  <input
                    id="familyName"
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="input"
                    placeholder="Ashworth"
                    required
                    minLength={2}
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your bloodline's name that will echo through generations
                  </p>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 rounded-md bg-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading
                ? "Loading..."
                : needsProfileSetup || isSignUp
                  ? "Create Bloodline"
                  : "Sign In"}
            </button>
          </form>

          {needsProfileSetup && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={async () => {
                  await signOut(auth);
                  setNeedsProfileSetup(false);
                  setUsername("");
                  setFamilyName("");
                  setError("");
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Use a different account
              </button>
            </div>
          )}

          {!needsProfileSetup && ALLOW_REGISTRATION && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "New to the realm? Create your bloodline"}
              </button>
            </div>
          )}

          {!ALLOW_REGISTRATION && !isSignUp && !needsProfileSetup && (
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Registration is closed. Friends-only game.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Every hero dies. Your bloodline endures.
        </p>
      </div>
    </div>
  );
}
