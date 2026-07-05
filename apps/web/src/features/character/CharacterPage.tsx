import { useGameStore } from "@/stores/gameStore";
import { migrateEquipment } from "@bloodline/shared/equipment";
import { ClassIcon } from "@/lib/classIcons";
import { EquipmentPanel } from "@/components/game/EquipmentPanel";
import { CombatProfilePanel } from "@/components/game/CombatProfilePanel";
import { ItemChip } from "@/components/game/ItemChip";
import {
  calculateMaxHp,
  calculateXpForLevel,
  formatStatName,
  getStatColor,
  capitalize,
} from "@/lib/utils";
import {
  User,
  Heart,
  Star,
  Coins,
  Shield,
  Sparkles,
  Backpack,
  Scroll,
  Plus,
} from "lucide-react";
import type { ClassData, SkillNode, Stats } from "@bloodline/shared/types";
import { Link } from "react-router-dom";
import { useState } from "react";
import { allocateStatPoints } from "@/firebase/functions";

import classesData from "@game-data/classes.json";
import skillsData from "@game-data/skills.json";

const classes = classesData.classes as ClassData[];
const skills = skillsData.skills as SkillNode[];

function formatClassName(classId: string): string {
  return classes.find((entry) => entry.id === classId)?.name ?? capitalize(classId);
}

export function CharacterPage() {
  const { lineage, heir, setHeir } = useGameStore();
  const [statBusy, setStatBusy] = useState(false);

  if (!lineage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No bloodline found</p>
      </div>
    );
  }

  if (!heir) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Create an heir to view your character</p>
      </div>
    );
  }

  const activeHeir = heir;
  const classData = classes.find((entry) => entry.id === activeHeir.classId);
  const maxHp = calculateMaxHp(activeHeir.stats.constitution, activeHeir.level);
  const xpForNextLevel = calculateXpForLevel(activeHeir.level);
  const xpProgress = Math.min(100, (activeHeir.xp / xpForNextLevel) * 100);
  const ownedSkills = activeHeir.skillIds
    .map((skillId) => skills.find((skill) => skill.id === skillId))
    .filter(Boolean);
  const unspent = activeHeir.unspentStatPoints ?? 0;

  async function addStat(stat: keyof Stats) {
    if (!lineage || unspent <= 0) return;
    setStatBusy(true);
    try {
      const result = await allocateStatPoints({
        lineageId: lineage.id,
        heirId: activeHeir.id,
        stat,
        amount: 1,
      });
      setHeir({
        ...activeHeir,
        stats: result.data.stats as unknown as Stats,
        unspentStatPoints: result.data.unspentStatPoints,
      });
    } finally {
      setStatBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClassIcon classId={heir.classId} subclassId={heir.subclassId} size={48} />
        <div>
          <h1 className="font-display text-2xl font-bold">{heir.name}</h1>
          <p className="text-muted-foreground">
            House {lineage.familyName} • Generation {heir.generation}
            {heir.subclassId ? ` • ${capitalize(heir.subclassId.replace(/_/g, " "))}` : ""}
          </p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <ClassIcon classId={heir.classId} subclassId={heir.subclassId} size={80} className="flex-shrink-0" />

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold">{heir.name}</h2>
              <p className="text-muted-foreground capitalize">
                Level {heir.level} {formatClassName(heir.classId)} • {capitalize(heir.raceId)}
              </p>
              {classData?.description && (
                <p className="text-sm text-muted-foreground mt-2">{classData.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-md bg-secondary/50">
                <div className="flex items-center gap-1.5 text-red-400 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">Health</span>
                </div>
                <p className="font-semibold">{maxHp}</p>
              </div>

              <div className="p-3 rounded-md bg-secondary/50">
                <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xs">Experience</span>
                </div>
                <p className="font-semibold">
                  {heir.xp} / {xpForNextLevel}
                </p>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-md bg-secondary/50">
                <div className="flex items-center gap-1.5 text-gold mb-1">
                  <Coins className="w-4 h-4" />
                  <span className="text-xs">Gold</span>
                </div>
                <p className="font-semibold gold-text">{heir.gold}</p>
              </div>

              <div className="p-3 rounded-md bg-secondary/50">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <Scroll className="w-4 h-4" />
                  <span className="text-xs">Skills</span>
                </div>
                <p className="font-semibold">{ownedSkills.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Stats
            {unspent > 0 && (
              <span className="text-xs text-gold ml-auto">{unspent} points to spend</span>
            )}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(heir.stats).map(([stat, value]) => (
              <div
                key={stat}
                className="flex items-center justify-between p-3 rounded-md bg-secondary/50"
              >
                <span className={`text-sm ${getStatColor(stat)}`}>
                  {formatStatName(stat)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{value}</span>
                  {unspent > 0 && stat !== "infamy" && (
                    <button
                      type="button"
                      disabled={statBusy}
                      onClick={() => void addStat(stat as keyof typeof heir.stats)}
                      className="p-1 rounded hover:bg-primary/20 text-primary"
                      title={`Add 1 ${formatStatName(stat)}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Equipment</h2>
          <EquipmentPanel heir={heir} />
        </div>
      </div>

      <div className="mb-6">
        <CombatProfilePanel heir={heir} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Skills
            </h2>
            <Link to="/skills" className="text-sm text-primary hover:underline">
              Open Skill Tree →
            </Link>
          </div>
          {ownedSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills learned yet</p>
          ) : (
            <div className="space-y-2">
              {ownedSkills.map((skill) => (
                <div key={skill!.id} className="p-3 rounded-md bg-secondary/50">
                  <p className="font-medium">{skill!.name}</p>
                  <p className="text-sm text-muted-foreground">{skill!.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Backpack className="w-5 h-5 text-green-400" />
            Inventory
          </h2>
          {heir.inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your pack is empty</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {heir.inventory.map((itemId, index) => (
                <ItemChip key={`${itemId}-${index}`} itemId={itemId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
