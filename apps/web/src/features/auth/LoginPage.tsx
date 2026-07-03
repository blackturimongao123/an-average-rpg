import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const hasLineage = await userHasLineage(user.uid);

      if (!hasLineage) {
        await signOut(auth);
        setError("This account has no bloodline. Registration is closed.");
        return;
      }

      navigate("/character");
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="card-title text-center mb-6">Continue Your Legacy</h2>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Every hero dies. Your bloodline endures.
        </p>
      </div>
    </div>
  );
}
