// src/components/X01Setup.tsx
import React from "react";

/* =========================
   Types & constantes X01 (AutoDarts-compliant)
   ========================= */
export type X01InOut = "straight" | "double" | "master";
export type X01BullMode = "25/50" | "50/50";
export type X01BullOff = "off" | "normal" | "official";
export type X01MatchMode = "off" | "legs" | "sets";
export type X01Lobby = "public" | "private";

export interface X01Settings {
  baseScore: 301 | 501 | 701 | 1001;
  inMode: X01InOut;
  outMode: X01InOut;
  maxRounds?: number;                // si défini: partie s’arrête au max de rounds
  bullMode: X01BullMode;             // 25/50 ou 50/50
  bullOff: X01BullOff;               // Off / Normal / Official
  matchMode: X01MatchMode;           // Off / Legs / Sets
  legsToWin?: number;                // 1..11 (si matchMode === "legs")
  setsToWin?: number;                // 1..7  (si matchMode === "sets")
  legsPerSetToWin?: 2 | 3;           // si matchMode === "sets" (set joué en 2 ou 3 legs)
  lobby: X01Lobby;                   // Public / Private (pour l’online)
}

export interface Player { id: string; name: string; avatarUrl?: string; }

/* =========================
   Composant X01Setup
   - Affiche les réglages + le sélecteur de joueurs (2 colonnes)
   - Compatible local & online (le parent décide quoi faire dans onStart)
   ========================= */
export default function X01Setup({
  allPlayers,
  defaultSettings,
  onStart,
  onCancel,
}: {
  allPlayers: Player[];
  defaultSettings?: Partial<X01Settings>;
  onStart: (settings: X01Settings, selected: Player[]) => void;
  onCancel?: () => void;
}) {
  const [settings, setSettings] = React.useState<X01Settings>({
    baseScore: (defaultSettings?.baseScore as any) ?? 501,
    inMode: defaultSettings?.inMode ?? "straight",
    outMode: defaultSettings?.outMode ?? "double",
    maxRounds: defaultSettings?.maxRounds ?? undefined,
    bullMode: defaultSettings?.bullMode ?? "25/50",
    bullOff: defaultSettings?.bullOff ?? "off",
    matchMode: defaultSettings?.matchMode ?? "legs",
    legsToWin: defaultSettings?.legsToWin ?? 3,
    setsToWin: defaultSettings?.setsToWin ?? 2,
    legsPerSetToWin: (defaultSettings?.legsPerSetToWin as any) ?? 3,
    lobby: defaultSettings?.lobby ?? "private",
  });

  const [selected, setSelected] = React.useState<Player[]>([]);

  const togglePlayer = (p: Player) =>
    setSelected((arr) =>
      arr.some((x) => x.id === p.id) ? arr.filter((x) => x.id !== p.id) : [...arr, p]
    );

  const startDisabled = selected.length === 0 ||
    (settings.matchMode === "legs" && !settings.legsToWin) ||
    (settings.matchMode === "sets" && (!settings.setsToWin || !settings.legsPerSetToWin));

  const numRange = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      {/* ===== Bloc Réglages — pleine largeur ===== */}
      <div
        style={{
          background: "#101013",
          borderRadius: 12,
          padding: 16,
          border: "1px solid #222",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 12, color: "#fff" }}>Paramètres X01</h2>

        {/* Base score */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: "#aaa", marginBottom: 6 }}>Score de départ</div>
          {[301, 501, 701, 1001].map((s) => (
            <button
              key={s}
              onClick={() => setSettings((st) => ({ ...st, baseScore: s as any }))}
              style={{
                marginRight: 8,
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #30333a",
                background: settings.baseScore === s ? "#f4b400" : "#1a1c22",
                color: settings.baseScore === s ? "#000" : "#e7e7e7",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* In / Out */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 10 }}>
          <Select
            label="In mode"
            value={settings.inMode}
            onChange={(v) => setSettings((st) => ({ ...st, inMode: v as X01InOut }))}
            options={[
              { v: "straight", l: "Straight" },
              { v: "double", l: "Double" },
              { v: "master", l: "Master" },
            ]}
          />
          <Select
            label="Out mode"
            value={settings.outMode}
            onChange={(v) => setSettings((st) => ({ ...st, outMode: v as X01InOut }))}
            options={[
              { v: "straight", l: "Straight" },
              { v: "double", l: "Double" },
              { v: "master", l: "Master" },
            ]}
          />
        </div>

        {/* Max rounds, Bull mode, Bull-off */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 10 }}>
          <NumberBox
            label="Max rounds (optionnel)"
            value={settings.maxRounds ?? ""}
            placeholder="illimité"
            min={1}
            onChange={(n) => setSettings((st) => ({ ...st, maxRounds: Number.isNaN(n) ? undefined : n }))}
          />
          <Select
            label="Bull mode"
            value={settings.bullMode}
            onChange={(v) => setSettings((st) => ({ ...st, bullMode: v as X01BullMode }))}
            options={[
              { v: "25/50", l: "25 / 50" },
              { v: "50/50", l: "50 / 50" },
            ]}
          />
          <Select
            label="Bull-off"
            value={settings.bullOff}
            onChange={(v) => setSettings((st) => ({ ...st, bullOff: v as X01BullOff }))}
            options={[
              { v: "off", l: "Off" },
              { v: "normal", l: "Normal" },
              { v: "official", l: "Official" },
            ]}
          />
        </div>

        {/* Match mode */}
        <div style={{ marginTop: 8 }}>
          <Select
            label="Match mode"
            value={settings.matchMode}
            onChange={(v) => setSettings((st) => ({ ...st, matchMode: v as X01MatchMode }))}
            options={[
              { v: "off", l: "Off (sans limite)" },
              { v: "legs", l: "Legs" },
              { v: "sets", l: "Sets" },
            ]}
          />

          {settings.matchMode === "legs" && (
            <Row>
              <Select
                label="Jusqu’à (legs)"
                value={String(settings.legsToWin ?? 3)}
                onChange={(v) => setSettings((st) => ({ ...st, legsToWin: parseInt(v, 10) }))}
                options={numRange(1, 11).map((n) => ({ v: String(n), l: `First to ${n}` }))}
              />
            </Row>
          )}

          {settings.matchMode === "sets" && (
            <Row>
              <Select
                label="Jusqu’à (sets)"
                value={String(settings.setsToWin ?? 2)}
                onChange={(v) => setSettings((st) => ({ ...st, setsToWin: parseInt(v, 10) }))}
                options={numRange(1, 7).map((n) => ({ v: String(n), l: `First to ${n}` }))}
              />
              <Select
                label="Set gagné en"
                value={String(settings.legsPerSetToWin ?? 3)}
                onChange={(v) =>
                  setSettings((st) => ({ ...st, legsPerSetToWin: parseInt(v, 10) as 2 | 3 }))
                }
                options={[
                  { v: "2", l: "2 legs" },
                  { v: "3", l: "3 legs" },
                ]}
              />
            </Row>
          )}
        </div>

        {/* Lobby (utile pour l’online) */}
        <div style={{ marginTop: 10 }}>
          <Select
            label="Lobby"
            value={settings.lobby}
            onChange={(v) => setSettings((st) => ({ ...st, lobby: v as X01Lobby }))}
            options={[
              { v: "public", l: "Public" },
              { v: "private", l: "Private" },
            ]}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            onClick={() => onStart(settings, selected)}
            disabled={startDisabled}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              background: startDisabled ? "#2a2d35" : "#0aa34f",
              color: "#fff",
              border: "1px solid #1e5536",
              fontWeight: 700,
              cursor: startDisabled ? "not-allowed" : "pointer",
            }}
          >
            Lancer la partie
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              background: "#1b1e24",
              color: "#c9c9c9",
              border: "1px solid #2b2f37",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
        </div>
      </div>

      {/* ===== Sélection des joueurs — 2 colonnes ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Pane title="Joueurs disponibles">
          {allPlayers
            .filter((p) => !selected.some((s) => s.id === p.id))
            .map((p) => (
              <PlayerRow key={p.id} p={p} onClick={() => togglePlayer(p)} />
            ))}
        </Pane>
        <Pane title="Joueurs sélectionnés">
          {selected.map((p) => (
            <PlayerRow key={p.id} p={p} onClick={() => togglePlayer(p)} />
          ))}
        </Pane>
      </div>
    </div>
  );
}

/* =========================
   Petits sous-composants UI
   ========================= */
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function Pane({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#12151b", borderRadius: 12, border: "1px solid #222", padding: 12 }}>
      <h3 style={{ marginTop: 2, marginBottom: 10, color: "#f4b400", fontSize: 16 }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function PlayerRow({ p, onClick }: { p: Player; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 8,
        borderRadius: 10,
        background: "#1a1d24",
        border: "1px solid #2b2f37",
        color: "#fff",
        cursor: "pointer",
        marginBottom: 8,
      }}
    >
      {p.avatarUrl ? (
        <img src={p.avatarUrl} alt="" style={{ width: 34, height: 34, borderRadius: 999 }} />
      ) : (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            background: "#2b2f37",
            display: "grid",
            placeItems: "center",
            fontSize: 14,
          }}
        >
          {p.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div style={{ fontWeight: 600 }}>{p.name}</div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ v: string; l: string }>;
}) {
  return (
    <label style={{ color: "#c9c9c9", display: "flex", flexDirection: "column", gap: 6 }}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "#16181e",
          color: "#e7e7e7",
          border: "1px solid #30333a",
          borderRadius: 10,
          padding: "8px 10px",
        }}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberBox({
  label,
  value,
  placeholder,
  min,
  onChange,
}: {
  label: string;
  value: number | string;
  placeholder?: string;
  min?: number;
  onChange: (n: number) => void;
}) {
  return (
    <label style={{ color: "#c9c9c9", display: "flex", flexDirection: "column", gap: 6 }}>
      <span>{label}</span>
      <input
        type="number"
        value={value as any}
        placeholder={placeholder}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: "#16181e",
          color: "#e7e7e7",
          border: "1px solid #30333a",
          borderRadius: 10,
          padding: "8px 10px",
          width: "100%",
        }}
      />
    </label>
  );
}
