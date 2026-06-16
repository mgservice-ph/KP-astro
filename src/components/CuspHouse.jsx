import { useState } from "react";
import * as C from "../data/constants";
import { getStellarData } from "../utils/astrology";

const wrap = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px",
  padding: "16px", margin: "16px 0", overflowX: "auto"
};
const headerStyle = { margin: "0 0 12px 0", fontSize: "1.1rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)" };
const gridStyle = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "8px", marginBottom: "16px"
};
const cardStyle = {
  background: "var(--card-sub)", padding: "8px 10px", borderRadius: "4px",
  borderLeft: "3px solid var(--accent)"
};
const cardTitle = { fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" };
const cardBody = { fontSize: "0.85rem", color: "var(--fg)", marginTop: "4px" };
const subText = { fontSize: "0.7rem", color: "var(--muted)", marginTop: "2px" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", minWidth: "600px" };
const thStyle = {
  padding: "6px 8px", borderBottom: "2px solid var(--bdr)", color: "var(--muted)",
  textAlign: "left", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase"
};
const tdStyle = { padding: "6px 8px", borderBottom: "1px solid var(--bdr)", color: "var(--fg)" };
const expandBtn = { background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: "0 4px", fontSize: "0.75rem" };

export default function CuspHouse({ cusps, planets }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (idx) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

  const cuspList = (cusps || []).slice(1, 13).map((cusp, i) => {
    const signIdx = Math.floor(cusp / 30);
    const signDeg = cusp % 30;
    const st = getStellarData(cusp);
    const house = i + 1;

    const housePlanets = (planets || []).filter(p => {
      const pSign = Math.floor(p.absoluteLong / 30);
      return pSign === signIdx;
    });

    return { house, cusp, signIdx, signDeg, st, housePlanets };
  });

  const sigMap = {};
  (planets || []).forEach(p => {
    const st = getStellarData(p.absoluteLong);
    const lord = st.starLord;
    if (!sigMap[lord]) sigMap[lord] = [];
    sigMap[lord].push(p.name);
  });

  return (
    <div style={wrap}>
      <h3 style={headerStyle}>Cuspal Bhava Linkage &amp; Significators</h3>

      <div style={gridStyle}>
        {cuspList.map((c, i) => (
          <div key={i} style={{ ...cardStyle, borderLeftColor: [1, 4, 7, 10].includes(c.house) ? "#ffd700" : "#555" }}>
            <div style={cardTitle}>House {C.ROMAN[c.house - 1]}</div>
            <div style={cardBody}>
              {C.ZODIAC_NAMES[c.signIdx].s} {c.signDeg.toFixed(2)}°
            </div>
            <div style={subText}>
              {c.st.nak.n} Pada {c.st.pada} &mdash; SL: {c.st.starLord}/{c.st.subLord}
            </div>
            {c.housePlanets.length > 0 && (
              <div style={{ ...subText, color: "#aaa" }}>
                Planets: {c.housePlanets.map(p => p.name).join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>

      <h4 style={{ color: "#e5a600", fontSize: "0.95rem", margin: "12px 0" }}>Significators Table</h4>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Significator Lord</th>
            <th style={thStyle}>Planets</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {C.LORDS_ORDER.filter(l => sigMap[l] && sigMap[l].length > 0).map((lord, i) => {
            const isExp = !!expanded[lord];
            const planetsList = sigMap[lord] || [];
            const display = isExp ? planetsList : planetsList.slice(0, 3);
            return (
              <tr key={i}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{C.LORD_TAMIL[lord] || lord}</td>
                <td style={tdStyle}>
                  {display.join(", ")}
                  {!isExp && planetsList.length > 3 && <span style={{ color: "#666" }}> ...</span>}
                </td>
                <td style={tdStyle}>
                  {planetsList.length > 3 && (
                    <button style={expandBtn} onClick={() => toggle(lord)}>
                      {isExp ? "▲" : "▼"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {Object.keys(sigMap).filter(l => sigMap[l].length > 0).length === 0 && (
            <tr><td style={tdStyle} colSpan={3}>No significators data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
