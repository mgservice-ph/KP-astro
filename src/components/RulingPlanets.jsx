const cardStyle = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px", padding: "16px", margin: "16px 0"
};
const headerStyle = { margin: "0 0 12px 0", fontSize: "1.1rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)", borderBottom: "1px solid var(--bdr)", paddingBottom: "8px" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" };
const labelStyle = { fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" };
const valueStyle = { fontSize: "1rem", fontWeight: 600, marginTop: "2px" };

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
        <div style={{ fontSize: "0.75rem", color: "#777", marginBottom: "8px" }}>
          {data.timestamp} &mdash; Lagna: {data.lagna || "--"}
        </div>
      )}
      <div style={gridStyle}>
        {rpKeys.map((key, i) => {
          const val = data[key] || "--";
          const planetColor = C.PLANET_COLORS[val];
          return (
            <div key={i} style={{ background: "var(--card-sub)", padding: "8px 12px", borderRadius: "4px", textAlign: "center", borderLeft: `3px solid ${RP_COLORS[i]}`, borderTop: "1px solid var(--bdr)", borderRight: "1px solid var(--bdr)", borderBottom: "1px solid var(--bdr)" }}>
              <div style={labelStyle}>{RP_LABELS[i]}</div>
              <div style={{ ...valueStyle, color: planetColor || RP_COLORS[i] }}>{val}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
