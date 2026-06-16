import * as C from "../data/constants";
import { getStellarData, formatArcMinutes, checkDignityForEntity } from "../utils/astrology";

const tableWrap = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px",
  padding: "16px", margin: "16px 0", overflowX: "auto"
};
const headerStyle = { margin: "0 0 12px 0", fontSize: "1.1rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", minWidth: "900px" };
const thStyle = {
  padding: "8px 6px", borderBottom: "2px solid var(--bdr)", color: "var(--muted)",
  textAlign: "left", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase",
  whiteSpace: "nowrap"
};
const tdStyle = { padding: "6px", borderBottom: "1px solid var(--bdr)", color: "var(--fg)", whiteSpace: "nowrap" };

const DIGNITY_COLORS = {
  aatchi: { color: "#1565C0", bg: "#1565C0" },
  ucham: { color: "#2E7D32", bg: "#2E7D32" },
  neecham: { color: "#C62828", bg: "#C62828" },
  pagai: { color: "#E65100", bg: "#E65100" },
  natpu: { color: "#1B5E20", bg: "#1B5E20" },
  samam: { color: "var(--muted)", bg: "var(--muted)" }
};

function fmtDignityCell(dignity, field, pLord) {
  if (!dignity) return <span style={{ color: "var(--muted)" }}>&mdash;</span>;
  if (field === "ucham" || field === "neecham") {
    const val = dignity[field];
    if (val && val === pLord) {
      return <span style={{ color: DIGNITY_COLORS[field].color, fontWeight: 600 }}>{C.LORD_TAMIL[val]}</span>;
    }
    return <span style={{ color: "var(--muted)" }}>&mdash;</span>;
  }
  const val = dignity[field];
  if (val) {
    const lords = val.split(",").filter(Boolean);
    if (lords.includes(pLord)) {
      return <span style={{ color: DIGNITY_COLORS[field].color, fontWeight: 600 }}>{C.LORD_TAMIL[pLord]}</span>;
    }
  }
  return <span style={{ color: "var(--muted)" }}>&mdash;</span>;
}

export default function PlanetTable({ planets, cusps }) {
  const planetList = planets || [];

  const ascRow = cusps && cusps.length > 1 ? (() => {
    const cusp = cusps[1];
    const signIdx = Math.floor(cusp / 30);
    const signDeg = cusp % 30;
    const st = getStellarData(cusp);
    return {
      label: "Ascendant",
      color: "var(--fg)",
      long: cusp,
      signIdx,
      signDeg,
      ...st,
      dignity: null,
      isRetro: false
    };
  })() : null;

  const planetRows = planetList.map(p => {
    const st = getStellarData(p.absoluteLong);
    const dig = checkDignityForEntity(p.name, p.signIndex);
    return {
      label: p.name,
      long: p.absoluteLong,
      signIdx: p.signIndex,
      signDeg: p.signDeg,
      color: C.PLANET_COLORS[p.name] || "#e0e0e0",
      isRetro: p.isRetro,
      dignity: dig,
      pLord: C.PLANET_TO_LORD_MAP[p.name],
      ...st
    };
  });

  const allRows = ascRow ? [ascRow, ...planetRows] : planetRows;

  return (
    <div style={tableWrap}>
      <h3 style={headerStyle}>Graha Sphutas &mdash; Planetary Positions</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Body</th>
            <th style={thStyle}>Longitude</th>
            <th style={thStyle}>Sign</th>
            <th style={thStyle}>Deg</th>
            <th style={thStyle}>Nakshatra</th>
            <th style={{ ...thStyle, color: "#1565C0" }}>Aatchi</th>
            <th style={{ ...thStyle, color: "#2E7D32" }}>Ucham</th>
            <th style={{ ...thStyle, color: "#C62828" }}>Neecham</th>
            <th style={{ ...thStyle, color: "#E65100" }}>Pagai</th>
            <th style={{ ...thStyle, color: "#1B5E20" }}>Natpu</th>
            <th style={{ ...thStyle, color: "var(--muted)" }}>Samam</th>
            <th style={thStyle}>Star Lord</th>
            <th style={thStyle}>Sub Lord</th>
          </tr>
        </thead>
        <tbody>
          {allRows.map((row, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, fontWeight: 600, color: row.color }}>
                {row.label}{row.isRetro ? " R" : ""}
              </td>
              <td style={tdStyle}>{formatArcMinutes(row.long)}</td>
              <td style={tdStyle}>{C.ZODIAC_NAMES[row.signIdx]?.s}</td>
              <td style={tdStyle}>{row.signDeg.toFixed(2)}°</td>
              <td style={tdStyle}>{row.nak?.n || "--"}{row.pada ? ` (P${row.pada})` : ""}</td>
              <td style={tdStyle}>{fmtDignityCell(row.dignity, "aatchi", row.pLord)}</td>
              <td style={tdStyle}>{fmtDignityCell(row.dignity, "ucham", row.pLord)}</td>
              <td style={tdStyle}>{fmtDignityCell(row.dignity, "neecham", row.pLord)}</td>
              <td style={tdStyle}>{fmtDignityCell(row.dignity, "pagai", row.pLord)}</td>
              <td style={tdStyle}>{fmtDignityCell(row.dignity, "natpu", row.pLord)}</td>
              <td style={tdStyle}>{fmtDignityCell(row.dignity, "samam", row.pLord)}</td>
              <td style={{ ...tdStyle, color: "var(--star-clr)", fontWeight: 500 }}>{row.starLord || "--"}</td>
              <td style={{ ...tdStyle, fontWeight: 700 }}>{row.subLord || "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
