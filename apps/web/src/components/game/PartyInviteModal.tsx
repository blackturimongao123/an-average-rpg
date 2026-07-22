import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import {
  acceptPartyInviteClient,
  declinePartyInviteClient,
} from "@/firebase/partyClient";
import { getPartyErrorMessage } from "@/firebase/party";
import type { PartyInvite } from "@bloodline/shared/types";
import { db } from "@/firebase/config";
import { Crown, UserPlus, X } from "lucide-react";

export function PartyInviteModal() {
  const { user } = useAuthStore();
  const { lineage, setLineage, heir } = useGameStore();
  const [invites, setInvites] = useState<PartyInvite[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setInvites([]);
      return;
    }

    const q = query(
      collection(db, "partyInvites"),
      where("toUid", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snap) => {
      setInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PartyInvite));
    });

    return () => unsub();
  }, [user]);

  if (!user || !lineage || !heir || invites.length === 0 || lineage.partyId) {
    return null;
  }

  const activeInvite = invites[0];

  function handleAccept(inviteId: string) {
    if (!lineage || !user || !heir) return;
    setError(null);
    const invite = invites.find((entry) => entry.id === inviteId);
    if (!invite) return;
    setInvites((current) => current.filter((entry) => entry.id !== inviteId));
    setLineage({ ...lineage, partyId: invite.partyId });
    void acceptPartyInviteClient(user.uid, lineage, inviteId, heir).catch((err) => {
      setError(getPartyErrorMessage(err));
    });
  }

  function handleDecline(inviteId: string) {
    if (!user) return;
    setError(null);
    setInvites((current) => current.filter((entry) => entry.id !== inviteId));
    void declinePartyInviteClient(user.uid, inviteId).catch((err) => {
      setError(getPartyErrorMessage(err));
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-xl border border-primary/30 bg-[#0f0c09] shadow-2xl p-6"
        role="dialog"
        aria-labelledby="party-invite-title"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/15 text-primary">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 id="party-invite-title" className="font-display text-lg font-semibold text-white">
              Party Invite
            </h2>
            <p className="text-sm text-white/60 mt-1">
              <span className="text-white font-medium">{activeInvite.fromHeirName}</span>
              {activeInvite.fromFamilyName ? (
                <> of House {activeInvite.fromFamilyName}</>
              ) : null}{" "}
              wants you to join their party.
            </p>
          </div>
        </div>

        <p className="text-xs text-white/45 mb-4 flex items-center gap-1">
          <Crown className="w-3.5 h-3.5 text-gold" />
          {activeInvite.fromHeirName} is the party leader.
        </p>

        {error && (
          <p className="text-sm text-red-300 mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            className="btn-secondary flex items-center gap-1"
            onClick={() => void handleDecline(activeInvite.id)}
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => void handleAccept(activeInvite.id)}
          >
            Join Party
          </button>
        </div>

        {invites.length > 1 && (
          <p className="text-xs text-white/40 mt-3 text-center">
            +{invites.length - 1} more invite{invites.length > 2 ? "s" : ""} waiting
          </p>
        )}
      </div>
    </div>
  );
}
