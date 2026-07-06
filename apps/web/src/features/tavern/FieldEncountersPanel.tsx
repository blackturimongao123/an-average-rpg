import { useState } from "react";
import { AdventureEventView } from "@/features/adventure/AdventureEventView";
import { resolvePlayerTavernQuest } from "@/firebase/tavernQuest";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import {
  rollFieldEvent,
  tavernChoicesToCampaignChoices,
  tavernEventToAdventureStep,
} from "@/lib/fieldEvents";
import { generateSeed } from "@/lib/seededRandom";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import type { MissionCampaignChoice, TavernEvent } from "@bloodline/shared/types";
import { Compass, MapPin, Scroll } from "lucide-react";

interface FieldOutcome {
  description: string;
  goldDelta: number;
  xpDelta: number;
  itemRewards: string[];
  heirDied: boolean;
}

export function FieldEncountersPanel() {
  const { user } = useAuthStore();
  const {
    lineage,
    heir,
    updateHeirGold,
    updateHeirXp,
    updateHeirLevel,
    addItemToInventory,
    setHeir,
    setLineage,
  } = useGameStore();

  const [activeEvent, setActiveEvent] = useState<TavernEvent | null>(null);
  const [eventLog, setEventLog] = useState<Array<{ text: string; timestampMs: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<FieldOutcome | null>(null);

  if (!lineage || !heir || !user) return null;

  const handleRollEvent = () => {
    setError("");
    setOutcome(null);
    const seed = generateSeed(lineage.id, heir.id, `field-event-${Date.now()}`);
    const rolled = rollFieldEvent(heir, lineage, seed);
    if (!rolled) {
      setError("No encounters match your heir right now. Try again after leveling up.");
      return;
    }
    setActiveEvent(rolled);
    setEventLog((prev) => [
      ...prev,
      { text: `Encounter: ${rolled.name}`, timestampMs: Date.now() },
    ]);
  };

  const handleChoose = async (choice: MissionCampaignChoice) => {
    if (!activeEvent) return;
    setLoading(true);
    setError("");
    try {
      const response = await resolvePlayerTavernQuest(
        user.uid,
        lineage.id,
        heir.id,
        activeEvent.id,
        choice.id
      );

      updateHeirGold(response.heirGoldAfter);
      updateHeirXp(response.heirXpAfter);
      if (response.leveledUp) {
        updateHeirLevel(heir.level + 1);
      }
      response.outcome.itemRewards.forEach((itemId) => addItemToInventory(itemId));

      setEventLog((prev) => [
        ...prev,
        {
          text: `${choice.label}: ${response.outcome.description}`,
          timestampMs: Date.now(),
        },
      ]);
      setOutcome(response.outcome);
      setActiveEvent(null);

      if (response.outcome.heirDied) {
        setHeir({ ...heir, status: "dead" });
        setLineage({ ...lineage, activeHeirId: null });
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (activeEvent) {
    const step = tavernEventToAdventureStep(activeEvent);
    const choices = tavernChoicesToCampaignChoices(activeEvent);

    return (
      <div className="h-full p-2 md:p-3 overflow-hidden">
        {error && (
          <div className="mb-3 p-3 rounded-md bg-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
        <AdventureEventView
          heir={heir}
          eventTitle={activeEvent.name}
          regionLabel={(activeEvent.location ?? "wilds").replace(/_/g, " ").toUpperCase()}
          progressLabel="Field Encounter"
          step={step}
          choices={choices}
          loading={loading}
          onChoose={handleChoose}
          onLeave={() => setActiveEvent(null)}
          eventLog={eventLog}
          eventTypeLabel={activeEvent.eventType ?? "event"}
          footerHint="Branching outcomes — death is possible on deadly encounters"
        />
      </div>
    );
  }

  if (outcome) {
    return (
      <div className="card p-6 max-w-2xl mx-auto animate-fade-in">
        <h2 className="font-display text-xl font-semibold mb-2">Encounter Resolved</h2>
        <p className="text-muted-foreground mb-4">{outcome.description}</p>
        <div className="flex flex-wrap gap-3 text-sm mb-4">
          {outcome.goldDelta !== 0 && (
            <span className={outcome.goldDelta > 0 ? "text-gold" : "text-red-300"}>
              {outcome.goldDelta > 0 ? "+" : ""}
              {outcome.goldDelta} gold
            </span>
          )}
          {outcome.xpDelta > 0 && <span className="text-blue-400">+{outcome.xpDelta} XP</span>}
          {outcome.itemRewards.map((itemId) => (
            <span key={itemId} className="text-muted-foreground">
              + {itemId.replace(/_/g, " ")}
            </span>
          ))}
        </div>
        {outcome.heirDied ? (
          <p className="text-red-300 text-sm mb-4">Your heir has fallen. The bloodline endures.</p>
        ) : null}
        <button type="button" className="btn-primary" onClick={() => setOutcome(null)}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-5 h-5 text-gold" />
        <h2 className="font-display text-lg font-semibold">Field Encounters</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Venture beyond the tavern into forests, mountains, caves, and dungeons. Over{" "}
        <strong>100</strong> branching encounters share painted backgrounds — many forest events reuse
        the same woods, while the Goblin King throne and prison depths are rare finds.
      </p>

      {error && (
        <div className="p-3 rounded-md bg-destructive/20 text-destructive text-sm mb-4">{error}</div>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-6 text-xs">
        {[
          ["Forest", "25 events", "/an-average-rpg/scenes/forest.png"],
          ["Mountain", "15 events", "/an-average-rpg/scenes/mountain.png"],
          ["Goblin King", "5 unique", "/an-average-rpg/scenes/goblin-king-room.png"],
        ].map(([label, count, img]) => (
          <div key={label} className="card p-2 overflow-hidden">
            <div
              className="h-16 rounded-md bg-cover bg-center mb-2"
              style={{ backgroundImage: `url("${img}")` }}
            />
            <p className="font-medium">{label}</p>
            <p className="text-muted-foreground">{count}</p>
          </div>
        ))}
      </div>

      <button type="button" className="btn-primary w-full sm:w-auto" disabled={loading} onClick={handleRollEvent}>
        <MapPin className="w-4 h-4 inline mr-2" />
        Seek an Encounter
      </button>

      {eventLog.length > 0 && (
        <div className="mt-6 card p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Scroll className="w-4 h-4" />
            Recent encounters
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
            {eventLog
              .slice()
              .reverse()
              .map((entry, i) => (
                <li key={`${entry.timestampMs}-${i}`}>{entry.text}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
