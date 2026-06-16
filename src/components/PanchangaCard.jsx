const cardStyle = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px", padding: "16px", margin: "16px 0"
};
const headerStyle = { margin: "0 0 12px 0", fontSize: "1.1rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)", borderBottom: "1px solid var(--bdr)", paddingBottom: "8px" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" };
const labelStyle = { fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" };
const valueStyle = { fontSize: "1rem", fontWeight: 600, marginTop: "2px" };

const PANCHANGA_COLORS = ["#E91E63","#FF9800","#4CAF50","#2196F3","#9C27B0","#00BCD4"];
const YOGI_COLORS = ["#FF5722","#3F51B5","#009688"];

export default function PanchangaCard({ data }) {
  if (!data) return null;
  const items = [
    { label: "Vaara", value: data.vaara },
    { label: "Thithi", value: data.thithi },
    { label: "Nakshatra", value: data.nakshatra },
    { label: "Yogam", value: data.yoga },
    { label: "Karanam", value: data.karana },
    { label: "Day Lord", value: data.dayLord },
  ];

  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>Panchanga</h3>
      <div style={gridStyle}>
        {items.map((it, i) => (
          <div key={i} style={{ background: "var(--card-sub)", padding: "8px 12px", borderRadius: "4px", borderLeft: `3px solid ${PANCHANGA_COLORS[i]}`, borderTop: "1px solid var(--bdr)", borderRight: "1px solid var(--bdr)", borderBottom: "1px solid var(--bdr)" }}>
            <div style={labelStyle}>{it.label}</div>
            <div style={{ ...valueStyle, color: PANCHANGA_COLORS[i] }}>{it.value || "--"}</div>
          </div>
        ))}
      </div>
      {data.yogiAvayogi && (
        <div style={{ ...gridStyle, marginTop: "12px" }}>
          {["Yogi","Avayogi","Yogi Star"].map((lbl, i) => (
            <div key={lbl} style={{ background: "var(--card-sub)", padding: "8px 12px", borderRadius: "4px", borderLeft: `3px solid ${YOGI_COLORS[i]}`, borderTop: "1px solid var(--bdr)", borderRight: "1px solid var(--bdr)", borderBottom: "1px solid var(--bdr)" }}>
              <div style={labelStyle}>{lbl}</div>
              <div style={{ ...valueStyle, color: YOGI_COLORS[i] }}>{data.yogiAvayogi[lbl === "Yogi" ? "yogi" : lbl === "Avayogi" ? "avayogi" : "yogiStar"] || "--"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
