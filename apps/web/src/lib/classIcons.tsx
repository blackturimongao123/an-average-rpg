const CLASS_ICON_FILES: Record<string, string> = {
  warrior: "WarriorIcon.png",
  rogue: "RogueIcon.png",
  mage: "MageIcon.png",
  priest: "PriestIcon.png",
  ranger: "RangerIcon.png",
  brawler: "BrawlerIcon.png",
  bard: "BardIcon.png",
};

/** Larger portrait assets — reserved for profile screens later. */
const PROFILE_ICON_FILES: Record<string, string> = {
  warrior: "WarriorProfileIcon.png",
  rogue: "RogueProfileIcon.png",
  mage: "WizardProfileIcon.png",
  priest: "PriestIcon.png",
  ranger: "RangerProfileIcon.png",
};

function iconUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}class-icons/${fileName}`;
}

function resolveIconId(classId: string, subclassId: string | null | undefined, files: Record<string, string>) {
  return subclassId && files[subclassId] ? subclassId : classId;
}

/** Resolve standard class icon for HUD, skill tree, party list, etc. */
export function getClassIconSrc(
  classId: string,
  subclassId?: string | null
): string | null {
  const id = resolveIconId(classId, subclassId, CLASS_ICON_FILES);
  const fileName = CLASS_ICON_FILES[id];
  return fileName ? iconUrl(fileName) : null;
}

/** Resolve profile portrait icon (not used in HUD yet). */
export function getClassProfileIconSrc(
  classId: string,
  subclassId?: string | null
): string | null {
  const id = resolveIconId(classId, subclassId, PROFILE_ICON_FILES);
  const fileName = PROFILE_ICON_FILES[id];
  return fileName ? iconUrl(fileName) : getClassIconSrc(classId, subclassId);
}

export function ClassIcon({
  classId,
  subclassId,
  size = 48,
  className = "",
}: {
  classId: string;
  subclassId?: string | null;
  size?: number;
  className?: string;
}) {
  const src = getClassIconSrc(classId, subclassId);
  const label = resolveIconId(classId, subclassId, CLASS_ICON_FILES);

  if (src) {
    return (
      <img
        src={src}
        alt={`${label} icon`}
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <span
      className={`font-display text-primary ${className}`}
      style={{ fontSize: size * 0.5 }}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  );
}

export function ClassProfileIcon({
  classId,
  subclassId,
  size = 80,
  className = "",
}: {
  classId: string;
  subclassId?: string | null;
  size?: number;
  className?: string;
}) {
  const src = getClassProfileIconSrc(classId, subclassId);
  const label = resolveIconId(classId, subclassId, PROFILE_ICON_FILES);

  if (src) {
    return (
      <img
        src={src}
        alt={`${label} portrait`}
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    );
  }

  return <ClassIcon classId={classId} subclassId={subclassId} size={size} className={className} />;
}
