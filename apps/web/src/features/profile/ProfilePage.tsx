import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { db } from "@/firebase/config";
import { ClassIcon } from "@/lib/classIcons";
import {
  acceptPlayerPartyInvite,
  createPlayerParty,
  declinePlayerPartyInvite,
  getPartyErrorMessage,
  invitePlayerToParty,
  kickPlayerFromParty,
  leavePlayerParty,
  makePlayerPartyLeader,
} from "@/firebase/party";
import { abandonPlayerMission, failPlayerMission, getMissionActionErrorMessage } from "@/firebase/missionActions";
import type { Party, PartyInvite } from "@bloodline/shared/types";
import { Settings, User, Users, UserPlus, LogOut, Crown, UserMinus } from "lucide-react";

interface PartyMemberInfo {
  uid: string;
  lineageId: string;
  familyName: string;
  heirName: string;
  classId: string;
  subclassId: string | null;
  isLeader: boolean;
}

export function ProfilePage() {
  const { user } = useAuthStore();
  const { lineage, heir, setLineage, setHeir } = useGameStore();
  const [tab, setTab] = useState<"account" | "party">("account");
  const [profile, setProfile] = useState<{
    username: string;
    settings: { reducedMotion: boolean; theme: string };
  } | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMemberInfo[]>([]);
  const [invites, setInvites] = useState<PartyInvite[]>([]);
  const [inviteHeirName, setInviteHeirName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) {
        setProfile(null);
        return;
      }
      const data = snap.data();
      setProfile({
        username: (data.username as string) ?? "",
        settings: (data.settings as { reducedMotion: boolean; theme: string }) ?? {
          reducedMotion: false,
          theme: "dark",
        },
      });
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !lineage?.partyId) {
      setParty(null);
      setMembers([]);
      return;
    }

    const unsub = onSnapshot(doc(db, "parties", lineage.partyId), (snap) => {
      if (!snap.exists()) {
        setParty(null);
        setMembers([]);
        return;
      }

      const partyData = snap.data() as Party;
      setParty(partyData);

      const memberInfos: PartyMemberInfo[] = partyData.memberUids.map((memberUid, i) => {
        const profile = partyData.memberProfiles?.[i];
        return {
          uid: memberUid,
          lineageId: partyData.memberLineageIds[i] ?? "",
          familyName: profile?.familyName ?? "Unknown",
          heirName: profile?.heirName ?? "—",
          classId: profile?.classId ?? "warrior",
          subclassId: profile?.subclassId ?? null,
          isLeader: memberUid === partyData.leaderUid,
        };
      });
      setMembers(memberInfos);
    });

    return () => unsub();
  }, [user, lineage?.partyId]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "partyInvites"),
      where("toUid", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snap) => {
      setInvites(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PartyInvite)
      );
    });
    return () => unsub();
  }, [user]);

  if (!lineage || !heir) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No active heir</p>
      </div>
    );
  }

  const activeLineage = lineage;
  const activeHeir = heir;

  async function handleCreateParty() {
    if (!user) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await createPlayerParty(activeLineage.id, activeLineage, user.uid, activeHeir);
      setLineage({ ...activeLineage, partyId: result.partyId });
      setMessage("Party created. You are the party leader.");
    } catch (err) {
      setError(getPartyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteHeirName.trim() || !user) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await invitePlayerToParty(
        activeLineage,
        activeHeir,
        user.uid,
        inviteHeirName.trim()
      );
      setLineage({ ...activeLineage, partyId: result.partyId });
      setInviteHeirName("");
      setMessage(`Invite sent to ${inviteHeirName.trim()}.`);
    } catch (err) {
      setError(getPartyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await acceptPlayerPartyInvite(user.uid, activeLineage, inviteId, activeHeir);
      setLineage({ ...activeLineage, partyId: result.partyId });
      setMessage("Joined party.");
    } catch (err) {
      setError(getPartyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeclineInvite(inviteId: string) {
    if (!user) return;
    setLoading(true);
    try {
      await declinePlayerPartyInvite(user.uid, inviteId);
    } catch (err) {
      setError(getPartyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaveParty() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await leavePlayerParty(user.uid, activeLineage);
      setLineage({ ...activeLineage, partyId: null });
      setParty(null);
      setMembers([]);
      setMessage("Left the party.");
    } catch (err) {
      setError(getPartyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleKickMember(member: PartyMemberInfo) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await kickPlayerFromParty(activeLineage.id, member.uid);
      setMessage(`${member.heirName} was removed from the party.`);
    } catch (err) {
      setError(getPartyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleMakeLeader(member: PartyMemberInfo) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await makePlayerPartyLeader(activeLineage.id, member.uid);
      setMessage(`${member.heirName} is now the party leader.`);
    } catch (err) {
      setError(getPartyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleAbandonMission() {
    setLoading(true);
    setError(null);
    try {
      const result = await abandonPlayerMission(activeLineage.id, activeHeir.id);
      setHeir({
        ...activeHeir,
        activeMission: null,
        missionCooldowns: {
          ...(activeHeir.missionCooldowns ?? {}),
          [result.missionId]: result.cooldownExpiresAtMs,
        },
      });
      setMessage("Mission abandoned. A short cooldown applies before you can take it again.");
    } catch (err) {
      setError(getMissionActionErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleFailMission() {
    setLoading(true);
    setError(null);
    try {
      const result = await failPlayerMission(activeLineage.id, activeHeir.id);
      setHeir({
        ...activeHeir,
        activeMission: null,
        missionCooldowns: {
          ...(activeHeir.missionCooldowns ?? {}),
          [result.missionId]: result.cooldownExpiresAtMs,
        },
      });
      setMessage("Mission failed. Cooldown applied.");
    } catch (err) {
      setError(getMissionActionErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const isLeader = party?.leaderUid === user?.uid;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">{heir.name}</h1>
          <p className="text-muted-foreground">Account settings and party</p>
        </div>
      </div>

      {heir.activeMission && (
        <div className="card p-4 mb-6 border-primary/30 bg-primary/5">
          <p className="text-sm mb-3">
            On mission: <span className="font-medium">{heir.activeMission.missionName}</span>. Other
            locations are locked until you finish or abandon the mission.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleAbandonMission()}
              className="btn-secondary text-sm px-3 py-1.5"
            >
              Abandon Mission
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleFailMission()}
              className="text-sm px-3 py-1.5 text-red-400 hover:underline"
            >
              Mark Failed
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("account")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            tab === "account" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          Account
        </button>
        <button
          type="button"
          onClick={() => setTab("party")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            tab === "party" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          Party
        </button>
      </div>

      {error && (
        <div className="card p-4 mb-4 border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}
      {message && (
        <div className="card p-4 mb-4 border-green-500/30 bg-green-500/10 text-green-300 text-sm">{message}</div>
      )}

      {tab === "account" && (
        <div className="card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account
          </h2>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between p-3 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email ?? "—"}</span>
            </div>
            <div className="flex justify-between p-3 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">Character name</span>
              <span>{heir.name}</span>
            </div>
            <p className="text-xs text-muted-foreground px-1">
              Other players always see your character name, not your account username.
            </p>
            <div className="flex justify-between p-3 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">Account username</span>
              <span>{profile?.username ?? "—"}</span>
            </div>
            <div className="flex justify-between p-3 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">Bloodline</span>
              <span>House {lineage.familyName}</span>
            </div>
            <div className="flex justify-between p-3 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">Theme</span>
              <span className="capitalize">{profile?.settings.theme ?? "dark"}</span>
            </div>
          </div>
        </div>
      )}

      {tab === "party" && (
        <div className="space-y-6">
          {invites.length > 0 && !lineage.partyId && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Pending Invites</h2>
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 rounded-md bg-secondary/50"
                  >
                    <div className="text-sm">
                      <p className="font-medium">{invite.fromHeirName}</p>
                      <p className="text-muted-foreground text-xs">
                        House {invite.fromFamilyName} · Party leader
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void handleDeclineInvite(invite.id)}
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void handleAcceptInvite(invite.id)}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!lineage.partyId ? (
            <div className="card p-6">
              <div className="text-center mb-6">
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">You are not in a party.</p>
                <p className="text-xs text-muted-foreground">
                  Invite a friend by their <strong>heir name</strong> — you become party leader.
                </p>
              </div>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  value={inviteHeirName}
                  onChange={(e) => setInviteHeirName(e.target.value)}
                  placeholder="Friend's heir name"
                  className="flex-1 px-3 py-2 rounded-md bg-secondary border border-border text-sm"
                />
                <button
                  type="button"
                  disabled={loading || !inviteHeirName.trim()}
                  onClick={() => void handleInvite()}
                  className="btn-primary flex items-center gap-1 px-4"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">or</p>
              <div className="text-center mt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleCreateParty()}
                  className="btn-secondary"
                >
                  Create empty party first
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Party Members
                </h2>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleLeaveParty()}
                  className="flex items-center gap-1 text-sm text-red-400 hover:underline"
                >
                  <LogOut className="w-4 h-4" />
                  Leave
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {members.map((member) => (
                  <div
                    key={member.uid}
                    className="flex items-center gap-3 p-3 rounded-md bg-secondary/50"
                  >
                    <ClassIcon classId={member.classId} subclassId={member.subclassId} size={40} />
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.heirName}
                        {member.isLeader && (
                          <Crown className="inline w-4 h-4 ml-1 text-gold" />
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">House {member.familyName}</p>
                    </div>
                    {isLeader && !member.isLeader && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => void handleMakeLeader(member)}
                          className="flex items-center gap-1 text-xs text-gold hover:underline disabled:opacity-50"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          Make Leader
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => void handleKickMember(member)}
                          className="flex items-center gap-1 text-xs text-red-400 hover:underline disabled:opacity-50"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          Kick
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isLeader && members.length < 4 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteHeirName}
                    onChange={(e) => setInviteHeirName(e.target.value)}
                    placeholder="Invite by heir name"
                    className="flex-1 px-3 py-2 rounded-md bg-secondary border border-border text-sm"
                  />
                  <button
                    type="button"
                    disabled={loading || !inviteHeirName.trim()}
                    onClick={() => void handleInvite()}
                    className="btn-primary flex items-center gap-1 px-4"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite
                  </button>
                </div>
              )}
              {!isLeader && (
                <p className="text-xs text-muted-foreground">
                  Only {members.find((m) => m.isLeader)?.heirName ?? "the leader"} can invite others.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
