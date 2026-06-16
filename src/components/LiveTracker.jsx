export default function LiveTracker({ activeDasha, visible }) {
  if (!visible || !activeDasha?.mahadasha) return null;

  return (
    <div style={{
      background: "var(--active-bg)", border: "1px solid var(--active-border)",
      borderRadius: "6px", padding: "10px", marginBottom: "16px",
      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px"
    }}>
      <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted)", margin: 0 }}>
        Operational Planetary Alignment (Today)
      </h4>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontSize: "1.15rem",
        fontWeight: 700, color: "var(--fg)", wordBreak: "break-word", lineHeight: 1.4
      }}>
        <span style={{ color: "var(--accent)" }}>{activeDasha.mahadasha}</span> (Maha) ➔
        <span style={{ color: "var(--accent)" }}> {activeDasha.bhukti || "--"}</span> (Bhukti) ➔
        <span style={{ color: "var(--accent)" }}> {activeDasha.pratyantar || "--"}</span> (Antra)
      </div>
    </div>
  );
}
