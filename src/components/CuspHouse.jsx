import * as C from "../data/constants";
import { getStellarData } from "../utils/astrology";

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
    <div className="studio-card">
      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.15rem", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--bdr)", fontWeight: 700 }}>Cuspal Bhava Linkage</h3>
      <div className="cusp-flex">
        {cuspList.map((c, i) => (
          <div key={i} className="cusp-card">
            <h4>House {c.house}</h4>
            <p>{C.ZODIAC_NAMES[c.signIdx].s} ({C.LORDS_ORDER[C.RASI_DOMINIONS[c.signIdx]]})</p>
            <p style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{c.signDeg.toFixed(2)}°</p>
            <div>{c.st.starLord} P{c.st.pada} · {c.st.subLord}</div>
            {c.housePlanets.length > 0 && (
              <p style={{ marginTop: 4, fontSize: "0.72rem", color: "var(--fg)" }}>
                {c.housePlanets.map(p => <span key={p.name} style={{ color: C.PLANET_COLORS[p.name] || "var(--fg)", fontWeight: 700 }}>{p.name} </span>)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
