import React, { useState } from "react";
import * as C from "../data/constants";

const colorMap = { STRONG: "#2E7D32", MEDIUM: "#E65100", WEAK: "#C62828" };
const statusTextMap = { STRONG: "Strong", MEDIUM: "Medium", WEAK: "Weak" };

export default function CheckSection({ title, data, meterId, tableId, entityIds, shortLabels }) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (idx) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const results = data || [];
  const strongCount = results.filter(r => r.evaluation.status === "STRONG").length;
  const medCount = results.filter(r => r.evaluation.status === "MEDIUM").length;
  const weakCount = results.filter(r => r.evaluation.status === "WEAK").length;
  const total = results.length || 1;
  const pct = (strongCount * 100 + medCount * 50) / total;
  const barColor = pct >= 66 ? "#2E7D32" : pct >= 33 ? "#E65100" : "#C62828";

  return (
    <div>
      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid var(--bdr)", fontWeight: 700 }}>{title}</h3>
      {results.length > 0 && (
          <div id={meterId + "MeterWrap"} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, color: "var(--muted)" }}>Combined Strength</span>
              <span id={meterId + "MeterScore"} style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "'Playfair Display',serif", color: barColor }}>{strongCount}S / {medCount}M / {weakCount}W</span>
            </div>
            <div style={{ width: "100%", height: 8, background: "var(--bdr)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", borderRadius: 4, transition: "width 0.6s ease,background 0.6s ease", width: pct + "%", background: barColor }}></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", color: "var(--muted)", marginTop: 2 }}>
              <span>Weak</span><span>Medium</span><span>Strong</span>
            </div>
            <div id={meterId + "MeterBreakdown"} style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              {results.map((r, i) => {
                const c = colorMap[r.evaluation.status];
                const label = (shortLabels && shortLabels[i]) || i;
                return <span key={i} style={{ fontSize: "0.6rem", padding: "1px 5px", borderRadius: 2, background: c, color: "#fff", fontWeight: 600 }}>{label}: {statusTextMap[r.evaluation.status]}</span>;
              })}
            </div>
          </div>
      )}

      {entityIds && results.length > 0 && (
        <div className="rp-grid" style={{ marginBottom: 8 }}>
          {results.map((r, i) => {
            const e = r.entity;
            const ev = r.evaluation;
            const c = colorMap[ev.status];
            return (
              <div key={i} className="rp-item">
                <span className="rp-title" style={{ color: ["#FF6B00","#2563EB","#D97706","#7C3AED","#059669","#DC2626","#0891B2","#9933FF","#CC6600"][i] || "var(--muted)" }}>{entityIds[i]?.replace(/(str|brain|mute|purva|marriage|health|family|job)([A-Z])/, "$2") || e.label}</span>
                <span className="rp-value" style={{ color: c }}>{e.planetName}</span>
                <span style={{ display: "block", fontSize: "0.6rem", color: "var(--muted)", marginTop: 2 }}>{statusTextMap[ev.status]} (H{e.bhavaIdx})</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Entity</th><th>Graha</th><th>Rasi</th><th>Bhava</th><th>Nakshatra / Pada</th><th>Status</th><th style={{ width: 28 }}></th>
            </tr>
          </thead>
          <tbody id={tableId}>
            {results.map((res, idx) => {
              const e = res.entity;
              const ev = res.evaluation;
              const statusColor = colorMap[ev.status];
              const statusLabel = statusTextMap[ev.status];
              const signName = C.ZODIAC_NAMES[e.signIdx]?.s + " " + C.ZODIAC_NAMES[e.signIdx]?.n || "--";
              const pColor = C.PLANET_COLORS[e.planetName] || "var(--fg)";
              return (
                <React.Fragment key={idx}>
                  <tr style={{ cursor: "pointer" }}>
                    <td><b>{e.label}</b></td>
                    <td>
                      <span style={{ color: pColor, fontWeight: 700 }}>{e.planetName}</span>
                      {e.isRetro ? <span className="retro-mark">R</span> : ""}
                      {e.isGrahana ? <span style={{ background: "#8B0000", color: "#fff", fontWeight: 700, fontSize: "0.55rem", padding: "1px 3px", borderRadius: 2, marginLeft: 2 }}>G</span> : ""}
                      {e.isTrikona ? <span style={{ background: "#000", color: "#fff", fontWeight: 700, fontSize: "0.55rem", padding: "1px 3px", borderRadius: 2, marginLeft: 2 }}>GT</span> : ""}
                    </td>
                    <td>{signName}</td>
                    <td>{C.ROMAN[e.bhavaIdx - 1] || "--"}</td>
                    <td>{e.nakName} P{e.pada}</td>
                    <td><span style={{ background: statusColor, color: "#fff", padding: "2px 8px", borderRadius: 3, fontWeight: 700, fontSize: "0.7rem" }}>{statusLabel}</span></td>
                    <td><button className="toggle-btn" onClick={() => toggleRow(idx)} style={{ fontSize: "0.9rem", minHeight: "auto", padding: "2px 6px" }}>{expandedRows[idx] ? "▼" : "▶"}</button></td>
                  </tr>
                  {expandedRows[idx] && (
                    <tr key={"detail-" + idx}>
                      <td colSpan={7} style={{ padding: 0, border: "none" }}>
                        <div style={{ padding: "8px 12px", background: "var(--table-hov)", fontSize: "0.72rem" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                            <span><b>House:</b> {C.ROMAN[e.bhavaIdx - 1]}</span>
                            <span><b>Star Lord:</b> {e.starLord}</span>
                            <span><b>Sub Lord:</b> {e.subLord}</span>
                            <span><b>D9 Sign:</b> #{e.nakIdx != null ? (e.nakIdx % 12 + 1) : "--"}</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                            {e.dignity?.isUcham && <span style={{ background: "#2E7D32", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Ucham: {e.dignity.ucham}</span>}
                            {e.dignity?.isAatchi && <span style={{ background: "#1565C0", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Aatchi: {e.dignity.aatchi}</span>}
                            {e.dignity?.isNatpu && <span style={{ background: "#1B5E20", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Natpu: {e.dignity.natpu}</span>}
                            {e.dignity?.isNeecham && <span style={{ background: "#C62828", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Neecham: {e.dignity.neecham}</span>}
                            {e.dignity?.isPagai && <span style={{ background: "#E65100", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Pagai: {e.dignity.pagai}</span>}
                            {e.dignity?.isSamam && <span style={{ background: "var(--muted)", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Samam: {e.dignity.samam}</span>}
                            {e.isCombust && <span style={{ background: "#B8860B", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Combust</span>}
                            {e.isGrahana && <span style={{ background: "#8B0000", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Grahana</span>}
                            {e.isTrikona && <span style={{ background: "#000", color: "#fff", padding: "2px 6px", borderRadius: 3 }}>Trikona Grahana</span>}
                          </div>
                          {ev.strongReasons?.length > 0 && (
                            <div style={{ borderTop: "1px solid var(--bdr)", paddingTop: 6, marginTop: 6 }}>
                              <span style={{ color: "#2E7D32", fontWeight: 700, fontSize: "0.7rem" }}>✓ STRONG INDICATORS</span>
                              {ev.strongReasons.map((r, i) => <div key={i} style={{ color: "#2E7D32", paddingLeft: 12 }}>✓ {r}</div>)}
                            </div>
                          )}
                          {ev.weakReasons?.length > 0 && (
                            <div style={{ borderTop: "1px solid var(--bdr)", paddingTop: 6, marginTop: 6 }}>
                              <span style={{ color: "#C62828", fontWeight: 700, fontSize: "0.7rem" }}>✗ WEAK INDICATORS</span>
                              {ev.weakReasons.map((r, i) => <div key={i} style={{ color: "#C62828", paddingLeft: 12 }}>✗ {r}</div>)}
                            </div>
                          )}
                          <div style={{ borderTop: "1px solid var(--bdr)", paddingTop: 6, marginTop: 6, fontWeight: 700 }}>
                            <span style={{ color: statusColor }}>Final: {statusLabel} (score {ev.score})</span>
                            {ev.guruAspect && <span style={{ color: "#1565C0" }}> | Guru aspect remedy applied</span>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
