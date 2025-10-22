import React from "react";
import { Icon } from "./Icon"; // ✅ chemin relatif vers ton composant Icon
// Si ton type Route n’est pas exporté ailleurs, on peut le redéfinir ici :
export type Route =
  | "home"
  | "games"
  | "profiles"
  | "friends"
  | "allgames"
  | "stats"
  | "settings";

/* =========================================
   Top & Bottom nav (verre dépoli + SVG)
   ========================================= */
type IconName =
  | "home"
  | "dart"
  | "user"
  | "users"
  | "folder"
  | "chart"
  | "settings";

/* ===== Barre du haut (desktop) ===== */
export function TopGlassNav({
  route,
  setRoute,
}: {
  route: Route;
  setRoute: (r: Route) => void;
}) {
  return (
    <nav
      className="hide-sm"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,.07)",
        background:
          "linear-gradient(180deg, rgba(18,18,22,.55), rgba(10,10,12,.72))",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <NavButtons route={route} setRoute={setRoute} layout="row" />
    </nav>
  );
}

/* ===== Barre du bas (mobile) ===== */
export function BottomNav({
  route,
  setRoute,
}: {
  route: Route;
  setRoute: (r: Route) => void;
}) {
  return (
    <nav
      className="show-sm"
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100%",
        zIndex: 99,
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)", // ✅ 7 icônes horizontales
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        padding: "6px 0",
        borderTop: "1px solid rgba(255,255,255,.07)",
        background:
          "linear-gradient(180deg, rgba(18,18,22,.55), rgba(10,10,12,.72))",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <NavButtons route={route} setRoute={setRoute} layout="grid" />
    </nav>
  );
}

/* ===== Boutons de navigation ===== */
function NavButtons({
  route,
  setRoute,
  layout,
}: {
  route: Route;
  setRoute: (r: Route) => void;
  layout: "row" | "grid";
}) {
  const items: { key: Route; label: string; icon: IconName }[] = [
    { key: "home", label: "Accueil", icon: "home" },
    { key: "games", label: "Jeux", icon: "dart" },
    { key: "profiles", label: "Profils", icon: "user" },
    { key: "friends", label: "Amis", icon: "users" },
    { key: "allgames", label: "Tous les jeux", icon: "folder" },
    { key: "stats", label: "Stats", icon: "chart" },
    { key: "settings", label: "Réglages", icon: "settings" },
  ];

  const btnBase: React.CSSProperties = {
    appearance: "none",
    border: "1px solid transparent",
    background: "transparent",
    color: "#e7e7e7",
    width: "100%",
    padding: layout === "row" ? "8px 10px" : "8px 4px",
    borderRadius: 12,
    display: "flex",
    flexDirection: layout === "row" ? "row" : "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    cursor: "pointer",
    transition:
      "transform 120ms ease, background 160ms ease, color 160ms ease, border 160ms ease",
    fontSize: 12,
    lineHeight: 1.1,
  };

  const activeBg =
    "radial-gradient(120px 60px at 50% -20%, rgba(245,158,11,.35), rgba(245,158,11,.08))";

  return (
    <>
      {items.map((it) => {
        const active = route === it.key;
        return (
          <button
            key={it.key}
            onClick={() => setRoute(it.key)}
            aria-current={active ? "page" : undefined}
            title={it.label}
            style={{
              ...btnBase,
              background: active ? activeBg : "transparent",
              color: active ? "var(--c-primary)" : "#e7e7e7",
              border: active
                ? "1px solid rgba(245,158,11,.35)"
                : "1px solid transparent",
              fontWeight: active ? 800 : 600,
            }}
          >
            <Icon name={it.icon} active={active} />
            <span
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                maxWidth: 120,
              }}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </>
  );
}
