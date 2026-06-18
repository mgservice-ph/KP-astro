import { useState } from "react";
import { verifyPassword } from "../utils/adminAuth";

export default function LoginScreen({ onLogin }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const ok = await verifyPassword(pwd);
    if (ok) {
      sessionStorage.setItem("adminLoggedIn", "1");
      onLogin();
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#111110", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#1a1a18", padding: 48, minWidth: 300, textAlign: "center"
      }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 400, color: "#e0e0d8", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 2 }}>KP Astro</div>
        <div style={{ fontSize: "0.6rem", color: "#666", marginBottom: 32, textTransform: "uppercase", letterSpacing: "2.5px", fontWeight: 400 }}>Admin</div>
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
          placeholder="Password" autoFocus
          style={{
            width: "100%", padding: "10px 0", border: "none", borderBottom: "1px solid #333",
            background: "transparent", color: "#e0e0d8", fontSize: "0.85rem", outline: "none",
            boxSizing: "border-box", marginBottom: 24,
            fontFamily: "'Inter', system-ui, sans-serif"
          }} />
        {error && <div style={{ color: "#C9603F", fontSize: "0.7rem", marginBottom: 16 }}>{error}</div>}
        <button type="submit" style={{
          width: "100%", padding: "10px 0", border: "1px solid #555",
          background: "transparent", color: "#e0e0d8", fontWeight: 400,
          fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase"
        }}>Enter</button>
      </form>
    </div>
  );
}
