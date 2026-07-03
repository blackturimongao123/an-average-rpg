import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useGameStore } from "@/stores/gameStore";
import { useAuthStore } from "@/stores/authStore";
import { Coins, Heart, Star, LogOut, User, Skull } from "lucide-react";

export function TopBar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { lineage, heir, loading } = useGameStore();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const maxHp = heir ? 50 + heir.stats.constitution * 10 + heir.level * 8 : 0;
  const xpForNextLevel = heir ? heir.level * 100 : 100;
  const xpProgress = heir ? (heir.xp / xpForNextLevel) * 100 : 0;

  return (
    <header className="h-16 bg-secondary/30 border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : heir ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-sm font-semibold text-foreground">
                  {heir.name}
                </h2>
                <p className="text-xs text-muted-foreground capitalize">
                  Level {heir.level} {heir.classId}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">{maxHp}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-blue-400" />
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{heir.xp}</span>
                <span className="text-xs text-muted-foreground">/ {xpForNextLevel}</span>
              </div>
              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium gold-text">{heir.gold}</span>
            </div>
          </>
        ) : lineage ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blood/20 flex items-center justify-center">
              <Skull className="w-5 h-5 text-blood" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-foreground">
                House {lineage.familyName}
              </h2>
              <p className="text-xs text-muted-foreground">
                Generation {lineage.generation} - No living heir
              </p>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">Create your bloodline</div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {lineage && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Bank:</span>
            <Coins className="w-4 h-4 text-gold" />
            <span className="gold-text">{lineage.bankGold}</span>
          </div>
        )}

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
