import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { GameShell } from "./components/layout/GameShell";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import { useAppVersionRefresh } from "./hooks/useAppVersionRefresh";

const LoginPage = lazy(() => import("./features/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const HeirCreationPage = lazy(() => import("./features/heir/HeirCreationPage").then((m) => ({ default: m.HeirCreationPage })));
const TavernPage = lazy(() => import("./features/tavern/TavernPage").then((m) => ({ default: m.TavernPage })));
const DungeonsPage = lazy(() => import("./features/dungeons/DungeonsPage").then((m) => ({ default: m.DungeonsPage })));
const JobsPage = lazy(() => import("./features/jobs/JobsPage").then((m) => ({ default: m.JobsPage })));
const BankPage = lazy(() => import("./features/bank/BankPage").then((m) => ({ default: m.BankPage })));
const BloodlinePage = lazy(() => import("./features/bloodline/BloodlinePage").then((m) => ({ default: m.BloodlinePage })));
const SkillsPage = lazy(() => import("./features/skills/SkillsPage").then((m) => ({ default: m.SkillsPage })));
const CharacterPage = lazy(() => import("./features/character/CharacterPage").then((m) => ({ default: m.CharacterPage })));
const MerchantPage = lazy(() => import("./features/merchant/MerchantPage").then((m) => ({ default: m.MerchantPage })));
const ProfilePage = lazy(() => import("./features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));

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

  useAppVersionRefresh();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading…</div>}>
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
    </Suspense>
  );
}
