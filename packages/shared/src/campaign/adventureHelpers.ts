import type {
  MissionCampaignChoice,
  MissionCampaignStep,
  MissionEventType,
  MissionTemplate,
  MissionType,
} from "../types.js";

export function inferEventType(step: MissionCampaignStep, missionType: MissionType): MissionEventType {
  if (step.eventType) return step.eventType;

  if (missionType === "combat") return "combat";
  if (missionType === "explore" || missionType === "investigate") return "discovery";
  if (missionType === "deliver") return "social";
  return "hazard";
}

export function defaultChoicesForEvent(eventType: MissionEventType): MissionCampaignChoice[] {
  switch (eventType) {
    case "discovery":
      return [
        {
          id: "explore",
          label: "Explore the Area",
          subtitle: "Search for relics and secrets",
          tags: [
            { label: "High Reward", tone: "reward" },
            { label: "High Risk", tone: "risk" },
          ],
          stageCost: 1,
          moraleDelta: 2,
        },
        {
          id: "safe_path",
          label: "Take the Safe Path",
          subtitle: "Bypass danger and press on",
          tags: [
            { label: "Low Risk", tone: "neutral" },
            { label: "Low Reward", tone: "neutral" },
          ],
          stageCost: 1,
        },
        {
          id: "camp",
          label: "Set Camp",
          subtitle: "Rest and restore strength",
          tags: [
            { label: "Restore HP", tone: "reward" },
            { label: "-10 Supplies", tone: "cost" },
          ],
          supplyCost: 10,
          hpDelta: 15,
          moraleDelta: 5,
          stageCost: 1,
        },
      ];
    case "combat":
      return [
        {
          id: "engage",
          label: "Engage in Combat",
          subtitle: "Fight head-on for full rewards",
          tags: [
            { label: "High Risk", tone: "risk" },
            { label: "High Reward", tone: "reward" },
          ],
          stageCost: 1,
          hpDelta: -12,
        },
        {
          id: "ambush",
          label: "Attempt Ambush",
          subtitle: "Strike from cover",
          tags: [{ label: "Rewards Vary", tone: "neutral" }],
          stageCost: 1,
          hpDelta: -6,
        },
        {
          id: "retreat",
          label: "Fall Back",
          subtitle: "Lose ground but preserve supplies",
          tags: [{ label: "Low Risk", tone: "neutral" }],
          stageCost: 1,
          moraleDelta: -8,
        },
      ];
    case "social":
      return [
        {
          id: "persuade",
          label: "Attempt Persuasion",
          subtitle: "Talk your way through",
          tags: [{ label: "Rewards Vary", tone: "neutral" }],
          stageCost: 1,
        },
        {
          id: "bribe",
          label: "Offer Tribute",
          subtitle: "Spend supplies for passage",
          tags: [{ label: "-5 Supplies", tone: "cost" }],
          supplyCost: 5,
          stageCost: 1,
        },
        {
          id: "force",
          label: "Force the Issue",
          subtitle: "Intimidate or overpower",
          tags: [
            { label: "High Risk", tone: "risk" },
            { label: "Morale -5", tone: "cost" },
          ],
          stageCost: 1,
          moraleDelta: -5,
          hpDelta: -8,
        },
      ];
    case "rest":
      return [
        {
          id: "rest",
          label: "Rest Fully",
          subtitle: "Recover HP and morale",
          tags: [
            { label: "Restore HP", tone: "reward" },
            { label: "-8 Supplies", tone: "cost" },
          ],
          supplyCost: 8,
          hpDelta: 20,
          moraleDelta: 8,
          stageCost: 1,
        },
        {
          id: "light_rest",
          label: "Brief Respite",
          subtitle: "Catch your breath and move on",
          tags: [{ label: "Low Cost", tone: "neutral" }],
          hpDelta: 8,
          stageCost: 1,
        },
      ];
    default:
      return [
        {
          id: "push_forward",
          label: "Press Forward",
          subtitle: "Continue the expedition",
          tags: [{ label: "Normal", tone: "neutral" }],
          stageCost: 1,
        },
        {
          id: "scout",
          label: "Scout Ahead",
          subtitle: "Reduce risk on the next stretch",
          tags: [{ label: "Low Risk", tone: "neutral" }],
          stageCost: 1,
          moraleDelta: 3,
        },
      ];
  }
}

export function getStepChoices(
  mission: MissionTemplate,
  stepIndex: number
): MissionCampaignChoice[] {
  const step = mission.campaign.steps[stepIndex];
  if (!step) return [];

  if (step.choices?.length) {
    return step.choices;
  }

  return defaultChoicesForEvent(inferEventType(step, mission.type));
}

export function getStepTitle(step: MissionCampaignStep, missionName: string): string {
  return step.title ?? missionName;
}

export function stageCostForTimeCost(timeCost: MissionCampaignStep["timeCost"]): number {
  if (timeCost === "low") return 0;
  if (timeCost === "high") return 2;
  return 1;
}

export function getDefaultSceneGradient(eventType: MissionEventType): string {
  switch (eventType) {
    case "discovery":
      return "linear-gradient(180deg, #1a2e1a 0%, #0d1520 45%, #1a1208 100%)";
    case "combat":
      return "linear-gradient(180deg, #2a1212 0%, #120a0a 50%, #1a1008 100%)";
    case "rest":
      return "linear-gradient(180deg, #1a1a2e 0%, #0f1520 50%, #1a1408 100%)";
    case "social":
      return "linear-gradient(180deg, #1e1a12 0%, #121018 50%, #18120a 100%)";
    default:
      return "linear-gradient(180deg, #1a2030 0%, #0c1018 50%, #181008 100%)";
  }
}
