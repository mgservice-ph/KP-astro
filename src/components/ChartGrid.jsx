import * as C from "../data/constants";
import { getStellarData, formatArcMinutes } from "../utils/astrology";

const GRID_COORDS = [[11, 0, 1, 2], [10, -1, -1, 3], [9, -1, -1, 4], [8, 7, 6, 5]];

const cellBase = {
  background: "var(--card)", padding: "6px", display: "flex", flexDirection: "column",
  justifyContent: "space-between", position: "relative",
};

const extCell = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1px",
  minHeight: "18px", fontSize: "0.5rem",
};

const planetTag = {
  display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: "0px",
  padding: "2px 4px", borderRadius: "3px", fontSize: "0.6rem", fontWeight: 700,
  background: "var(--card-sub)", border: "1px solid var(--bdr)",
};

function PlanetTag({ p, layoutType, panchanga, moonNakIndex }) {
  const st = getStellarData(p.absoluteLong);
  const pColor = C.PLANET_COLORS[p.name] || "var(--fg)";
  const displayDeg = layoutType === "rasi" ? p.signDeg : (p.absoluteLong % 3.333333) * 9;
  const degHtml = layoutType === "rasi" ? ` <span class="deg" style="font-weight:400;font-size:0.5rem;color:var(--muted);">${Math.floor(displayDeg)}°</span>` : "";
  const isMoon = p.name === "Moon";

  let marker = "";
  if (panchanga) {
    const yls = panchanga.yogiLordShort;
    const als = panchanga.avayogiLordShort;
    if (yls && C.STAR_TO_PLANET[yls] === p.name) marker = " <span style='color:#1B5E20;font-weight:700;font-size:0.5rem;'>(Y)</span>";
    else if (als && C.STAR_TO_PLANET[als] === p.name) marker = " <span style='color:#C62828;font-weight:700;font-size:0.5rem;'>(AY)</span>";
    if (layoutType === "rasi" && panchanga.vainasikaNakIndex >= 0 && st.index === panchanga.vainasikaNakIndex) {
      marker += "<span style='color:#C62828;font-weight:700;font-size:0.5rem;'>(VS)</span>";
    }
    if (layoutType === "rasi" && panchanga.soonyaGrahas && panchanga.soonyaGrahas.includes(p.name)) {
      marker += "<span style='color:#C62828;font-weight:700;font-size:0.5rem;'>(TS)</span>";
    }
  }
  if (layoutType === "rasi" && p.isGrahana) marker += "<span style='background:#8B0000;color:#fff;font-weight:700;font-size:0.5rem;padding:1px 3px;border-radius:2px;'>G</span>";
  if (layoutType === "rasi" && p.isTrikona) marker += "<span style='background:#000;color:#fff;font-weight:700;font-size:0.5rem;padding:1px 3px;border-radius:2px;'>GT</span>";

  return (
    <span style={{ ...planetTag, ...(isMoon ? { background: "#F7EEB5", borderColor: "#D9CC7A" } : {}) }}>
      <span style={{ display: "flex", alignItems: "center", gap: "2px", width: "100%" }}>
        <span style={{ color: isMoon ? "#858585" : pColor, fontWeight: 700 }}>{p.name}</span>
        {marker ? <span dangerouslySetInnerHTML={{ __html: marker }} /> : null}
        {p.isRetro ? <span style={{ color: "#C93B3B", fontSize: "0.65rem", fontWeight: 800 }}>R</span> : null}
        <span dangerouslySetInnerHTML={{ __html: degHtml }} />
      </span>
      <span style={{ fontSize: "0.5rem", lineHeight: 1.2, marginTop: "1px", opacity: 0.9 }}>
        <span style={{ color: isMoon ? "#858585" : "var(--star-clr)", fontWeight: 700 }}>{st.starLord}</span>
        <span style={{ color: isMoon ? "#858585" : "var(--muted)" }}>·P{st.pada}</span>
        {layoutType === "rasi" ? <span style={{ color: isMoon ? "#858585" : "var(--fg)", fontWeight: 600 }}>{st.subLord}</span> : null}
      </span>
    </span>
  );
}

function ExtrusionPlanet({ p, panchanga }) {
  const st = getStellarData(p.absoluteLong);
  const pColor = C.PLANET_COLORS[p.name] || "var(--fg)";
  const hasTS = panchanga && panchanga.soonyaGrahas && panchanga.soonyaGrahas.includes(p.name);
  return (
    <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
      <span style={{ fontWeight: 700, color: pColor }}>{p.name}</span>
      {hasTS ? <span style={{ color: "#C62828", fontWeight: 700, fontSize: "0.5rem" }}>(TS)</span> : null}
      {p.isRetro ? <span style={{ color: "#C93B3B", fontSize: "0.65rem", fontWeight: 800 }}>R</span> : null}
      {` ${C.ZODIAC_NAMES[p.signIndex].s}${Math.floor(p.signDeg)}° `}
      <span style={{ color: "var(--muted)" }}>{st.starLord}</span>
      {p.name === "Asc" ? <span style={{ color: "var(--fg)" }}>·{st.subLord}</span> : null}
    </span>
  );
}

function TransitExtrusionBar({ planets, signIndices, isLeftRight, panchanga }) {
  const cell = (si) => {
    const hasSoonya = si != null && panchanga && panchanga.soonyaSigns && panchanga.soonyaSigns.includes(si);
    return (
      <div style={{ ...extCell, position: "relative" }}>
        {hasSoonya ? <span style={{ position: "absolute", top: 0, right: 2, color: "#C93B3B", fontSize: "0.7rem", fontWeight: 900, lineHeight: 1 }}>✗</span> : null}
        {si != null && planets ? planets.filter(p => p.signIndex === si).map((p, j) => <ExtrusionPlanet key={j} p={p} panchanga={panchanga} />) : null}
      </div>
    );
  };
  if (isLeftRight) {
    return (
      <div style={{ display: "grid", gridTemplateRows: "repeat(4, 1fr)", gap: "1px", width: "48px", flexShrink: 0, alignItems: "center" }}>
        {signIndices.map((si, i) => cell(si))}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", flex: 1, border: "2px solid transparent", borderRadius: "8px" }}>
      {signIndices.map((si, i) => cell(si))}
    </div>
  );
}

function D1Grid({ planets, cusps, ascendantAbsoluteLong, panchanga, birthTime }) {
  const ascSignIdx = cusps && cusps[1] != null ? Math.floor(cusps[1] / 30) : 0;
  let age = -1;
  if (birthTime) {
    const now = new Date();
    const bd = new Date(birthTime);
    age = now.getFullYear() - bd.getFullYear();
    const mDiff = now.getMonth() - bd.getMonth();
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < bd.getDate())) age--;
  }

  const cells = GRID_COORDS.flatMap((row, ri) =>
    row.map((signIdx, ci) => {
      const key = ri * 4 + ci;
      if (signIdx === -1) return <div key={key} style={{ ...cellBase, background: "var(--grid-empty)" }} />;

      const isAsc = ascSignIdx === signIdx;
      const hasSoonya = panchanga && panchanga.soonyaSigns && panchanga.soonyaSigns.includes(signIdx);
      const cellPlanets = (planets || []).filter(p => p.signIndex === signIdx);

      return (
        <div key={key} style={{ ...cellBase, ...(isAsc ? { background: "var(--active-bg)", boxShadow: "inset 3px 0 0 var(--active-border)" } : {}) }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", marginBottom: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                {C.ZODIAC_NAMES[signIdx].s} {C.ZODIAC_NAMES[signIdx].n}
              </span>
              {hasSoonya ? <span style={{ color: "#C93B3B", fontSize: "1rem", fontWeight: 900, lineHeight: 1 }}>✗</span> : null}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
              {isAsc ? (
                <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "var(--accent)", color: "#fff", padding: "2px 5px", borderRadius: "3px" }}>
                  Asc {Math.floor(ascendantAbsoluteLong % 30)}°
                </span>
              ) : null}
              {isAsc ? (
                <span style={{ fontSize: "0.6rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                  · {getStellarData(ascendantAbsoluteLong).starLord} P{getStellarData(ascendantAbsoluteLong).pada} → {getStellarData(ascendantAbsoluteLong).subLord}
                </span>
              ) : null}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", alignContent: "flex-end", marginTop: "auto" }}>
            {cellPlanets.map((p, i) => <PlanetTag key={i} p={p} layoutType="rasi" panchanga={panchanga} />)}
            {isAsc && age >= 0 && (ascSignIdx + age) % 12 === signIdx ? (
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#2E7D32", display: "inline-block", padding: "2px 4px" }}>{age} Age</span>
            ) : null}
          </div>
        </div>
      );
    })
  );

  return <>{cells}</>;
}

function D9Grid({ planets, ascendantAbsoluteLong }) {
  function calcD9Sign(longitude) {
    longitude = ((longitude % 360) + 360) % 360;
    const sign = Math.floor(longitude / 30);
    const degInSign = longitude % 30;
    const nav = Math.floor(degInSign / 3.333333);
    let start;
    if ([0, 3, 6, 9].includes(sign)) start = sign;
    else if ([1, 4, 7, 10].includes(sign)) start = (sign + 8) % 12;
    else start = (sign + 4) % 12;
    return (start + nav) % 12;
  }

  const d9AscSign = calcD9Sign(ascendantAbsoluteLong);

  const cells = GRID_COORDS.flatMap((row, ri) =>
    row.map((signIdx, ci) => {
      const key = `d9-${ri * 4 + ci}`;
      if (signIdx === -1) return <div key={key} style={{ ...cellBase, background: "var(--grid-empty)" }} />;

      const isAsc = d9AscSign === signIdx;
      const cellPlanets = (planets || []).filter(p => calcD9Sign(p.absoluteLong) === signIdx);

      return (
        <div key={key} style={{ ...cellBase, ...(isAsc ? { background: "var(--active-bg)", boxShadow: "inset 3px 0 0 var(--active-border)" } : {}) }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", marginBottom: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                {C.ZODIAC_NAMES[signIdx].s} {C.ZODIAC_NAMES[signIdx].n}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
              {isAsc ? <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "var(--accent)", color: "#fff", padding: "2px 5px", borderRadius: "3px" }}>Asc</span> : null}
              {isAsc ? (
                <span style={{ fontSize: "0.6rem", color: "var(--muted)" }}>
                  {getStellarData(ascendantAbsoluteLong).starLord}
                </span>
              ) : null}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", alignContent: "flex-end", marginTop: "auto" }}>
            {cellPlanets.map((p, i) => <PlanetTag key={i} p={p} layoutType="navamsha" panchanga={null} />)}
          </div>
        </div>
      );
    })
  );

  return <>{cells}</>;
}

export default function ChartGrid({ planets, cusps, ascendantAbsoluteLong, panchanga, birthTime, transitPlanets, transitPanchanga }) {
  if (!planets || !cusps) return null;

  const gridStyle = {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: "1px",
    background: "var(--bdr-strong)", border: "2px solid var(--bdr-strong)", borderRadius: "8px",
    width: "100%", maxWidth: "550px", aspectRatio: "1", margin: "0 auto",
  };
  const d9GridStyle = {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: "1px",
    background: "var(--bdr-strong)", border: "2px solid var(--bdr-strong)", borderRadius: "8px",
    width: "100%", maxWidth: "550px", aspectRatio: "1", margin: "0 auto",
  };

  const rasiGrid = (
    <div style={gridStyle}>
      <D1Grid planets={planets} cusps={cusps} ascendantAbsoluteLong={ascendantAbsoluteLong} panchanga={panchanga} birthTime={birthTime} />
    </div>
  );

  const d9Grid = (
    <div style={d9GridStyle}>
      <D9Grid planets={planets} ascendantAbsoluteLong={ascendantAbsoluteLong} />
    </div>
  );

  const tp = transitPanchanga || panchanga;
  const extTop = transitPlanets ? <TransitExtrusionBar planets={transitPlanets} signIndices={[11, 0, 1, 2]} panchanga={tp} /> : <TransitExtrusionBar planets={[]} signIndices={[11, 0, 1, 2]} panchanga={tp} />;
  const extBtm = transitPlanets ? <TransitExtrusionBar planets={transitPlanets} signIndices={[8, 7, 6, 5]} panchanga={tp} /> : <TransitExtrusionBar planets={[]} signIndices={[8, 7, 6, 5]} panchanga={tp} />;
  const extLeft = transitPlanets ? <TransitExtrusionBar planets={transitPlanets} signIndices={[null, 10, 9, null]} isLeftRight panchanga={tp} /> : <TransitExtrusionBar planets={[]} signIndices={[null, 10, 9, null]} isLeftRight panchanga={tp} />;
  const extRight = transitPlanets ? <TransitExtrusionBar planets={transitPlanets} signIndices={[null, 3, 4, null]} isLeftRight panchanga={tp} /> : <TransitExtrusionBar planets={[]} signIndices={[null, 3, 4, null]} isLeftRight panchanga={tp} />;

  return (
    <div className="chart-grid-row">
      <div className="studio-card" style={{ display: "flex", flexDirection: "column" }}>
        <h3 style={{ textAlign: "center", justifyContent: "center" }}>RasiChart D1</h3>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", width: "100%", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: "2px", width: "100%", maxWidth: "550px" }}>
            <div style={{ width: "48px", flexShrink: 0 }} />
            {extTop}
            <div style={{ width: "48px", flexShrink: 0 }} />
          </div>
          <div style={{ display: "flex", gap: "2px", width: "100%", maxWidth: "550px" }}>
            {extLeft}
            <div style={{ flex: 1, minWidth: 0 }}>{rasiGrid}</div>
            {extRight}
          </div>
          <div style={{ display: "flex", gap: "2px", width: "100%", maxWidth: "550px" }}>
            <div style={{ width: "48px", flexShrink: 0 }} />
            {extBtm}
            <div style={{ width: "48px", flexShrink: 0 }} />
          </div>
        </div>
      </div>
      <div className="studio-card" style={{ display: "flex", flexDirection: "column" }}>
        <h3 style={{ textAlign: "center", justifyContent: "center" }}>Navamsa D9</h3>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>{d9Grid}</div>
      </div>
    </div>
  );
}
