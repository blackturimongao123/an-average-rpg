import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Heir, Lineage, SkillNode } from "@bloodline/shared/types";
import { ClassIcon } from "@/lib/classIcons";
import {
  getNodeRadius,
  getSkillRevealState,
} from "@/lib/skills";
import {
  computeConstellationLayout,
  getConstellationBounds,
} from "@/lib/constellationLayout";
import { computeSkillWebLayout, getLayoutBounds } from "@/lib/skillWebLayout";
import { Minus, Plus, RotateCcw } from "lucide-react";
import "./constellation-map.css";

export type ConstellationNodeState =
  | "locked"
  | "available"
  | "owned"
  | "selected"
  | "hidden";

interface ConstellationMapProps {
  skills: SkillNode[];
  ownedSkillIds: string[];
  selectedSkillId: string | null;
  canClaimSkill: (skill: SkillNode) => { canClaim: boolean; reason?: string };
  onSelectSkill: (skill: SkillNode) => void;
  accentColor?: string;
  variant?: "character" | "bloodline";
  className?: string;
  heir?: Heir;
  lineage?: Lineage;
  showCoreNode?: boolean;
}

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3;
const DRAG_THRESHOLD_PX = 4;
const CORE_RADIUS = 52;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function getNodeState(
  skill: SkillNode,
  ownedSkillIds: string[],
  selectedSkillId: string | null,
  canClaim: boolean,
  heir: Heir | undefined,
  lineage: Lineage | undefined
): ConstellationNodeState {
  if (heir && lineage && skill.isHidden && getSkillRevealState(skill, heir, lineage) === "hidden") {
    return "hidden";
  }
  if (ownedSkillIds.includes(skill.id)) {
    return "owned";
  }
  if (selectedSkillId === skill.id) {
    return "selected";
  }
  if (canClaim) {
    return "available";
  }
  return "locked";
}

function getNodeTypeColor(nodeType: SkillNode["nodeType"], accentColor: string): string {
  switch (nodeType) {
    case "minor":
      return "#94a3b8";
    case "passive":
      return "#22c55e";
    case "special":
      return "#fbbf24";
    case "active":
    default:
      return accentColor;
  }
}

function getNodeGlyph(skill: SkillNode): string {
  if (skill.nodeType === "minor") {
    const stat = skill.grants[0]?.modifiers?.[0]?.stat;
    if (stat) {
      return stat.slice(0, 3).toUpperCase();
    }
    return "+";
  }
  if (skill.nodeType === "passive") {
    return "P";
  }
  if (skill.nodeType === "special") {
    return "★";
  }
  const words = skill.name.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return skill.name.slice(0, 2).toUpperCase();
}

function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.35;
  const cy1 = y1 + dy * 0.05;
  const cx2 = x1 + dx * 0.65;
  const cy2 = y2 - dy * 0.05;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

function renderHiddenNode(style: SkillNode["hiddenStyle"], radius: number) {
  if (style === "crystal") {
    return (
      <polygon
        points={`0,${-radius} ${radius * 0.7},0 0,${radius} ${-radius * 0.7},0`}
        fill="#050505"
        stroke="rgba(120,120,140,0.5)"
        strokeWidth={2}
        className="constellation-map__hidden-crystal"
      />
    );
  }
  if (style === "shadow_orb") {
    return (
      <>
        <circle r={radius} fill="#030303" stroke="rgba(80,80,100,0.4)" strokeWidth={2} />
        <circle r={radius * 0.55} fill="rgba(20,20,30,0.9)" />
      </>
    );
  }
  return (
    <circle
      r={radius}
      fill="#080808"
      stroke="rgba(100,100,110,0.35)"
      strokeWidth={2}
      className="constellation-map__hidden-crystal"
    />
  );
}

const CORE_SKILL_ID = "basic_combat";

export function ConstellationMap({
  skills,
  ownedSkillIds,
  selectedSkillId,
  canClaimSkill,
  onSelectSkill,
  accentColor = "#3b82f6",
  variant = "character",
  className = "",
  heir,
  lineage,
  showCoreNode = false,
}: ConstellationMapProps) {
  const uid = useId().replace(/:/g, "");
  const starsId = `stars-${uid}`;
  const glowId = `glow-${uid}`;
  const nebulaId = `nebula-${uid}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const hideCoreSkill = showCoreNode && variant === "character";
  const renderSkills = useMemo(
    () => (hideCoreSkill ? skills.filter((skill) => skill.id !== CORE_SKILL_ID) : skills),
    [hideCoreSkill, skills]
  );

  const useAuthored = skills.every((skill) => skill.position);
  const layout = useMemo(() => {
    if (useAuthored) {
      return computeConstellationLayout(skills, {
        hideCoreSkillId: hideCoreSkill ? CORE_SKILL_ID : undefined,
      });
    }
    return computeSkillWebLayout(skills);
  }, [skills, useAuthored, hideCoreSkill]);

  const bounds = useMemo(() => {
    if (useAuthored) {
      return getConstellationBounds(layout, renderSkills);
    }
    return getLayoutBounds(layout);
  }, [layout, renderSkills, useAuthored]);

  const width = Math.max(bounds.maxX - bounds.minX, 520);
  const height = Math.max(bounds.maxY - bounds.minY, 520);
  const coreX = -bounds.minX;
  const coreY = -bounds.minY;

  const fitView = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const nextZoom = clampZoom(
      Math.min(containerWidth / contentWidth, containerHeight / contentHeight, 1) * 0.88
    );

    setZoom(nextZoom);
    setPan({
      x: (containerWidth - contentWidth * nextZoom) / 2 - bounds.minX * nextZoom,
      y: (containerHeight - contentHeight * nextZoom) / 2 - bounds.minY * nextZoom,
    });
  }, [bounds.maxX, bounds.minX, bounds.maxY, bounds.minY]);

  useEffect(() => {
    fitView();
  }, [fitView, skills]);

  const edges = useMemo(() => {
    const skillIds = new Set(skills.map((skill) => skill.id));
    const skillById = new Map(skills.map((skill) => [skill.id, skill]));
    const lines: Array<{
      key: string;
      path: string;
      owned: boolean;
      blocked: boolean;
      visible: boolean;
      partial: boolean;
    }> = [];

    for (const skill of renderSkills) {
      const targetPos = layout.get(skill.id);
      if (!targetPos) {
        continue;
      }

      const tx = targetPos.x - bounds.minX;
      const ty = targetPos.y - bounds.minY;
      const targetHidden =
        heir &&
        lineage &&
        skill.isHidden &&
        getSkillRevealState(skill, heir, lineage) === "hidden";

      for (const requiredId of skill.requires) {
        if (!skillIds.has(requiredId)) {
          continue;
        }

        const requiredSkill = skillById.get(requiredId);
        if (!requiredSkill) {
          continue;
        }

        const useCoreAnchor = hideCoreSkill && requiredId === CORE_SKILL_ID;
        const sourcePos = useCoreAnchor ? { x: 0, y: 0 } : layout.get(requiredId);
        if (!sourcePos) {
          continue;
        }

        const sx = sourcePos.x - bounds.minX;
        const sy = sourcePos.y - bounds.minY;
        const sourceOwned = ownedSkillIds.includes(requiredId);
        const targetOwned = ownedSkillIds.includes(skill.id);
        const owned = sourceOwned && targetOwned;
        const partial = sourceOwned || targetOwned;
        const blocked = skill.blocks.includes(requiredId);
        const sourceHidden =
          heir &&
          lineage &&
          requiredSkill.isHidden &&
          getSkillRevealState(requiredSkill, heir, lineage) === "hidden";

        const visible =
          !targetHidden &&
          !sourceHidden &&
          (partial ||
            canClaimSkill(skill).canClaim ||
            canClaimSkill(requiredSkill).canClaim);

        lines.push({
          key: `${requiredId}-${skill.id}`,
          path: bezierPath(sx, sy, tx, ty),
          owned,
          blocked,
          visible,
          partial,
        });
      }
    }

    return lines;
  }, [renderSkills, skills, layout, bounds.minX, bounds.minY, ownedSkillIds, canClaimSkill, heir, lineage, hideCoreSkill]);

  const zoomBy = useCallback((factor: number) => {
    setZoom((current) => clampZoom(current * factor));
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom((current) => clampZoom(current * factor));
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0) return;
      dragRef.current = {
        active: true,
        moved: false,
        startX: event.clientX,
        startY: event.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
      containerRef.current?.setPointerCapture(event.pointerId);
    },
    [pan.x, pan.y]
  );

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
      dragRef.current.moved = true;
    }
    setPan({
      x: dragRef.current.startPanX + dx,
      y: dragRef.current.startPanY + dy,
    });
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    containerRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  const handleNodeSelect = useCallback(
    (skill: SkillNode) => {
      if (dragRef.current.moved) {
        dragRef.current.moved = false;
        return;
      }
      onSelectSkill(skill);
    },
    [onSelectSkill]
  );

  const nebulaColor =
    variant === "bloodline" ? "rgba(201,162,39,0.18)" : `${accentColor}22`;

  return (
    <div
      className={`relative rounded-xl border border-border overflow-hidden bg-[#04060d] ${className}`}
    >
      <div
        ref={containerRef}
        className="h-full min-h-[520px] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width,
            height,
          }}
        >
          <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block">
            <defs>
              <radialGradient id={nebulaId} cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor={nebulaColor} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.55" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
              </radialGradient>
              <pattern id={starsId} width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="18" r="0.8" fill="rgba(255,255,255,0.25)" />
                <circle cx="48" cy="8" r="0.6" fill="rgba(255,255,255,0.18)" />
                <circle cx="66" cy="52" r="0.9" fill="rgba(255,255,255,0.2)" />
                <circle cx="24" cy="64" r="0.5" fill="rgba(255,255,255,0.15)" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="#04060d" />
            <rect width="100%" height="100%" fill={`url(#${starsId})`} opacity={0.6} />
            <ellipse
              cx={width / 2}
              cy={height / 2}
              rx={width * 0.45}
              ry={height * 0.45}
              fill={`url(#${nebulaId})`}
            />

            {edges.map((edge) => (
              <path
                key={edge.key}
                d={edge.path}
                fill="none"
                stroke={
                  edge.blocked
                    ? "rgba(239,68,68,0.35)"
                    : edge.owned
                    ? accentColor
                    : edge.partial
                    ? `${accentColor}88`
                    : edge.visible
                    ? "rgba(148,163,184,0.28)"
                    : "rgba(148,163,184,0.1)"
                }
                strokeWidth={edge.owned ? 2.5 : edge.partial ? 2 : 1.5}
                strokeDasharray={
                  edge.blocked ? "6 4" : edge.owned ? "8 4" : edge.visible ? "4 8" : "2 10"
                }
                className={edge.owned ? "constellation-map__edge-owned" : undefined}
                opacity={edge.visible ? 1 : 0.35}
              />
            ))}

            {showCoreNode && heir && (
              <g transform={`translate(${coreX}, ${coreY})`} className="constellation-map__core-pulse">
                <circle r={CORE_RADIUS + 16} fill={`url(#${glowId})`} opacity={0.85} />
                <circle
                  r={CORE_RADIUS}
                  fill="rgba(255,255,255,0.06)"
                  stroke={accentColor}
                  strokeWidth={2.5}
                />
                <foreignObject x={-28} y={-28} width={56} height={56}>
                  <ClassIcon classId={heir.classId} subclassId={heir.subclassId} size={56} />
                </foreignObject>
              </g>
            )}

            {renderSkills.map((skill) => {
              const pos = layout.get(skill.id);
              if (!pos) {
                return null;
              }

              const x = pos.x - bounds.minX;
              const y = pos.y - bounds.minY;
              const { canClaim } = canClaimSkill(skill);
              const state = getNodeState(
                skill,
                ownedSkillIds,
                selectedSkillId,
                canClaim,
                heir,
                lineage
              );
              const radius = getNodeRadius(skill);
              const typeColor = getNodeTypeColor(skill.nodeType, accentColor);
              const justRevealed =
                heir &&
                lineage &&
                skill.isHidden &&
                getSkillRevealState(skill, heir, lineage) === "revealed" &&
                !ownedSkillIds.includes(skill.id);

              if (state === "hidden") {
                return (
                  <g
                    key={skill.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer"
                    onClick={() => handleNodeSelect(skill)}
                  >
                    {renderHiddenNode(skill.hiddenStyle ?? "silhouette", radius)}
                  </g>
                );
              }

              return (
                <g
                  key={skill.id}
                  transform={`translate(${x}, ${y})`}
                  className={`cursor-pointer ${justRevealed ? "constellation-map__reveal" : ""}`}
                  opacity={state === "locked" ? 0.5 : 1}
                  onClick={() => handleNodeSelect(skill)}
                  style={{ color: typeColor }}
                >
                  {state === "owned" && (
                    <circle
                      r={radius + 12}
                      fill={`url(#${glowId})`}
                      className="constellation-map__owned-glow"
                    />
                  )}

                  <circle
                    r={radius}
                    fill={
                      state === "owned"
                        ? `${typeColor}33`
                        : state === "selected"
                        ? "rgba(255,255,255,0.14)"
                        : state === "available"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.03)"
                    }
                    stroke={
                      state === "owned"
                        ? typeColor
                        : state === "selected"
                        ? "#fff"
                        : state === "available"
                        ? accentColor
                        : "rgba(100,116,139,0.35)"
                    }
                    strokeWidth={state === "selected" ? 3 : 2}
                    strokeDasharray={state === "locked" ? "4 4" : undefined}
                    className={state === "available" ? "constellation-map__available" : undefined}
                  />

                  <text
                    textAnchor="middle"
                    y={5}
                    className="fill-foreground text-[10px] font-bold pointer-events-none select-none"
                  >
                    {state === "owned" || state === "available" || state === "selected"
                      ? getNodeGlyph(skill)
                      : skill.cost > 0
                      ? `${skill.cost}pt`
                      : "•"}
                  </text>

                  {(state === "owned" || state === "selected") && (
                    <text
                      textAnchor="middle"
                      y={radius + 14}
                      className="fill-foreground/90 text-[10px] font-semibold pointer-events-none select-none"
                    >
                      {skill.name.length > 16 ? `${skill.name.slice(0, 14)}…` : skill.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div
        className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-border/60 bg-background/80 backdrop-blur-sm p-1 z-10"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => zoomBy(1.2)}
          className="p-1.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground min-w-[2.5rem] text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.2)}
          className="p-1.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={fitView}
          className="p-1.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
          aria-label="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <p className="absolute bottom-3 left-3 text-[10px] text-muted-foreground/70 pointer-events-none z-10">
        Scroll to zoom · Drag to pan · Explore the constellation
      </p>
    </div>
  );
}
