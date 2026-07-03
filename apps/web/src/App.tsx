import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { GameShell } from "./components/layout/GameShell";
import { LoginPage } from "./features/auth/LoginPage";
import { HeirCreationPage } from "./features/heir/HeirCreationPage";
import { TavernPage } from "./features/tavern/TavernPage";
import { DungeonsPage } from "./features/dungeons/DungeonsPage";
import { JobsPage } from "./features/jobs/JobsPage";
import { BankPage } from "./features/bank/BankPage";
import { BloodlinePage } from "./features/bloodline/BloodlinePage";
import { SkillsPage } from "./features/skills/SkillsPage";
import { CharacterPage } from "./features/character/CharacterPage";
import { MerchantPage } from "./features/merchant/MerchantPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <GameShell>
              <Routes>
                <Route path="/" element={<Navigate to="/character" replace />} />
                <Route path="/create-heir" element={<HeirCreationPage />} />
                <Route path="/character" element={<CharacterPage />} />
                <Route path="/tavern" element={<TavernPage />} />
                <Route path="/dungeons" element={<DungeonsPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/bank" element={<BankPage />} />
                <Route path="/bloodline" element={<BloodlinePage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/merchant" element={<MerchantPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </GameShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
