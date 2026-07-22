import { useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase/config";

export type WarmableFunctionName =
  | "acceptMission"
  | "advanceMission"
  | "allocateStatPoints"
  | "claimSkill"
  | "kickPartyMember"
  | "transferPartyLeadership";

const REFRESH_INTERVAL_MS = 8 * 60 * 1000;

export function useFunctionWarmup(
  functionNames: WarmableFunctionName[],
  enabled = true
) {
  const functionKey = functionNames.join(",");

  useEffect(() => {
    if (!enabled || !functionKey) return;
    const names = functionKey.split(",") as WarmableFunctionName[];
    const warm = () => {
      void Promise.allSettled(
        names.map((name) =>
          httpsCallable<{ warmup: true }, unknown>(functions, name)({ warmup: true })
        )
      );
    };

    warm();
    const intervalId = window.setInterval(warm, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [enabled, functionKey]);
}
