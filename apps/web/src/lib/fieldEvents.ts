import type { Heir, Lineage, TavernEvent } from "@bloodline/shared/types";
import { generateSeed, weightedSeededRandomChoice } from "@/lib/seededRandom";

import eventsData from "@game-data/events.json";

const events = eventsData.events as TavernEvent[];

export function eventMeetsRequirements(
  event: TavernEvent,
  heir: Heir,
  lineage: Lineage
): boolean {
  const req = event.requirements;
  if (!req) return true;
  if (req.minLevel && heir.level < req.minLevel) return false;
  if (req.minGeneration && lineage.generation < req.minGeneration) return false;
  if (req.requiredClass && heir.classId !== req.requiredClass) return false;
  if (req.minInfamy && (heir.stats.infamy ?? 0) < req.minInfamy) return false;
  if (req.requiredJob) return false;
  return true;
}

export function rollFieldEvent(
  heir: Heir,
  lineage: Lineage,
  seed: string
): TavernEvent | null {
  const eligible = events.filter((event) => eventMeetsRequirements(event, heir, lineage));
  if (eligible.length === 0) return null;

  const weights = eligible.map((event) => ({ item: event, weight: event.weight }));
  return weightedSeededRandomChoice(seed, weights, 0);
}

export function tavernEventToAdventureStep(event: TavernEvent) {
  return {
    title: event.name,
    text: event.description,
    eventType: event.eventType ?? "discovery",
    sceneImage: event.sceneImage,
  };
}

export function tavernChoicesToCampaignChoices(event: TavernEvent) {
  return event.choices.map((choice) => ({
    id: choice.id,
    label: choice.text,
    subtitle: event.location ? `Location: ${event.location.replace(/_/g, " ")}` : "",
    tags: [],
  }));
}

export function getFieldEventsByLocation(location: string): TavernEvent[] {
  return events.filter((event) => event.location === location);
}

export function getAllFieldEvents(): TavernEvent[] {
  return events;
}
