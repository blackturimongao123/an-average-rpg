import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/stores/gameStore";
import { useAuthStore } from "@/stores/authStore";
import { createPlayerHeir } from "@/firebase/createAccount";
import { ClassIcon } from "@/lib/classIcons";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import { Shield, Zap, Eye, Heart, Flame, Sparkles } from "lucide-react";
import { NAME_VALIDATION_MESSAGE } from "@/lib/validation";
import type { ClassData } from "@bloodline/shared/types";

import classesData from "@game-data/classes.json";

const classes = classesData.classes as ClassData[];

const statIcons: Record<string, typeof Shield> = {
  strength: Shield,
  dexterity: Zap,
  intelligence: Eye,
  constitution: Heart,
  luck: Sparkles,
  charisma: Flame,
  faith: Heart,
  infamy: Eye,
};

export function HeirCreationPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { lineage, setHeir, setLineage } = useGameStore();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [heirName, setHeirName] = useState("");
  const [error, setError] = useState("");

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  const handleCreateHeir = () => {
    if (!lineage || !selectedClass || !heirName.trim() || !user) {
      setError("Please select a class and enter a name");
      return;
    }

    setError("");
    try {
      const result = createPlayerHeir(user.uid, lineage, selectedClass, heirName.trim());
      setHeir(result.heir);
      setLineage({
        ...lineage,
        activeHeirId: result.heirId,
        publicSummary: { ...lineage.publicSummary, currentClass: selectedClass },
      });
      navigate("/character");
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    }
  };

  if (!lineage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading lineage data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          House {lineage.familyName}
        </h1>
        <p className="text-muted-foreground">
          Generation {lineage.generation} - Choose your new heir
        </p>
      </div>

      <div className="mb-8">
        <label htmlFor="heirName" className="label block mb-2 text-center">
          Name Your Heir
        </label>
        <input
          id="heirName"
          type="text"
          value={heirName}
          onChange={(e) => setHeirName(e.target.value)}
          className="input max-w-sm mx-auto block"
          placeholder={`${lineage.familyName} the Brave`}
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground mt-2 text-center max-w-sm mx-auto">
          {NAME_VALIDATION_MESSAGE}
        </p>
      </div>

      <h2 className="font-display text-xl font-semibold text-center mb-4">
        Choose Your Class
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {classes.map((cls) => {
          const isSelected = selectedClass === cls.id;

          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`card p-4 text-left transition-all hover:border-primary/50 ${
                isSelected ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-primary/20" : "bg-secondary"
                  }`}
                >
                  <ClassIcon classId={cls.id} size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cls.description}
                  </p>
                  <p className="text-xs text-primary mt-2">
                    Main stat: {cls.mainStat}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedClassData && (
        <div className="card p-6 mb-6">
          <h3 className="font-display font-semibold mb-4">
            {selectedClassData.name} Starting Stats
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(selectedClassData.startingStats).map(([stat, value]) => {
              const StatIcon = statIcons[stat] || Shield;
              return (
                <div
                  key={stat}
                  className="flex items-center gap-2 p-2 rounded-md bg-secondary/50"
                >
                  <StatIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {stat}
                    </p>
                    <p className="font-semibold">{value as number}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedClassData.flavorText && (
            <p className="text-sm italic text-muted-foreground mt-4 text-center">
              "{selectedClassData.flavorText}"
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/20 text-destructive text-sm text-center mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleCreateHeir}
          disabled={!selectedClass || !heirName.trim()}
          className="btn-primary px-8 py-3 text-lg"
        >
          Begin Your Journey
        </button>
      </div>
    </div>
  );
}
