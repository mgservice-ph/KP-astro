import * as C from "../data/constants";
import { getStellarData } from "../utils/astrology";

const styles = `
.resp-cusp-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.resp-cusp-table th { padding: 6px 8px; border-bottom: 2px solid var(--bdr); color: var(--muted); text-align: left; font-weight: 600; font-size: 0.72rem; text-transform: uppercase; white-space: nowrap; }
.resp-cusp-table td { padding: 6px 8px; border-bottom: 1px solid var(--bdr); color: var(--fg); font-size: 0.82rem; }
@media (max-width: 640px) {
  .resp-cusp-table { min-width: unset; }
  .resp-cusp-table thead { display: none; }
  .resp-cusp-table tr { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 8px; margin-bottom: 8px; background: var(--card-sub); border-radius: 6px; border-left: 3px solid var(--accent); }
  .resp-cusp-table td { display: flex; flex-direction: column; border: none; padding: 2px 4px; font-size: 0.78rem; }
  .resp-cusp-table td::before { content: attr(data-label); font-size: 0.65rem; color: var(--muted); font-weight: 600; text-transform: uppercase; }
}
`;
const wrap = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px",
  padding: "16px", margin: "16px 0", overflowX: "auto"
};
const headerStyle = { margin: "0 0 12px 0", fontSize: "1.1rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)" };
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
      <style>{styles}</style>
      <h3 style={headerStyle}>Cuspal Bhava Linkage</h3>
      <table className="resp-cusp-table">
        <thead>
          <tr>
            <th>House</th>
            <th>Sign</th>
            <th>Deg</th>
            <th>Star Lord</th>
            <th>Sub Lord</th>
            <th>Planets</th>
          </tr>
        </thead>
        <tbody>
          {cuspList.map((c, i) => (
            <tr key={i}>
              <td data-label="House" style={{ fontWeight: 600 }}>{c.house}</td>
              <td data-label="Sign">{C.ZODIAC_NAMES[c.signIdx].s} ({C.LORDS_ORDER[C.RASI_DOMINIONS[c.signIdx]]})</td>
              <td data-label="Deg">{c.signDeg.toFixed(2)}°</td>
              <td data-label="Star Lord">{c.st.starLord} P{c.st.pada}</td>
              <td data-label="Sub Lord">{c.st.subLord}</td>
              <td data-label="Planets">{c.housePlanets.length > 0 ? c.housePlanets.map(p => p.name).join(", ") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
