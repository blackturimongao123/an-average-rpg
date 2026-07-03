import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CSSProperties, MouseEvent, PointerEvent, WheelEvent } from "react";
import "./SkillTree.css";

import type {
  PlayerSkillState,
  ResolvedSkillEdge,
  ResolvedSkillNode,
  SkillBranch,
  SkillEdgeDef,
  SkillNodeDef,
} from "./skillTreeTypes";

import { resolveSkillTreeState } from "./skillTreeState";

import {
  getBranchAuraPosition,
  getBranchCenterAngle,
  getCurvedEdgePath,
  getNodePosition,
  NODE_SIZE,
} from "./skillTreeLayout";

export type ClaimStatus = { canClaim: boolean; reason?: string };

type SkillTreeCanvasProps = {
  branches: SkillBranch[];
  nodes: SkillNodeDef[];
  edges: SkillEdgeDef[];
  playerState: PlayerSkillState;
  skillPoints: number;
  title: string;
  subtitle: string;
  headerExtra?: ReactNode;
  message?: ReactNode;
  onUnlockRequest?: (node: ResolvedSkillNode) => void;
  getClaimStatus?: (node: ResolvedSkillNode) => ClaimStatus;
  loading?: boolean;
};

type TransformState = {
  x: number;
  y: number;
  scale: number;
};

type TooltipState = {
  node: ResolvedSkillNode;
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function cssVars(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

export function SkillTreeCanvas({
  branches,
  nodes,
  edges,
  playerState,
  skillPoints,
  title,
  subtitle,
  headerExtra,
  message,
  onUnlockRequest,
  getClaimStatus,
  loading = false,
}: SkillTreeCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
  }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const [transform, setTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    scale: 0.62,
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    setSelectedNodeId(null);
    setTooltip(null);
    setTransform({ x: 0, y: 0, scale: 0.62 });
  }, [nodes, edges, branches]);

  const resolved = useMemo(() => {
    return resolveSkillTreeState(nodes, edges, playerState);
  }, [nodes, edges, playerState]);

  const branchById = useMemo(() => {
    return new Map(branches.map((branch) => [branch.id, branch]));
  }, [branches]);

  const nodeById = useMemo(() => {
    return new Map(resolved.nodes.map((node) => [node.id, node]));
  }, [resolved.nodes]);

  const positions = useMemo(() => {
    const result = new Map<string, { x: number; y: number }>();

    for (const node of resolved.nodes) {
      const branch = branchById.get(node.branchId);

      if (!branch) {
        throw new Error(`Missing branch for node: ${node.id}`);
      }

      result.set(node.id, getNodePosition(node, branch));
    }

    return result;
  }, [resolved.nodes, branchById]);

  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) : null;

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    dragRef.current = {
      active: true,
      lastX: event.clientX,
      lastY: event.clientY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!dragRef.current.active) {
      return;
    }

    const dx = event.clientX - dragRef.current.lastX;
    const dy = event.clientY - dragRef.current.lastY;

    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;

    setTransform((current) => ({
      ...current,
      x: current.x + dx,
      y: current.y + dy,
    }));
  }

  function handlePointerUp(event: PointerEvent<SVGSVGElement>) {
    dragRef.current.active = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore pointer-capture release errors.
    }
  }

  function handleWheel(event: WheelEvent<SVGSVGElement>) {
    event.preventDefault();

    const zoomDelta = event.deltaY > 0 ? -0.08 : 0.08;

    setTransform((current) => ({
      ...current,
      scale: clamp(current.scale + zoomDelta, 0.25, 1.4),
    }));
  }

  function resetView() {
    setTransform({
      x: 0,
      y: 0,
      scale: 0.62,
    });
  }

  return (
    <div className="skill-tree-shell">
      <div className="skill-tree-topbar">
        <div>
          <div className="skill-tree-title">{title}</div>
          <div className="skill-tree-subtitle">{subtitle}</div>
        </div>

        <div className="skill-tree-topbar-actions">
          {headerExtra}
          <div className="skill-tree-points">
            Skill Points: <strong>{skillPoints}</strong>
          </div>

          <button type="button" className="skill-tree-button" onClick={resetView}>
            Reset View
          </button>
        </div>
      </div>

      {message}

      <div className="skill-tree-main">
        <div className="skill-tree-stage-wrap">
          <svg
            ref={svgRef}
            className="skill-tree-stage"
            viewBox="0 0 1200 800"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            <defs>
              <pattern
                id="skillTreeGrid"
                x="0"
                y="0"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="rgba(137, 178, 255, 0.08)"
                  strokeWidth="1"
                />
              </pattern>

              <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#14395a" stopOpacity="0.32" />
                <stop offset="55%" stopColor="#07111f" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#01040a" stopOpacity="0.95" />
              </radialGradient>

              <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="strongGlow" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {branches.map((branch) => (
                <radialGradient
                  key={branch.id}
                  id={`branchAura-${branch.id}`}
                  cx="50%"
                  cy="50%"
                  r="70%"
                >
                  <stop offset="0%" stopColor={branch.color} stopOpacity="0.24" />
                  <stop offset="55%" stopColor={branch.color} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={branch.color} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            <rect width="1200" height="800" fill="url(#nebulaGlow)" />
            <rect width="1200" height="800" fill="url(#skillTreeGrid)" opacity="0.7" />

            <g
              transform={`translate(${600 + transform.x} ${400 + transform.y}) scale(${transform.scale})`}
            >
              <StarField />

              {branches
                .filter((branch) => branch.id !== "core")
                .map((branch) => {
                  const aura = getBranchAuraPosition(branch);
                  const angle = getBranchCenterAngle(branch);

                  return (
                    <g key={branch.id} className="skill-tree-branch-aura">
                      <ellipse
                        cx={aura.x}
                        cy={aura.y}
                        rx="430"
                        ry="250"
                        transform={`rotate(${angle} ${aura.x} ${aura.y})`}
                        fill={`url(#branchAura-${branch.id})`}
                      />

                      <text
                        x={aura.x}
                        y={aura.y - 230}
                        className="skill-tree-branch-label"
                        fill={branch.color}
                        textAnchor="middle"
                      >
                        {branch.label}
                      </text>
                    </g>
                  );
                })}

              <CoreRings />

              {resolved.edges.map((edge) => {
                if (edge.state === "hidden") {
                  return null;
                }

                const from = nodeById.get(edge.from);
                const to = nodeById.get(edge.to);
                const fromPos = positions.get(edge.from);
                const toPos = positions.get(edge.to);

                if (!from || !to || !fromPos || !toPos) {
                  return null;
                }

                const branch = branchById.get(edge.branchId);

                if (!branch) {
                  return null;
                }

                return (
                  <SkillEdgeView
                    key={edge.id}
                    edge={edge}
                    branch={branch}
                    from={fromPos}
                    to={toPos}
                  />
                );
              })}

              {resolved.nodes.map((node) => {
                const branch = branchById.get(node.branchId);
                const position = positions.get(node.id);

                if (!branch || !position) {
                  return null;
                }

                return (
                  <SkillNodeView
                    key={node.id}
                    node={node}
                    branch={branch}
                    x={position.x}
                    y={position.y}
                    selected={selectedNodeId === node.id}
                    onSelect={() => setSelectedNodeId(node.id)}
                    onHover={(event) => {
                      setTooltip({
                        node,
                        x: event.clientX,
                        y: event.clientY,
                      });
                    }}
                    onMoveTooltip={(event) => {
                      setTooltip((current) =>
                        current
                          ? {
                              ...current,
                              x: event.clientX,
                              y: event.clientY,
                            }
                          : current
                      );
                    }}
                    onUnhover={() => setTooltip(null)}
                    onUnlockRequest={() => onUnlockRequest?.(node)}
                  />
                );
              })}
            </g>
          </svg>

          {tooltip && <SkillTooltip tooltip={tooltip} />}

          <div className="skill-tree-help">
            Drag to pan · Scroll to zoom · Click node for details
          </div>
        </div>

        <SkillDetailsPanel
          node={selectedNode ?? null}
          branch={selectedNode ? branchById.get(selectedNode.branchId) ?? null : null}
          skillPoints={skillPoints}
          loading={loading}
          claimStatus={selectedNode ? getClaimStatus?.(selectedNode) : undefined}
          onUnlockRequest={() => {
            if (selectedNode) {
              onUnlockRequest?.(selectedNode);
            }
          }}
        />
      </div>
    </div>
  );
}

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 160 }, (_, index) => {
      const x = -1800 + Math.random() * 3600;
      const y = -1400 + Math.random() * 2800;
      const r = Math.random() > 0.86 ? 2.2 : 1.1;
      const opacity = 0.2 + Math.random() * 0.65;

      return {
        id: index,
        x,
        y,
        r,
        opacity,
      };
    });
  }, []);

  return (
    <g className="skill-tree-stars">
      {stars.map((star) => (
        <circle
          key={star.id}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="rgba(190, 230, 255, 1)"
          opacity={star.opacity}
        />
      ))}
    </g>
  );
}

function CoreRings() {
  return (
    <g className="skill-tree-core-rings">
      <circle r="180" />
      <circle r="360" />
      <circle r="560" />
      <circle r="780" />
      <circle r="1010" />
    </g>
  );
}

function SkillEdgeView({
  edge,
  branch,
  from,
  to,
}: {
  edge: ResolvedSkillEdge;
  branch: SkillBranch;
  from: { x: number; y: number };
  to: { x: number; y: number };
}) {
  const path = getCurvedEdgePath(from, to);

  return (
    <path
      className={`skill-tree-edge skill-tree-edge--${edge.state}`}
      d={path}
      fill="none"
      style={cssVars({
        "--branch-color": branch.color,
      })}
    />
  );
}

function SkillNodeView({
  node,
  branch,
  x,
  y,
  selected,
  onSelect,
  onHover,
  onMoveTooltip,
  onUnhover,
  onUnlockRequest,
}: {
  node: ResolvedSkillNode;
  branch: SkillBranch;
  x: number;
  y: number;
  selected: boolean;
  onSelect: () => void;
  onHover: (event: MouseEvent<SVGGElement>) => void;
  onMoveTooltip: (event: MouseEvent<SVGGElement>) => void;
  onUnhover: () => void;
  onUnlockRequest: () => void;
}) {
  const size = NODE_SIZE[node.kind];
  const radius = size / 2;

  const showLabel =
    node.state !== "hidden" &&
    (node.kind === "origin" ||
      node.kind === "subclassGate" ||
      node.kind === "special" ||
      node.kind === "active" ||
      node.kind === "capstone");

  const displayLabel = node.state === "hidden" ? "" : node.label;

  return (
    <g
      transform={`translate(${x} ${y})`}
      className={[
        "skill-tree-node",
        `skill-tree-node--${node.kind}`,
        `skill-tree-node--${node.state}`,
        selected ? "skill-tree-node--selected" : "",
      ].join(" ")}
      style={cssVars({
        "--branch-color": branch.color,
        "--branch-secondary": branch.secondaryColor,
      })}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();

        if (node.state === "available") {
          onUnlockRequest();
        }
      }}
      onMouseEnter={onHover}
      onMouseMove={onMoveTooltip}
      onMouseLeave={onUnhover}
    >
      {node.kind !== "minor" && node.state !== "hidden" && (
        <circle className="skill-tree-node-aura" r={radius + 18} fill="none" />
      )}

      {node.state === "hidden" ? (
        <HiddenNodeShape radius={radius} />
      ) : (
        <>
          <circle className="skill-tree-node-outer" r={radius} />
          <circle className="skill-tree-node-middle" r={radius - 7} />
          <circle className="skill-tree-node-inner" r={Math.max(radius - 16, 8)} />

          {(node.kind === "origin" ||
            node.kind === "subclassGate" ||
            node.kind === "special" ||
            node.kind === "capstone") && (
            <circle className="skill-tree-node-rune-ring" r={radius + 9} />
          )}

          <text
            className="skill-tree-node-icon"
            textAnchor="middle"
            dominantBaseline="central"
            y="-2"
          >
            {node.icon ?? "•"}
          </text>

          {node.cost > 0 && (
            <text
              className="skill-tree-node-cost"
              textAnchor="middle"
              dominantBaseline="central"
              y={radius + 16}
            >
              {node.cost}pt
            </text>
          )}
        </>
      )}

      {showLabel && (
        <text
          className="skill-tree-node-label"
          textAnchor="middle"
          dominantBaseline="hanging"
          y={radius + 28}
        >
          {displayLabel}
        </text>
      )}
    </g>
  );
}

function HiddenNodeShape({ radius }: { radius: number }) {
  const points = [
    [0, -radius],
    [radius * 0.78, -radius * 0.25],
    [radius * 0.55, radius * 0.82],
    [0, radius],
    [-radius * 0.55, radius * 0.82],
    [-radius * 0.78, -radius * 0.25],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <>
      <polygon className="skill-tree-hidden-crystal-back" points={points} />
      <polygon
        className="skill-tree-hidden-crystal-front"
        points={points}
        transform="scale(0.72)"
      />
      <circle className="skill-tree-hidden-smoke" r={radius + 12} />
    </>
  );
}

function SkillTooltip({ tooltip }: { tooltip: TooltipState }) {
  const node = tooltip.node;

  const hidden = node.state === "hidden";

  return (
    <div
      className="skill-tree-tooltip"
      style={{
        left: tooltip.x + 14,
        top: tooltip.y + 14,
      }}
    >
      {hidden ? (
        <>
          <div className="skill-tree-tooltip-title">Hidden Node</div>
          <div className="skill-tree-tooltip-muted">Something is concealed here.</div>
        </>
      ) : (
        <>
          <div className="skill-tree-tooltip-title">{node.label}</div>
          <div className="skill-tree-tooltip-kind">
            {node.kind} · {node.state}
          </div>
          <div className="skill-tree-tooltip-description">{node.description}</div>
        </>
      )}
    </div>
  );
}

function SkillDetailsPanel({
  node,
  branch,
  skillPoints,
  loading,
  claimStatus,
  onUnlockRequest,
}: {
  node: ResolvedSkillNode | null;
  branch: SkillBranch | null;
  skillPoints: number;
  loading: boolean;
  claimStatus?: ClaimStatus;
  onUnlockRequest: () => void;
}) {
  if (!node) {
    return (
      <aside className="skill-tree-details">
        <div className="skill-tree-details-empty">Select a node to inspect it.</div>
      </aside>
    );
  }

  if (node.state === "hidden") {
    return (
      <aside className="skill-tree-details">
        <div className="skill-tree-details-kicker">Unknown</div>
        <h2>Hidden Node</h2>
        <p className="skill-tree-muted">
          This node is concealed. Its name, effect, requirement, and reward are not visible yet.
        </p>
        <div className="skill-tree-secret-box">Discovery condition unknown.</div>
      </aside>
    );
  }

  const activeNode = node;
  const canUnlockByState = activeNode.state === "available" && skillPoints >= activeNode.cost;
  const canUnlock = canUnlockByState && (claimStatus?.canClaim ?? true);
  const disabledReason =
    claimStatus && !claimStatus.canClaim
      ? claimStatus.reason
      : activeNode.state === "unlocked"
        ? null
        : activeNode.state === "blocked"
          ? "Blocked by another path"
          : activeNode.state === "locked"
            ? "Requirements not met"
            : skillPoints < activeNode.cost
              ? "Not enough skill points"
              : null;

  function buttonLabel(): string {
    if (loading) return "Learning...";
    if (activeNode.state === "unlocked") return "Already Unlocked";
    if (activeNode.kind === "origin") return "Origin Node";
    if (activeNode.state === "blocked") return "Blocked";
    if (activeNode.state === "locked") return "Locked";
    if (!claimStatus?.canClaim && claimStatus?.reason) return claimStatus.reason;
    if (skillPoints < activeNode.cost) return "Not Enough Points";
    return "Learn Skill";
  }

  return (
    <aside
      className="skill-tree-details"
      style={cssVars({
        "--branch-color": branch?.color ?? "#ffffff",
      })}
    >
      <div className="skill-tree-details-kicker">
        {branch?.label ?? "Unknown Branch"} / {activeNode.kind}
      </div>

      <h2>{activeNode.label}</h2>

      <p className="skill-tree-muted">{activeNode.description}</p>

      <div className="skill-tree-detail-row">
        <span>State</span>
        <strong>{activeNode.state}</strong>
      </div>

      <div className="skill-tree-detail-row">
        <span>Cost</span>
        <strong>{activeNode.cost} Skill Points</strong>
      </div>

      {activeNode.requires.length > 0 && (
        <div className="skill-tree-detail-section">
          <h3>Requires</h3>
          <ul>
            {activeNode.requires.map((requiredId) => (
              <li key={requiredId}>{requiredId.replace(/_/g, " ")}</li>
            ))}
          </ul>
        </div>
      )}

      {activeNode.blocks && activeNode.blocks.length > 0 && (
        <div className="skill-tree-detail-section">
          <h3>Blocks</h3>
          <ul>
            {activeNode.blocks.map((blockedId) => (
              <li key={blockedId}>{blockedId.replace(/_/g, " ")}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="skill-tree-detail-section">
        <h3>Effects</h3>
        <ul>
          {activeNode.effects.map((effect, index) => (
            <li key={`${effect.label}-${index}`}>{effect.label}</li>
          ))}
        </ul>
      </div>

      {disabledReason && activeNode.state !== "unlocked" && (
        <p className="skill-tree-muted text-sm mb-3">{disabledReason}</p>
      )}

      <button
        type="button"
        className="skill-tree-unlock-button"
        disabled={
          !canUnlock || loading || activeNode.kind === "origin" || activeNode.state === "unlocked"
        }
        onClick={onUnlockRequest}
      >
        {buttonLabel()}
      </button>
    </aside>
  );
}
