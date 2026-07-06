import type { MissionInterludePools } from "@bloodline/shared/campaign";
import type { MissionRandomEvent, MissionSecretEvent, MissionUniqueEvent } from "@bloodline/shared/types";

import interludesData from "@game-data/mission-interludes.json";

export const MISSION_INTERLUDE_POOLS: MissionInterludePools = {
  randomEvents: interludesData.randomEvents as MissionRandomEvent[],
  secretEvents: interludesData.secretEvents as MissionSecretEvent[],
  uniqueEvents: (interludesData.uniqueEvents ?? []) as MissionUniqueEvent[],
};
