import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { SkillNode } from "@bloodline/shared/types";
import {
  computeSkillWebLayout,
  getLayoutBounds,
  SKILL_LABEL_GAP,
  SKILL_NODE_RADIUS,
} from "@/lib/skillWebLayout";
import { getSkillById } from "@/lib/skills";
import { Minus, Plus, RotateCcw } from "lucide-react";

export type SkillNodeVisualState = "owned" | "available" | "locked" | "selected";

interface SkillWebCanvasProps {
  skills: SkillNode[];
  ownedSkillIds: string[];
  selectedSkillId: string | null;
  canClaimSkill: (skill: SkillNode) => { canClaim: boolean; reason?: string };
  onSelectSkill: (skill: SkillNode) => void;
  accentColor?: string;
  variant?: "character" | "bloodline";
  className?: string;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;
const DRAG_THRESHOLD_PX = 4;

function getNodeVisualState(
  skill: SkillNode,
  ownedSkillIds: string[],
  selectedSkillId: string | null,
  canClaim: boolean
): SkillNodeVisualState {
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

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function wrapSkillLabel(name: string): string[] {
  const words = name.split(" ");
  if (words.length <= 2 && name.length <= 14) {
    return [name];
  }

  if (words.length === 1) {
    const midpoint = Math.ceil(name.length / 2);
    return [name.slice(0, midpoint), name.slice(midpoint)];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

export function SkillWebCanvas({
  skills,
  ownedSkillIds,
  selectedSkillId,
  canClaimSkill,
  onSelectSkill,
  accentColor = "#c9a227",
  variant = "character",
  className = "",
}: SkillWebCanvasProps) {
  const uid = useId().replace(/:/g, "");
  const gridId = `web-grid-${uid}`;
  const glowId = `silk-glow-${uid}`;
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

  const layout = useMemo(() => computeSkillWebLayout(skills), [skills]);
  const bounds = useMemo(() => getLayoutBounds(layout), [layout]);
  const width = Math.max(bounds.maxX - bounds.minX, 480);
  const height = Math.max(bounds.maxY - bounds.minY, 480);

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
      Math.min(containerWidth / contentWidth, containerHeight / contentHeight, 1) * 0.92
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
    const lines: Array<{
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      owned: boolean;
      blocked: boolean;
      visible: boolean;
    }> = [];

    for (const skill of skills) {
      const targetPos = layout.get(skill.id);
      if (!targetPos) {
        continue;
      }

      const tx = targetPos.x - bounds.minX;
      const ty = targetPos.y - bounds.minY;

      for (const requiredId of skill.requires) {
        if (!skillIds.has(requiredId)) {
          continue;
        }

        const requiredSkill = getSkillById(requiredId);
        const sourcePos = layout.get(requiredId);
        if (!requiredSkill || !sourcePos) {
          continue;
        }

        const sx = sourcePos.x - bounds.minX;
        const sy = sourcePos.y - bounds.minY;
        const owned =
          ownedSkillIds.includes(requiredId) && ownedSkillIds.includes(skill.id);
        const blocked =
          skill.blocks.includes(requiredId) || requiredSkill.blocks.includes(skill.id);
        const visible =
          ownedSkillIds.includes(requiredId) ||
          ownedSkillIds.includes(skill.id) ||
          canClaimSkill(skill).canClaim ||
          canClaimSkill(requiredSkill).canClaim;

        lines.push({
          key: `${requiredId}-${skill.id}`,
          x1: sx,
          y1: sy,
          x2: tx,
          y2: ty,
          owned,
          blocked,
          visible,
        });
      }
    }

    return lines;
  }, [skills, layout, bounds.minX, bounds.minY, ownedSkillIds, canClaimSkill]);

  const resetView = useCallback(() => {
    fitView();
  }, [fitView]);

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

  return (
    <div
      className={`relative rounded-xl border border-border bg-[#0a0f18] overflow-hidden ${className}`}
    >
      <div
        ref={containerRef}
        className="h-full min-h-[480px] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
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
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            className="block"
            style={{
              backgroundImage:
                variant === "bloodline"
                  ? "radial-gradient(circle at center, rgba(201,162,39,0.12) 0%, transparent 60%)"
                  : "radial-gradient(circle at center, rgba(59,130,246,0.12) 0%, transparent 60%)",
            }}
          >
            <defs>
              <pattern id={gridId} width="36" height="36" patternUnits="userSpaceOnUse">
                <path
                  d="M 36 0 L 0 0 0 36"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              </pattern>
              <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill={`url(#${gridId})`} />

            {edges.map((edge) => (
              <line
                key={edge.key}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={
                  edge.blocked
                    ? "rgba(239,68,68,0.4)"
                    : edge.owned
                    ? accentColor
                    : edge.visible
                    ? "rgba(148,163,184,0.35)"
                    : "rgba(148,163,184,0.15)"
                }
                strokeWidth={edge.owned ? 2.5 : 1.5}
                strokeDasharray={edge.blocked ? "6 4" : edge.owned ? undefined : "4 6"}
              />
            ))}

            {skills.map((skill) => {
              const pos = layout.get(skill.id);
              if (!pos) {
                return null;
              }

              const x = pos.x - bounds.minX;
              const y = pos.y - bounds.minY;
              const { canClaim } = canClaimSkill(skill);
              const visualState = getNodeVisualState(
                skill,
                ownedSkillIds,
                selectedSkillId,
                canClaim
              );
              const labelLines = wrapSkillLabel(skill.name);

              return (
                <g
                  key={skill.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer"
                  opacity={visualState === "locked" ? 0.45 : 1}
                  onClick={() => handleNodeSelect(skill)}
                >
                  {visualState === "owned" && (
                    <circle r={SKILL_NODE_RADIUS + 14} fill={`url(#${glowId})`} opacity={0.9} />
                  )}

                  <circle
                    r={SKILL_NODE_RADIUS}
                    fill={
                      visualState === "owned"
                        ? `${accentColor}44`
                        : visualState === "selected"
                        ? "rgba(255,255,255,0.15)"
                        : visualState === "available"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(255,255,255,0.04)"
                    }
                    stroke={
                      visualState === "owned"
                        ? accentColor
                        : visualState === "selected"
                        ? "#fff"
                        : visualState === "available"
                        ? accentColor
                        : "rgba(148,163,184,0.3)"
                    }
                    strokeWidth={visualState === "selected" ? 3 : 2}
                    strokeDasharray={visualState === "locked" ? "4 3" : undefined}
                  />

                  <text
                    textAnchor="middle"
                    y={5}
                    className="fill-foreground text-[11px] font-bold pointer-events-none select-none"
                  >
                    {skill.cost}pt
                  </text>

                  {labelLines.map((line, lineIndex) => (
                    <text
                      key={`${skill.id}-label-${lineIndex}`}
                      textAnchor="middle"
                      y={SKILL_NODE_RADIUS + SKILL_LABEL_GAP + lineIndex * 13}
                      className="fill-foreground text-[11px] font-semibold pointer-events-none select-none"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div
        className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-border/60 bg-background/80 backdrop-blur-sm p-1"
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
          onClick={resetView}
          className="p-1.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
          aria-label="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <p className="absolute bottom-3 left-3 text-[10px] text-muted-foreground/70 pointer-events-none">
        Scroll to zoom · Drag to pan
      </p>
    </div>
  );
}
