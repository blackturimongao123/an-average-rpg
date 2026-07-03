const ICON_PATHS: Record<string, string> = {
  warrior: "/class-icons/WarriorIcon.png",
  rogue: "/class-icons/RogueIcon.png",
  mage: "/class-icons/MageIcon.png",
  priest: "/class-icons/PriestIcon.png",
  ranger: "/class-icons/RangerIcon.png",
  brawler: "/class-icons/BrawlerIcon.png",
  bard: "/class-icons/BardIcon.png",
};

/** Resolve icon for base class or committed subclass (subclass wins when mapped). */
export function getClassIconSrc(
  classId: string,
  subclassId?: string | null
): string | null {
  if (subclassId && ICON_PATHS[subclassId]) {
    return ICON_PATHS[subclassId];
  }
  return ICON_PATHS[classId] ?? null;
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
  const label = subclassId && ICON_PATHS[subclassId] ? subclassId : classId;

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
