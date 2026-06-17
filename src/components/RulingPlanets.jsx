const cardStyle = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px", padding: "10px", margin: "8px 0"
};
const headerStyle = { margin: "0 0 6px 0", fontSize: "0.95rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)", borderBottom: "1px solid var(--bdr)", paddingBottom: "4px" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "4px" };
const labelStyle = { fontSize: "0.6rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" };
const valueStyle = { fontSize: "0.85rem", fontWeight: 600, marginTop: "2px" };

import * as C from "../data/constants";

const RP_COLORS = ["#FF5722","#2196F3","#4CAF50","#FF9800","#9C27B0","#E91E63","#00BCD4"];

const RP_LABELS = [
  "Day Lord", "Lagna Sign Lord", "Lagna Star Lord", "Lagna Sub Lord",
  "Moon Star Lord", "Moon Sub Lord", "Moon Sign Lord"
];

export default function RulingPlanets({ data }) {
  if (!data) return null;
  const rpKeys = ["rp0", "rp1", "rp2", "rp3", "rp4", "rp5", "rp6"];

  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>Ruling Planets</h3>
      {data.timestamp && (
        <div style={{ fontSize: "0.65rem", color: "#777", marginBottom: "6px" }}>
          {data.timestamp} &mdash; Lagna: {data.lagna || "--"}
        </div>
      )}
      <div style={gridStyle}>
        {rpKeys.map((key, i) => {
          const raw = data[key] || "--";
          const fullName = C.STAR_TO_PLANET[raw] || raw;
          const planetColor = C.PLANET_COLORS[fullName];
          return (
            <div key={i} style={{ background: "var(--card-sub)", padding: "4px 8px", borderRadius: "4px", textAlign: "center", borderLeft: `3px solid ${RP_COLORS[i]}`, borderTop: "1px solid var(--bdr)", borderRight: "1px solid var(--bdr)", borderBottom: "1px solid var(--bdr)" }}>
              <div style={labelStyle}>{RP_LABELS[i]}</div>
              <div style={{ ...valueStyle, color: planetColor || RP_COLORS[i] }}>{fullName}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
