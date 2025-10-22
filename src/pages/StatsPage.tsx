import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { CalendarRange, Target, TrendingUp, BarChart3, Download, Filter, RefreshCw, Trophy, Sparkles, User, Percent } from "lucide-react";

// ---------------------------------------------------------------------------
// UI basique (fonctionne même sans Tailwind)
// ---------------------------------------------------------------------------
const Card = ({ className = "", children }: React.PropsWithChildren<{ className?: string }>) => (
  <div style={{ background: "rgba(24,24,27,.9)", border: "1px solid #2a2a2a", borderRadius: 16, boxShadow: "0 6px 24px rgba(0,0,0,.35)" }}>
    {children}
  </div>
);
const CardHeader = ({ children }: React.PropsWithChildren) => (
  <div style={{ padding: 16, borderBottom: "1px solid #2a2a2a" }}>{children}</div>
);
const CardContent = ({ children }: React.PropsWithChildren) => (
  <div style={{ padding: 16 }}>{children}</div>
);
const Pill = ({ children }: React.PropsWithChildren) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: "rgba(39,39,42,.7)", padding: "6px 10px", fontSize: 12, color: "#c4c4cc", border: "1px solid #3a3a3a" }}>
    {children}
  </span>
);
const Button = ({
  children, onClick, variant = "default", type = "button", disabled,
}: React.PropsWithChildren<{ onClick?: () => void; variant?: "default" | "ghost" | "outline"; type?: "button" | "submit"; disabled?: boolean }>) => {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, padding: "10px 14px", fontSize: 14, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
    transition: "transform .05s ease", border: "1px solid transparent",
  };
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "rgba(16,185,129,.9)", color: "#0a0a0a" },
    ghost: { background: "transparent", color: "#e5e7eb" },
    outline: { background: "transparent", color: "#e5e7eb", borderColor: "#3a3a3a" },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...styles[variant] }}>
      {children}
    </button>
  );
};
const Select = ({ value, onChange, children }: any) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    style={{ borderRadius: 12, background: "#0b0b0d", border: "1px solid #3a3a3a", padding: "8px 10px", color: "#f3f4f6", fontSize: 14, outline: "none" }}
  >
    {children}
  </select>
);
const Input = ({ value, onChange, placeholder, type = "text" }: any) => (
  <input
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    placeholder={placeholder}
    type={type}
    style={{ borderRadius: 12, background: "#0b0b0d", border: "1px solid #3a3a3a", padding: "8px 10px", color: "#f3f4f6", fontSize: 14, outline: "none", minWidth: 220 }}
  />
);

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------
export type ThrowEntry = { score: number; ring: string; segment: number; };
export type Visit = { throws: ThrowEntry[]; total: number; };
export type GameRecord = {
  id: string;
  date: string;
  mode: "X01" | "Cricket" | "AroundTheWorld" | "Training" | string;
  x01?: { start: number; finishRule?: "double-out" | "single-out" | "master-out" };
  players: Array<{
    profileId: string; name: string; avatarUrl?: string; visits: Visit[]; won: boolean; checkout?: number;
  }>;
};
export type Profile = { id: string; name: string; avatarUrl?: string };

function sum(xs: number[]) { return xs.reduce((a, b) => a + b, 0); }
function avg(xs: number[]) { return xs.length ? sum(xs) / xs.length : 0; }
function round(n: number, p = 1) { const m = Math.pow(10, p); return Math.round(n * m) / m; }

function rand(seed: number) { let x = Math.sin(seed) * 10000; return x - Math.floor(x); }
function makeDemoGames(count = 18, profile: Profile = { id: "p1", name: "Guest" }): GameRecord[] {
  const games: GameRecord[] = [];
  for (let i = 0; i < count; i++) {
    const start = 501;
    const visits: Visit[] = [];
    let remaining = start;
    let v = 0;
    let highestCheckout = 0;
    while (remaining > 0 && v < 20) {
      const r = rand(i * 97 + v * 31);
      let visitTotal = Math.round(20 + r * 80); // 20..100
      if (v % 5 === 0 && r > 0.8) visitTotal = 140;
      if (v % 7 === 0 && r > 0.9) visitTotal = 180;
      visitTotal = Math.min(visitTotal, remaining);
      remaining -= visitTotal;
      const t: ThrowEntry[] = [
        { score: Math.min(60, visitTotal), ring: "T", segment: 20 },
        { score: Math.min(60, Math.max(0, visitTotal - 60)), ring: "T", segment: 20 },
        { score: Math.max(0, visitTotal - 120), ring: "S", segment: 20 },
      ];
      visits.push({ throws: t, total: visitTotal });
      v++;
      if (remaining <= 170 && remaining > 1 && r > 0.6) highestCheckout = Math.max(highestCheckout, remaining);
    }
    games.push({
      id: `g${i}`,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      mode: "X01",
      x01: { start: start, finishRule: "double-out" },
      players: [{ profileId: profile.id, name: profile.name, visits, won: rand(i * 13) > 0.45, checkout: highestCheckout || undefined }],
    });
  }
  return games;
}

function computePlayerStats(games: GameRecord[], profileId: string) {
  const rows = games.flatMap(g => g.players.filter(p => p.profileId === profileId).map(p => ({ game: g, player: p })));
  const legs = rows.length;
  const visitsAll = rows.flatMap(r => r.player.visits);
  const visitTotals = visitsAll.map(v => v.total);
  const dartsThrown = rows.reduce((acc, r) => acc + r.player.visits.reduce((a, v) => a + v.throws.length, 0), 0);
  const won = rows.filter(r => r.player.won).length;

  const bands = [
    { label: "0-59", min: 0, max: 59 },
    { label: "60-99", min: 60, max: 99 },
    { label: "100-139", min: 100, max: 139 },
    { label: "140+", min: 140, max: 179 },
    { label: "180", min: 180, max: 180 },
  ].map(b => ({ label: b.label, count: visitTotals.filter(v => v >= b.min && v <= b.max).length }));

  const bestVisit = Math.max(0, ...visitTotals);
  const threeDartAvg = avg(visitTotals);
  const perDartAvg = dartsThrown ? sum(visitTotals) / dartsThrown : 0;

  const line = rows.map(({ game, player }) => ({
    date: new Date(game.date).toLocaleDateString(),
    threeAvg: round(avg(player.visits.map(v => v.total)), 1),
  }));

  const doublesAttempts = rows.reduce((acc, r) => acc + (r.player.checkout ? 1 : 0), 0);
  const doublesHits = rows.reduce((acc, r) => acc + (r.player.won ? 1 : 0), 0); // proxy
  const doubles = [
    { name: "Checkout", value: doublesHits },
    { name: "Miss", value: Math.max(0, doublesAttempts - doublesHits) },
  ];

  const segMap: Record<string, number> = {};
  rows.forEach(r => r.player.visits.forEach(v => v.throws.forEach(t => {
    const key = `${t.ring}${t.segment}`;
    segMap[key] = (segMap[key] || 0) + 1;
  })));
  const topSegs = Object.entries(segMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ subject: k, A: v }));

  return {
    legs, won, winRate: legs ? (won / legs) * 100 : 0,
    dartsThrown, visits: visitsAll.length, bestVisit, threeDartAvg, perDartAvg,
    line, bands, doubles, topSegs,
    highestCheckout: Math.max(0, ...rows.map(r => r.player.checkout || 0)),
    recent: rows.slice(0, 8).map(r => ({
      id: r.game.id,
      date: new Date(r.game.date).toLocaleString(),
      mode: r.game.mode,
      avg: round(avg(r.player.visits.map(v => v.total)), 1),
      result: r.player.won ? "Win" : "Loss",
      checkout: r.player.checkout || 0,
    })),
  };
}

function exportCSV(rows: any[], filename = "stats.csv") {
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------
export type StatsPageProps = {
  profiles?: Profile[];
  games?: GameRecord[];
  activeProfileId?: string;
};

export default function StatsPage({ profiles = [{ id: "p1", name: "Guest" }], games, activeProfileId }: StatsPageProps) {
  const [profileId, setProfileId] = useState<string>(activeProfileId || profiles[0]?.id || "p1");
  const [mode, setMode] = useState<string>("ALL");
  const [useDemo, setUseDemo] = useState<boolean>(!games || games.length === 0);
  const [query, setQuery] = useState("");

  const data = useMemo(() => {
    const base = useDemo ? makeDemoGames(20, profiles.find(p => p.id === profileId) || { id: profileId, name: "Guest" }) : (games || []);
    const filtered = base.filter(g => (mode === "ALL" ? true : g.mode === mode));
    return filtered;
  }, [games, profileId, mode, useDemo, profiles]);

  const stats = useMemo(() => computePlayerStats(data, profileId), [data, profileId]);

  useEffect(() => {
    if (!profiles.some(p => p.id === profileId)) setProfileId(profiles[0]?.id || "p1");
  }, [profiles, profileId]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16, color: "#e5e7eb", fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ height: 44, width: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.35)" }}>
            <BarChart3 size={20} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>Statistiques</div>
            <div style={{ fontSize: 13, color: "#a1a1aa" }}>Analyse de vos performances — X01, Cricket & entraînements</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Select value={profileId} onChange={setProfileId}>
            {profiles.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </Select>
          <Select value={mode} onChange={setMode}>
            <option value="ALL">Tous les modes</option>
            <option value="X01">X01</option>
            <option value="Cricket">Cricket</option>
            <option value="Training">Training</option>
          </Select>
          <Button variant="outline" onClick={() => setUseDemo(v => !v)}>
            <RefreshCw size={16} /> {useDemo ? "Données démo" : "Données réelles"}
          </Button>
          <Button variant="outline" onClick={() => exportCSV(stats.recent, "recent-games.csv")}>
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <StatTile icon={<TrendingUp size={16} />} label="Moyenne / 3 flèches" value={`${round(stats.threeDartAvg, 1)} pts`} hint="Visites moyennes" />
        <StatTile icon={<Target size={16} />} label="Meilleure volée" value={`${stats.bestVisit} pts`} hint="Record personnel" />
        <StatTile icon={<Percent size={16} />} label="Taux de victoire" value={`${round(stats.winRate, 1)} %`} hint={`${stats.won}/${stats.legs} manches`} />
        <StatTile icon={<Trophy size={16} />} label="Plus haut checkout" value={`${stats.highestCheckout || 0}`} hint="X01" />
      </div>

      {/* Charts row 1 */}
      <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr" }}>
        <Card>
          <CardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Pill><CalendarRange size={14} /> Evolution</Pill>
                <span style={{ fontSize: 13, color: "#a1a1aa" }}>Moyenne par partie</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* ⬇️ Hauteur inline */}
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer>
                <LineChart data={stats.line} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickMargin={8} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} width={40} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12 }} labelStyle={{ color: "#e4e4e7" }} />
                  <Line type="monotone" dataKey="threeAvg" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Pill><Sparkles size={14} /> Répartition des volées</Pill>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer>
                <BarChart data={stats.bands} margin={{ left: 6, right: 6, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} width={28} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12 }} labelStyle={{ color: "#e4e4e7" }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "1fr 2fr" }}>
        <Card>
          <CardHeader>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Pill><Target size={14} /> Doubles / Checkout</Pill>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.doubles} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {stats.doubles.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={index === 0 ? "#22c55e" : "#3f3f46"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12 }} labelStyle={{ color: "#e4e4e7" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Pill><User size={14} /> Segments favoris</Pill>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer>
                <RadarChart data={stats.topSegs}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <Radar name="Fréquence" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.35} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12 }} labelStyle={{ color: "#e4e4e7" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau parties récentes */}
      <Card style={{ marginTop: 12 }}>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Pill><BarChart3 size={14} /> Parties récentes</Pill>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Input value={query} onChange={setQuery} placeholder="Filtrer… (mode, résultat)" />
                <div style={{ position: "absolute", left: 10, top: 9, color: "#71717a" }}>
                  <Filter size={14} />
                </div>
              </div>
              <Button variant="outline" onClick={() => setQuery("")}>Effacer</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#a1a1aa" }}>
                  <th style={{ padding: "8px 12px", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "8px 12px", fontWeight: 600 }}>Mode</th>
                  <th style={{ padding: "8px 12px", fontWeight: 600 }}>Moy.</th>
                  <th style={{ padding: "8px 12px", fontWeight: 600 }}>Résultat</th>
                  <th style={{ padding: "8px 12px", fontWeight: 600 }}>Checkout</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent
                  .filter(r => [r.mode, r.result].join(" ").toLowerCase().includes(query.toLowerCase()))
                  .map((r, i) => (
                    <tr key={r.id} style={{ borderTop: "1px solid #2a2a2a", background: i % 2 ? "rgba(24,24,27,.35)" : "transparent" }}>
                      <td style={{ padding: "8px 12px" }}>{r.date}</td>
                      <td style={{ padding: "8px 12px" }}>{r.mode}</td>
                      <td style={{ padding: "8px 12px" }}>{r.avg}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{
                          borderRadius: 999, padding: "4px 8px", fontSize: 12,
                          background: r.result === "Win" ? "rgba(16,185,129,.2)" : "rgba(244,63,94,.2)",
                          color: r.result === "Win" ? "#86efac" : "#fda4af",
                          border: `1px solid ${r.result === "Win" ? "rgba(16,185,129,.35)" : "rgba(244,63,94,.35)"}`
                        }}>
                          {r.result}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px" }}>{r.checkout || "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div style={{ marginTop: 16, fontSize: 12, color: "#9ca3af" }}>
        Astuce: passez sur « Données réelles » quand vos parties seront enregistrées. Le graphe d'évolution et les checkouts s'adapteront automatiquement à votre profil.
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardContent>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: "#a1a1aa" }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
              {hint && <div style={{ fontSize: 12, color: "#9ca3af" }}>{hint}</div>}
            </div>
            <div style={{ height: 40, width: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.35)" }}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
