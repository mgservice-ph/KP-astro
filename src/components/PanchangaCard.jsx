const cardStyle = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px", padding: "10px", margin: "8px 0"
};
const headerStyle = { margin: "0 0 6px 0", fontSize: "0.95rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)", borderBottom: "1px solid var(--bdr)", paddingBottom: "4px" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "4px" };
const labelStyle = { fontSize: "0.6rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" };
const valueStyle = { fontSize: "0.85rem", fontWeight: 600, marginTop: "2px" };

const PANCHANGA_COLORS = ["#E91E63","#FF9800","#4CAF50","#2196F3","#9C27B0","#00BCD4"];
const THITHI_COLOR = "#E67E22";
const YOGI_COLORS = ["#FF5722","#3F51B5","#009688"];

export default function PanchangaCard({ data }) {
  if (!data) return null;
  const items = [
    { label: "Vaara", value: data.vaara },
    { label: "Thithi", value: data.thithi },
    { label: "Nakshatra", value: data.nakshatra },
    { label: "Karanam", value: data.karana },
    { label: "Day Lord", value: data.dayLord },
  ];

  const yogiData = data.yogiAvayogi;

  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>Panchanga details</h3>
      <div style={gridStyle}>
        {items.map((it, i) => {
          const c = it.label === "Thithi" ? THITHI_COLOR : PANCHANGA_COLORS[i];
          return (
            <div key={i} style={{ background: "var(--card-sub)", padding: "4px 8px", borderRadius: "4px", borderLeft: `3px solid ${c}`, borderTop: "1px solid var(--bdr)", borderRight: "1px solid var(--bdr)", borderBottom: "1px solid var(--bdr)" }}>
              <div style={labelStyle}>{it.label}</div>
              <div style={{ ...valueStyle, color: c }}>{it.value || "--"}</div>
            </div>
          );
        })}
      </div>
        <div style={{ display: "inline-block", marginTop: "4px", background: "var(--card-sub)", padding: "4px 8px", borderRadius: "4px", borderLeft: `3px solid ${PANCHANGA_COLORS[3]}`, borderTop: "1px solid var(--bdr)", borderRight: "1px solid var(--bdr)", borderBottom: "1px solid var(--bdr)" }}>
          <div style={labelStyle}>Yogam</div>
          <div style={{ ...valueStyle, color: PANCHANGA_COLORS[3] }}>{data.yoga ? `${data.yoga} (${yogiData?.yogiStar || "--"})` : "--"}</div>
          {yogiData && (
            <div style={{ marginTop: "4px", borderTop: "1px solid var(--bdr)", paddingTop: "4px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "nowrap", fontSize: "0.7rem" }}>
              {[
                { label: "Yogi", key: "yogi", color: YOGI_COLORS[0] },
                { label: "Avayogi", key: "avayogi", color: YOGI_COLORS[1] },
              ].map((t, i) => (
                <span key={t.key}>
                  <span style={{
                    background: t.color, color: "#fff", borderRadius: "3px",
                    padding: "1px 5px", fontWeight: 600, fontSize: "0.6rem",
                    letterSpacing: "0.3px", lineHeight: "1.4",
                  }}>{t.label}</span>
                  <span style={{ color: "var(--fg)", fontWeight: 500, marginLeft: "3px" }}>{yogiData[t.key] || "--"}</span>
                  {i < 1 && <span style={{ color: "var(--muted)", marginLeft: "6px" }}>|</span>}
                </span>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}