import * as C from "../data/constants";
import { getStellarData } from "../utils/astrology";

const wrap = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "6px",
  padding: "10px", margin: "10px 0", overflowX: "auto"
};
const headerStyle = { margin: "0 0 6px 0", fontSize: "0.85rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)" };
const tableStyle = { width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "0.72rem", minWidth: "600px" };
const thStyle = {
  padding: "4px 4px", borderBottom: "1px solid var(--bdr)", color: "var(--muted)",
  textAlign: "left", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase",
  whiteSpace: "nowrap"
};
const tdStyle = { padding: "3px 4px", borderBottom: "1px solid var(--bdr)", color: "var(--fg)", whiteSpace: "nowrap" };

export default function CuspHouse({ cusps, planets }) {
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

  return (
    <div style={wrap}>
      <h3 style={headerStyle}>Cuspal Bhava Linkage</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "8%" }}>House</th>
            <th style={{ ...thStyle, width: "18%" }}>Sign</th>
            <th style={{ ...thStyle, width: "12%" }}>Deg</th>
            <th style={{ ...thStyle, width: "22%" }}>Star Lord</th>
            <th style={{ ...thStyle, width: "18%" }}>Sub Lord</th>
            <th style={{ ...thStyle, width: "22%" }}>Planets</th>
          </tr>
        </thead>
        <tbody>
          {cuspList.map((c, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, fontWeight: 600 }}>{c.house}</td>
              <td style={tdStyle}>{C.ZODIAC_NAMES[c.signIdx].s} ({C.LORDS_ORDER[C.RASI_DOMINIONS[c.signIdx]]})</td>
              <td style={tdStyle}>{c.signDeg.toFixed(2)}°</td>
              <td style={tdStyle}>{c.st.starLord} P{c.st.pada}</td>
              <td style={tdStyle}>{c.st.subLord}</td>
              <td style={tdStyle}>{c.housePlanets.length > 0 ? c.housePlanets.map(p => p.name).join(", ") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
