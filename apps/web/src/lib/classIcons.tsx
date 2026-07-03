const ICON_FILES: Record<string, string> = {
  warrior: "WarriorIcon.png",
  rogue: "RogueIcon.png",
  mage: "MageIcon.png",
  priest: "PriestIcon.png",
  ranger: "RangerIcon.png",
  brawler: "BrawlerIcon.png",
  bard: "BardIcon.png",
};

function iconUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}class-icons/${fileName}`;
}

/** Resolve icon for base class or committed subclass (subclass wins when mapped). */
export function getClassIconSrc(
  classId: string,
  subclassId?: string | null
): string | null {
  const id =
    subclassId && ICON_FILES[subclassId] ? subclassId : classId;
  const fileName = ICON_FILES[id];
  return fileName ? iconUrl(fileName) : null;
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
  const label =
    subclassId && ICON_FILES[subclassId] ? subclassId : classId;

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
