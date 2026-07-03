import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { SkillWebCanvas } from "@/components/skills/SkillWebCanvas";
import { claimPlayerSkill } from "@/firebase/skills";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import {
  canClaimSkill,
  filterBloodlineSkills,
  getCharacterWebSkills,
  getBloodlinePointsRemaining,
  getBloodlineSkillPoints,
  getCharacterSkillPoints,
} from "@/lib/skills";
import type { SkillNode } from "@bloodline/shared/types";
import { AlertCircle, Check, Crown, Scroll, Skull, X } from "lucide-react";

export function SkillsPage() {
  const { user } = useAuthStore();
  const {
    lineage,
    heir,
    addSkillToHeir,
    addBloodlineSkill,
    setHeirSubclass,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<"character" | "bloodline">("character");
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!heir || !lineage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Create an heir to view skills</p>
      </div>
    );
  }

  const characterSkills = getCharacterWebSkills(heir);
  const bloodlineSkills = filterBloodlineSkills();
  const bloodlineOwned = lineage.bloodlineSkillIds ?? [];
  const characterPoints = getCharacterSkillPoints(heir);
  const bloodlinePoints = getBloodlinePointsRemaining(lineage);

  const ownedForTab =
    activeTab === "bloodline" ? bloodlineOwned : heir.skillIds;

  const validateClaim = (skill: SkillNode) =>
    canClaimSkill(skill, {
      heir,
      lineage,
      ownedSkillIds: ownedForTab,
      treeScope: activeTab,
    });

  const handleClaimSkill = async () => {
    if (!user || !selectedSkill) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await claimPlayerSkill(user.uid, lineage.id, heir.id, selectedSkill.id);

      if (activeTab === "bloodline") {
        addBloodlineSkill(selectedSkill.id);
      } else {
        addSkillToHeir(selectedSkill.id);
        if ("subclassId" in result && result.subclassId && result.subclassTier) {
          setHeirSubclass(result.subclassId, result.subclassTier);
        }
      }

      setMessage({ type: "success", text: `Learned ${selectedSkill.name}!` });
      setSelectedSkill(null);
    } catch (error: unknown) {
      setMessage({ type: "error", text: getFirebaseErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] w-full max-w-none -m-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Scroll className="w-8 h-8 text-gold" />
          <div>
            <h1 className="font-display text-2xl font-bold">Skill Tree</h1>
            <p className="text-muted-foreground text-sm">
              Character talents fade on death. Bloodline legacy endures forever.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="card px-4 py-2 text-center min-w-[110px]">
            <p className="text-xs text-muted-foreground">Character</p>
            <p className="text-xl font-bold text-blue-400">{characterPoints}</p>
          </div>
          <div className="card px-4 py-2 text-center min-w-[110px]">
            <p className="text-xs text-muted-foreground">Bloodline</p>
            <p className="text-xl font-bold text-gold">{bloodlinePoints}</p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md mb-3 shrink-0 ${
            message.type === "success"
              ? "bg-green-900/20 text-green-400"
              : "bg-destructive/20 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <Tabs.Root
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as "character" | "bloodline");
          setSelectedSkill(null);
        }}
        className="flex flex-col flex-1 min-h-0"
      >
        <Tabs.List className="flex gap-2 mb-3 shrink-0">
          <Tabs.Trigger
            value="character"
            className="px-4 py-2 rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/50"
          >
            Character Web
          </Tabs.Trigger>
          <Tabs.Trigger
            value="bloodline"
            className="px-4 py-2 rounded-md text-sm data-[state=active]:bg-gold data-[state=active]:text-black bg-secondary/50"
          >
            Bloodline Legacy
          </Tabs.Trigger>
        </Tabs.List>

        <div className="relative flex-1 min-h-0">
          <Tabs.Content value="character" className="h-full outline-none">
            <SkillWebCanvas
              className="h-full"
              skills={characterSkills}
              ownedSkillIds={heir.skillIds}
              selectedSkillId={selectedSkill?.id ?? null}
              canClaimSkill={validateClaim}
              onSelectSkill={setSelectedSkill}
              accentColor="#3b82f6"
              variant="character"
            />
          </Tabs.Content>

          <Tabs.Content value="bloodline" className="h-full outline-none">
            <SkillWebCanvas
              className="h-full"
              skills={bloodlineSkills}
              ownedSkillIds={bloodlineOwned}
              selectedSkillId={selectedSkill?.id ?? null}
              canClaimSkill={validateClaim}
              onSelectSkill={setSelectedSkill}
              accentColor="#c9a227"
              variant="bloodline"
            />
          </Tabs.Content>

          <p className="absolute bottom-3 right-4 text-[10px] text-muted-foreground/80 pointer-events-none flex items-center gap-1 z-10">
            {activeTab === "character" ? (
              <>
                <Skull className="w-3 h-3" />
                Character skills are lost when your heir dies.
              </>
            ) : (
              <>
                <Crown className="w-3 h-3" />
                Bloodline points: {getBloodlineSkillPoints(lineage)} total · {bloodlinePoints} remaining
              </>
            )}
          </p>

          {selectedSkill && (
            <div className="absolute top-4 right-4 w-80 max-w-[calc(100%-2rem)] card p-4 shadow-xl border-border/80 z-10">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display text-lg font-semibold">{selectedSkill.name}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedSkill(null)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  aria-label="Close skill details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{selectedSkill.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost</span>
                  <span className="font-semibold">{selectedSkill.cost} points</span>
                </div>
                {selectedSkill.requires.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Requires</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedSkill.requires.map((reqId) => (
                        <span key={reqId} className="text-xs px-2 py-0.5 rounded bg-secondary">
                          {reqId.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {ownedForTab.includes(selectedSkill.id) ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  Already mastered
                </div>
              ) : (
                <>
                  {(() => {
                    const { canClaim, reason } = validateClaim(selectedSkill);
                    if (!canClaim) {
                      return (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <AlertCircle className="w-4 h-4" />
                          <span>{reason}</span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <button
                    onClick={handleClaimSkill}
                    disabled={loading || !validateClaim(selectedSkill).canClaim}
                    className="btn-primary w-full"
                  >
                    {loading ? "Learning..." : "Learn Skill"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </Tabs.Root>
    </div>
  );
}
