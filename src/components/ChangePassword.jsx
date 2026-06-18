import { useState } from "react";
import { hashPassword, verifyPassword, setStoredHash } from "../utils/adminAuth";

export default function ChangePassword({ onClose }) {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    const ok = await verifyPassword(oldPwd);
    if (!ok) { setError("Old password is incorrect"); return; }
    if (newPwd.length < 3) { setError("New password must be at least 3 characters"); return; }
    if (newPwd !== confirmPwd) { setError("New password and confirm do not match"); return; }
    const newHash = await hashPassword(newPwd);
    setStoredHash(newHash);
    setMsg("Password updated");
    setTimeout(onClose, 1000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif"
    }} onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} style={{
        background: "#1a1a18", padding: 40, minWidth: 300
      }}>
        <div style={{ fontSize: "1rem", fontWeight: 400, color: "#e0e0d8", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 28, borderBottom: "1px solid #333", paddingBottom: 12 }}>Change Password</div>
        {["Old", "New", "Confirm"].map((ph, i) => {
          const props = [
            { v: oldPwd, s: setOldPwd },
            { v: newPwd, s: setNewPwd },
            { v: confirmPwd, s: setConfirmPwd }
          ][i];
          return (
            <input key={i} type="password" value={props.v} onChange={e => props.s(e.target.value)}
              placeholder={ph} autoFocus={i === 0}
              style={{
                width: "100%", padding: "8px 0", border: "none", borderBottom: "1px solid #333",
                background: "transparent", color: "#e0e0d8", fontSize: "0.8rem", outline: "none",
                boxSizing: "border-box", marginBottom: 16,
                fontFamily: "'Inter', system-ui, sans-serif"
              }} />
          );
        })}
        {error && <div style={{ color: "#C9603F", fontSize: "0.7rem", marginBottom: 12 }}>{error}</div>}
        {msg && <div style={{ color: "#888", fontSize: "0.7rem", marginBottom: 12 }}>{msg}</div>}
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid #333", marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: "10px 0", border: "none", borderRight: "1px solid #333",
            background: "transparent", color: "#888", cursor: "pointer", fontSize: "0.7rem",
            fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "0.5px"
          }}>Cancel</button>
          <button type="submit" style={{
            flex: 1, padding: "10px 0", border: "none",
            background: "transparent", color: "#e0e0d8", fontWeight: 400,
            cursor: "pointer", fontSize: "0.7rem",
            fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "0.5px"
          }}>Save</button>
        </div>
      </form>
    </div>
  );
}
