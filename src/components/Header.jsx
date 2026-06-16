import * as C from "../data/constants";

const containerStyle = {
  background: "var(--card)", color: "var(--fg)", padding: "16px 24px",
  display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px",
  borderBottom: "1px solid var(--bdr)"
};
const titleStyle = { margin: 0, fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Playfair Display',serif", color: "var(--accent)", letterSpacing: "0.5px" };
const subtitleStyle = { margin: 0, fontSize: "0.75rem", color: "var(--muted)", fontWeight: 300 };
const selectStyle = {
  padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--bdr-strong)",
  background: "var(--card-sub)", color: "var(--fg)", fontSize: "0.8rem", cursor: "pointer"
};
const labelStyle = { fontSize: "0.75rem", color: "var(--muted)", marginRight: "4px" };
const btnStyle = {
  padding: "6px 14px", borderRadius: "4px", border: "1px solid var(--bdr-strong)",
  background: "var(--card-sub)", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem",
  transition: "background 0.2s"
};

export default function Header({ theme, onThemeToggle }) {
  return (
    <header style={containerStyle}>
      <div style={{ flex: "1 1 200px" }}>
        <h1 style={titleStyle}>Krishnamurti Paddhati</h1>
        <p style={subtitleStyle}>Precision Relational System &bull; Placidus Coordinate Engine</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button style={btnStyle} onClick={onThemeToggle}>&#9681; {theme === "dark" ? "Light" : "Dark"} Mode</button>
      </div>
    </header>
  );
}
