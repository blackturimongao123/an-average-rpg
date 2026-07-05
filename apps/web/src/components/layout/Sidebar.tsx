import { NavLink } from "react-router-dom";
import { useUIStore } from "@/stores/uiStore";
import { useGameStore } from "@/stores/gameStore";
import { APP_VERSION } from "@/constants/version";
import {
  Beer,
  Castle,
  Scroll,
  Briefcase,
  GitBranch,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  User,
  Store,
} from "lucide-react";

const navItems = [
  { to: "/character", icon: User, label: "Character" },
  { to: "/tavern", icon: Beer, label: "Tavern" },
  { to: "/dungeons", icon: Castle, label: "Dungeons" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/skills", icon: Scroll, label: "Skill Tree" },
  { to: "/bank", icon: PiggyBank, label: "Bank" },
  { to: "/merchant", icon: Store, label: "Merchant" },
  { to: "/bloodline", icon: GitBranch, label: "Bloodline" },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { heir } = useGameStore();
  const onMission = Boolean(heir?.activeMission);

  return (
    <aside
      className={`bg-secondary/50 border-r border-border flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!sidebarCollapsed && (
          <h1 className="font-display text-lg text-gold font-semibold truncate">
            An Average RPG
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const disabled = onMission;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={(e) => {
                if (disabled) e.preventDefault();
              }}
              aria-disabled={disabled}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  disabled
                    ? "opacity-40 pointer-events-none cursor-not-allowed"
                    : isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                } ${sidebarCollapsed ? "justify-center" : ""}`
              }
              title={sidebarCollapsed ? label : disabled ? `${label} (locked during mission)` : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium truncate">{label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {!sidebarCollapsed && (
          <p className="text-xs text-muted-foreground text-center">
            MVP v{APP_VERSION}
          </p>
        )}
      </div>
    </aside>
  );
}
