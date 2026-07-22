import { doc, writeBatch } from "firebase/firestore";
import { db } from "./config";

export function saveGoldTransfer(
  lineageId: string,
  heirId: string,
  heirGold: number,
  bankGold: number
): void {
  const batch = writeBatch(db);
  batch.update(doc(db, "lineages", lineageId, "heirs", heirId), { gold: heirGold });
  batch.update(doc(db, "lineages", lineageId), { bankGold });
  void batch.commit().catch((error) => console.error("Failed to save gold transfer", error));
}
