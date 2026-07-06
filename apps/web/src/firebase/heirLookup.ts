import { doc, setDoc } from "firebase/firestore";
import type { Heir, Lineage } from "@bloodline/shared/types";
import { db } from "./config";

export function normalizeHeirNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export async function registerHeirLookup(
  lineage: Lineage,
  heir: Heir
): Promise<void> {
  if (heir.status !== "alive") return;

  const nameKey = normalizeHeirNameKey(heir.name);
  if (nameKey.length < 2) return;

  await setDoc(
    doc(db, "heirLookup", nameKey),
    {
      heirName: heir.name.trim(),
      nameKey,
      ownerUid: heir.ownerUid,
      lineageId: lineage.id,
      heirId: heir.id,
      familyName: lineage.familyName,
      classId: heir.classId,
      partyId: lineage.partyId ?? null,
      updatedAtMs: Date.now(),
    },
    { merge: true }
  );
}
