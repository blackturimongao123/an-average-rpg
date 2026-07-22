import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Crown, Skull } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { claimPlayerSkill } from "@/firebase/skills";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import {
  canClaimSkill,
  getBloodlinePointsRemaining,
  getBloodlineSkillPoints,
  getCharacterSkillPoints,
  getSkillById,
} from "@/lib/skills";
import { SkillTreeCanvas } from "@/features/skill-tree/SkillTreeCanvas";
import { getBloodlineSkillTree, getClassSkillTree } from "@/features/skill-tree/data";
import {
  buildPlayerSkillState,
  isNodeInGameData,
  resolveClaimableSkillId,
} from "@/features/skill-tree/skillTreeBridge";
import type { ResolvedSkillNode } from "@/features/skill-tree/skillTreeTypes";
import { useFunctionWarmup } from "@/hooks/useFunctionWarmup";

export function SkillsPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    lineage,
    heir,
    addSkillToHeir,
    addBloodlineSkill,
    setHeirSubclass,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<"character" | "bloodline">(
    searchParams.get("tab") === "bloodline" ? "bloodline" : "character"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  useFunctionWarmup(["claimSkill"]);

  const ownedForTab = useMemo(() => {
    if (!heir || !lineage) return [];
    return activeTab === "bloodline" ? (lineage.bloodlineSkillIds ?? []) : heir.skillIds;
  }, [heir, lineage, activeTab]);

  const classId = heir?.classId ?? "warrior";

  const treeData = useMemo(
    () =>
      activeTab === "bloodline" ? getBloodlineSkillTree() : getClassSkillTree(classId),
    [activeTab, classId]
  );

  const playerState = useMemo(() => {
    if (!heir || !lineage) {
      return {
        unlockedNodeIds: [],
        discoveredHiddenNodeIds: [],
        discoveredBranchIds: ["core"],
      };
    }
    return buildPlayerSkillState(
      heir,
      lineage,
      ownedForTab,
      activeTab,
      treeData.branches,
      treeData.nodes
    );
  }, [heir, lineage, ownedForTab, activeTab, treeData.branches, treeData.nodes]);

  if (!heir || !lineage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Create an heir to view skills</p>
      </div>
    );
  }

  const skillPoints =
    activeTab === "bloodline"
      ? getBloodlinePointsRemaining(lineage)
      : getCharacterSkillPoints(heir);

  const getClaimStatus = (node: ResolvedSkillNode) => {
    const skillId = resolveClaimableSkillId(node);
    if (!skillId) {
      return { canClaim: false, reason: "Not claimable" };
    }

    const skill = getSkillById(skillId);
    if (!skill) {
      return { canClaim: false, reason: "Skill not in game data yet" };
    }

    return canClaimSkill(skill, {
      heir,
      lineage,
      ownedSkillIds: ownedForTab,
      treeScope: activeTab,
    });
  };

  const handleUnlockRequest = async (node: ResolvedSkillNode) => {
    if (!user) return;

    const skillId = resolveClaimableSkillId(node);
    if (!skillId || !isNodeInGameData(skillId)) return;

    const skill = getSkillById(skillId);
    if (!skill) return;

    const { canClaim } = getClaimStatus(node);
    if (!canClaim) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await claimPlayerSkill(user.uid, lineage.id, heir.id, skillId);

      if (activeTab === "bloodline") {
        addBloodlineSkill(skillId);
      } else {
        addSkillToHeir(skillId);
        if ("subclassId" in result && result.subclassId && result.subclassTier) {
          setHeirSubclass(result.subclassId, result.subclassTier);
        }
      }

      setMessage({ type: "success", text: `Learned ${skill.name}!` });
    } catch (error: unknown) {
      setMessage({ type: "error", text: getFirebaseErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const headerExtra = (
    <div className="skill-tree-immersive-chrome">
      <Link to="/character" className="skill-tree-back-link">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <div className="skill-tree-tab-switch">
        <button
          type="button"
          className={activeTab === "character" ? "is-active" : ""}
          onClick={() => {
            setActiveTab("character");
            setMessage(null);
          }}
        >
          Class
        </button>
        <button
          type="button"
          className={activeTab === "bloodline" ? "is-active" : ""}
          onClick={() => {
            setActiveTab("bloodline");
            setMessage(null);
          }}
        >
          Bloodline
        </button>
      </div>
      <div className="skill-tree-point-pills">
        <span title="Character skill points">
          <Skull className="w-3 h-3 inline mr-1" />
          {getCharacterSkillPoints(heir)}
        </span>
        <span title="Bloodline skill points">
          <Crown className="w-3 h-3 inline mr-1" />
          {getBloodlinePointsRemaining(lineage)}
        </span>
      </div>
    </div>
  );

  const messageBanner = message ? (
    <div
      className={`skill-tree-message skill-tree-message--${message.type}`}
      role="status"
    >
      {message.text}
    </div>
  ) : null;

  const displayedNodes = activeTab === "bloodline"
    ? treeData.nodes.filter((node) => {
        if (playerState.unlockedNodeIds.includes(node.id)) return true;
        return getClaimStatus({ ...node, state: "locked" }).canClaim;
      })
    : treeData.nodes;
  const displayedNodeIds = new Set(displayedNodes.map((node) => node.id));
  const displayedEdges = activeTab === "bloodline"
    ? treeData.edges.filter(
        (edge) => displayedNodeIds.has(edge.from) && displayedNodeIds.has(edge.to)
      )
    : treeData.edges;

  return (
    <div className="h-full w-full relative">
      <SkillTreeCanvas
        key={`${activeTab}-${heir.classId}`}
        branches={treeData.branches}
        nodes={displayedNodes}
        edges={displayedEdges}
        playerState={playerState}
        skillPoints={skillPoints}
        title={treeData.title}
        subtitle={treeData.subtitle}
        headerExtra={headerExtra}
        message={messageBanner}
        loading={loading}
        getClaimStatus={getClaimStatus}
        onUnlockRequest={handleUnlockRequest}
      />
      <p className="skill-tree-footer-hint">
        {activeTab === "character" ? (
          <>Character skills are lost when your heir dies.</>
        ) : (
          <>
            Bloodline points: {getBloodlineSkillPoints(lineage)} total ·{" "}
            {getBloodlinePointsRemaining(lineage)} remaining
          </>
        )}
      </p>
    </div>
  );
}
