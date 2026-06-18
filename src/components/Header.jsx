export default function Header({ theme, onThemeToggle }) {
  return (
    <header className="header" style={{ background: "var(--card)", color: "var(--fg)", padding: "16px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", borderBottom: "1px solid var(--bdr)" }}>
      <div className="header-title" style={{ flex: "1 1 200px" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Playfair Display',serif", color: "var(--accent)", letterSpacing: "0.5px" }}>Krishnamurti Paddhati</h1>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted)", fontWeight: 300 }}>Precision Relational System &bull; Placidus Coordinate Engine</p>
      </div>
      <div className="header-ctrls" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button className="btn" onClick={onThemeToggle} style={{ flex: "none", minWidth: "auto", padding: "6px 14px", fontSize: "0.8rem", color: "var(--accent)", background: "var(--card-sub)" }}>&#9681; {theme === "dark" ? "Light" : "Dark"} Mode</button>
      </div>
    </header>
  );
}
