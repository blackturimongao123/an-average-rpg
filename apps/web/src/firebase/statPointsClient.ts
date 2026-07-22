import { doc, increment, updateDoc } from "firebase/firestore";
import type { Stats } from "@bloodline/shared/types";
import { db } from "./config";

export function saveAllocatedStatPoint(
  lineageId: string,
  heirId: string,
  stat: keyof Stats
): Promise<void> {
  return updateDoc(doc(db, "lineages", lineageId, "heirs", heirId), {
    [`stats.${stat}`]: increment(1),
    unspentStatPoints: increment(-1),
  });
}
