import * as C from "../data/constants";

const GRID_COORDS = [[11, 0, 1, 2], [10, -1, -1, 3], [9, -1, -1, 4], [8, 7, 6, 5]];
const FACTOR_NAMES = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Lagna","Sarva"];
const TONES = [
  { bg: "hsla(40,90%,60%,0.08)", bdr: "hsla(40,90%,50%,0.3)" },
  { bg: "hsla(210,70%,70%,0.08)", bdr: "hsla(210,70%,55%,0.3)" },
  { bg: "hsla(0,75%,55%,0.08)", bdr: "hsla(0,75%,45%,0.3)" },
  { bg: "hsla(120,55%,50%,0.08)", bdr: "hsla(120,55%,40%,0.3)" },
  { bg: "hsla(50,90%,60%,0.08)", bdr: "hsla(50,90%,50%,0.3)" },
  { bg: "hsla(330,70%,70%,0.08)", bdr: "hsla(330,70%,60%,0.3)" },
  { bg: "hsla(240,40%,55%,0.08)", bdr: "hsla(240,40%,45%,0.3)" },
  { bg: "hsla(30,50%,60%,0.08)", bdr: "hsla(30,50%,50%,0.3)" },
  { bg: "hsla(0,0%,60%,0.06)", bdr: "hsla(0,0%,50%,0.25)" },
];

function FactorGrid({ name, data, toneIndex }) {
  const isSarva = name === "Sarva";
  const tone = TONES[toneIndex];
  const gridStyle = {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
    border: "2px solid var(--bdr-strong)", borderRadius: "6px",
    width: "100%", maxWidth: "220px", aspectRatio: "1",
    background: tone.bg,
  };
  const cellBase = {
    background: "var(--card)", padding: "3px", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: "1px",
    boxShadow: "0 0 0 0.5px var(--bdr-strong)",
  };
  const emptyCell = { ...cellBase, background: "var(--grid-empty)" };

  function cellColor(val) {
    if (isSarva) {
      if (val >= 28) return { background: "rgba(46,125,50,0.18)", color: "#2E7D32", fontWeight: 700 };
      return { background: "rgba(198,40,40,0.12)", color: "#C62828", fontWeight: 700 };
    }
    if (val >= 1) return { background: "rgba(46,125,50,0.1)", color: "var(--text)", fontWeight: 600 };
    return { opacity: 0.35, color: "var(--muted)" };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{name}</div>
      <div style={gridStyle}>
        {GRID_COORDS.flatMap((row, ri) =>
          row.map((si, ci) => {
            const key = ri * 4 + ci;
            if (si === -1) return <div key={key} style={emptyCell} />;
            return (
              <div key={key} style={{ ...cellBase, ...cellColor(data[si]) }}>
                <span style={{ fontSize: "0.55rem", color: "var(--muted)", lineHeight: 1 }}>{C.ZODIAC_NAMES[si].s}</span>
                <span style={{ fontSize: "0.75rem", lineHeight: 1.2 }}>{data[si]}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AshtakavargaChart({ data }) {
  if (!data || !data.chart) return null;
  const { chart } = data;

  return (
    <div className="studio-card" style={{ marginTop: 16 }}>
      <h3 style={{ textAlign: "center", justifyContent: "center" }}>Ashtakavarga</h3>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
        marginTop: 8,
      }}>
        {FACTOR_NAMES.map((fn, i) => (
          <div key={fn} style={{ flex: "0 1 auto", minWidth: 120, maxWidth: 200 }}>
            <FactorGrid name={fn} data={chart[fn]} toneIndex={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
