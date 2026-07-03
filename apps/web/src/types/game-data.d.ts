import type {
  ClassData,
  DungeonData,
  JobData,
  MissionTemplate,
  RaceData,
  SkillNode,
  SubclassData,
  TavernEvent,
} from "@bloodline/shared/types";

declare module "@game-data/classes.json" {
  const data: { classes: ClassData[] };
  export default data;
}

declare module "@game-data/jobs.json" {
  const data: { jobs: JobData[] };
  export default data;
}

declare module "@game-data/dungeons.json" {
  const data: { dungeons: DungeonData[] };
  export default data;
}

declare module "@game-data/skills.json" {
  const data: { skills: SkillNode[] };
  export default data;
}

declare module "@game-data/events.json" {
  const data: { events: TavernEvent[] };
  export default data;
}

declare module "@game-data/races.json" {
  const data: { races: RaceData[] };
  export default data;
}

declare module "@game-data/missions.json" {
  const data: { missions: MissionTemplate[] };
  export default data;
}

declare module "@game-data/bloodline-skills.json" {
  const data: { skills: SkillNode[] };
  export default data;
}

declare module "@game-data/subclass-skills.json" {
  const data: { skills: SkillNode[] };
  export default data;
}

declare module "@game-data/subclasses.json" {
  const data: { subclasses: SubclassData[] };
  export default data;
}
