import { useState, useMemo, useEffect } from "react";
import * as C from "../data/constants";

const DASHA_COLORS = {
  Ket: "#9C27B0", Ven: "#E91E63", Sun: "#FF5722", Moo: "#607D8B",
  Mar: "#F44336", Rah: "#3F51B5", Jup: "#FF9800", Sat: "#4CAF50", Mer: "#00BCD4"
};
const treeWrap = {
  background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "8px",
  padding: "16px", margin: "16px 0"
};
const headerStyle = { margin: "0 0 12px 0", fontSize: "1.1rem", fontFamily: "'Playfair Display',serif", color: "var(--accent)" };
const mRowStyle = {
  border: "1px solid var(--bdr)", borderRadius: "6px", background: "var(--card)",
  overflow: "hidden", marginBottom: "8px"
};
const mTriggerStyle = {
  padding: "10px 12px", minHeight: "44px", display: "flex",
  flexDirection: "column", alignItems: "flex-start", gap: "4px",
  cursor: "pointer", fontWeight: 600, background: "var(--card)",
  userSelect: "none", fontSize: "0.9rem"
};
const arrowStyle = {
  display: "inline-block", transition: "transform 0.25s ease",
  fontSize: "0.75rem"
};
const arrowOpen = { transform: "rotate(90deg)" };
const badgeStyle = {
  fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px",
  background: "var(--bdr)", color: "var(--fg)", display: "inline-block"
};
const childContainer = {
  display: "none", borderTop: "1px solid var(--bdr)",
  background: "var(--table-hov)", padding: "6px"
};
const bListStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const bRowStyle = {
  border: "1px solid var(--bdr)", borderRadius: "4px",
  background: "var(--card)", overflow: "hidden"
};
const bTriggerStyle = {
  padding: "8px 10px", display: "flex", flexDirection: "column",
  alignItems: "flex-start", gap: "4px", cursor: "pointer",
  fontSize: "0.8rem", fontWeight: 500
};
const pContainerStyle = {
  display: "none", padding: "6px", background: "var(--card-sub)",
  borderTop: "1px solid var(--bdr)"
};
const pGridStyle = { display: "flex", flexDirection: "column", gap: "4px" };
const pItemStyle = {
  padding: "6px 10px", background: "var(--card)",
  border: "1px solid var(--bdr)", borderRadius: "3px",
  fontSize: "0.75rem", display: "flex",
  justifyContent: "space-between", alignItems: "center", gap: "8px"
};

const DASHA_SEQUENCE = ["Ket", "Ven", "Sun", "Moo", "Mar", "Rah", "Jup", "Sat", "Mer"];

function computeDashas(moonLong, birthTime, now) {
  const st = getStellarDataSimple(moonLong);
  const nakStart = C.NAKSHATRAS[st.index].s;
  const elapsed = ((moonLong - nakStart + 360) % 360);
  const totalSpan = 13.3333;
  const remainingFactor = (totalSpan - elapsed) / totalSpan;
  const lordIndex = DASHA_SEQUENCE.indexOf(C.NAKSHATRAS[st.index].l);
  const baseMs = new Date(birthTime).getTime();
  const currentMs = now.getTime();
  const dashes = [];

  let mTimelineMs = baseMs;
  for (let m = 0; m < 9; m++) {
    const seqIdx = (lordIndex + m) % 9;
    const lordCode = DASHA_SEQUENCE[seqIdx];
    const totalYears = C.DASHA_YEARS_MAP[lordCode] || 0;
    let mDurationMs = totalYears * 365.25 * 86400000;
    if (m === 0) mDurationMs *= remainingFactor;
    const mEndMs = mTimelineMs + mDurationMs;
    const isMActive = currentMs >= mTimelineMs && currentMs < mEndMs;

    const bhuktis = [];
    let bTimelineMs = mTimelineMs;
    for (let b = 0; b < 9; b++) {
      const bSeqIdx = (seqIdx + b) % 9;
      const bLordCode = DASHA_SEQUENCE[bSeqIdx];
      const bYears = C.DASHA_YEARS_MAP[bLordCode] || 0;
      const bFraction = bYears / 120;
      const bDurationMs = mDurationMs * bFraction;
      const bEndMs = bTimelineMs + bDurationMs;
      const isBActive = isMActive && currentMs >= bTimelineMs && currentMs < bEndMs;

      const pratyantars = [];
      let pTimelineMs = bTimelineMs;
      for (let p = 0; p < 9; p++) {
        const pSeqIdx = (bSeqIdx + p) % 9;
        const pLordCode = DASHA_SEQUENCE[pSeqIdx];
        const pYears = C.DASHA_YEARS_MAP[pLordCode] || 0;
        const pFraction = pYears / 120;
        const pDurationMs = bDurationMs * pFraction;
        const pEndMs = pTimelineMs + pDurationMs;
        if (pDurationMs <= 0) { pTimelineMs = pEndMs; continue; }
        const isPActive = isBActive && currentMs >= pTimelineMs && currentMs < pEndMs;
        pratyantars.push({
          lord: pLordCode,
          start: new Date(pTimelineMs), end: new Date(pEndMs),
          isActive: isPActive
        });
        pTimelineMs = pEndMs;
      }
      bhuktis.push({
        lord: bLordCode,
        start: new Date(bTimelineMs), end: new Date(bEndMs),
        isActive: isBActive, children: pratyantars
      });
      bTimelineMs = bEndMs;
    }
    dashes.push({
      lord: lordCode,
      start: new Date(mTimelineMs), end: new Date(mEndMs),
      isActive: isMActive, children: bhuktis
    });
    mTimelineMs = mEndMs;
  }
  return dashes;
}

function getStellarDataSimple(longitude) {
  longitude = ((longitude % 360) + 360) % 360;
  let matchingNak = C.NAKSHATRAS[0];
  let nakIndex = 0;
  for (let i = C.NAKSHATRAS.length - 1; i >= 0; i--) {
    if (longitude >= C.NAKSHATRAS[i].s) {
      matchingNak = C.NAKSHATRAS[i];
      nakIndex = i;
      break;
    }
  }
  return { index: nakIndex, nak: matchingNak };
}

function formatDate(d) {
  if (!d) return "";
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function PratyantarItem({ antra }) {
  const aStyle = { ...pItemStyle };
  if (antra.isActive) {
    aStyle.background = "var(--active-bg)";
    aStyle.borderColor = "var(--active-border)";
    aStyle.fontWeight = 700;
  }
  return (
    <div style={aStyle}>
      <span>{C.LORD_TAMIL[antra.lord] || antra.lord}</span>
      <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
        {formatDate(antra.start)}–{formatDate(antra.end)}
      </span>
    </div>
  );
}

function BhuktiNode({ bhukti }) {
  const [open, setOpen] = useState(false);
  const bRowActive = { ...bRowStyle };
  if (bhukti.isActive) {
    bRowActive.borderColor = "var(--active-border)";
    bRowActive.background = "var(--active-bg)";
  }
  const bTrig = { ...bTriggerStyle };
  if (bhukti.isActive) {
    bTrig.flexDirection = "row";
    bTrig.justifyContent = "space-between";
    bTrig.alignItems = "center";
  }
  const pCont = { ...pContainerStyle };
  if (open || bhukti.isActive) pCont.display = "block";
  const badge = { ...badgeStyle, fontSize: "0.72rem" };
  if (bhukti.isActive) { badge.background = "var(--accent)"; badge.color = "white"; }

  return (
    <div style={bRowActive}>
      <div style={bTrig} onClick={() => setOpen(!open)}>
        <span><span style={{ ...arrowStyle, ...(open ? arrowOpen : {}) }}>▶</span> {C.LORD_TAMIL[bhukti.lord] || bhukti.lord} Bhukti</span>
        <span style={badge}>{formatDate(bhukti.start)} to {formatDate(bhukti.end)}{bhukti.isActive ? " • Active Now" : ""}</span>
      </div>
      <div style={pCont}>
        <div style={pGridStyle}>
          {(bhukti.children || []).map((antra, ai) => (
            <PratyantarItem key={ai} antra={antra} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MahaNode({ dasha }) {
  const [open, setOpen] = useState(false);
  const dColor = DASHA_COLORS[dasha.lord] || "var(--accent)";
  const mRowActive = { ...mRowStyle, borderLeft: `4px solid ${dColor}` };
  if (dasha.isActive) {
    mRowActive.borderColor = dColor;
    mRowActive.background = "var(--active-bg)";
  }
  const mTrig = { ...mTriggerStyle };
  if (dasha.isActive) {
    mTrig.background = "var(--active-bg)";
    mTrig.flexDirection = "row";
    mTrig.justifyContent = "space-between";
    mTrig.alignItems = "center";
  }
  const childCont = { ...childContainer };
  if (open || dasha.isActive) childCont.display = "block";
  const badge = { ...badgeStyle };
  if (dasha.isActive) { badge.background = "var(--accent)"; badge.color = "white"; }

  return (
    <div style={mRowActive}>
      <div style={mTrig} onClick={() => setOpen(!open)}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: dColor, marginRight: 6, verticalAlign: "middle" }}></span><span style={{ ...arrowStyle, ...(open ? arrowOpen : {}) }}>▶</span> {C.LORD_TAMIL[dasha.lord] || dasha.lord} Mahadasha</span>
        <span style={badge}>{formatDate(dasha.start)} — {formatDate(dasha.end)}{dasha.isActive ? " • Active Now" : ""}</span>
      </div>
      <div style={childCont}>
        <div style={bListStyle}>
          {dasha.children.map((bhukti, bi) => (
            <BhuktiNode key={bi} bhukti={bhukti} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashaTree({ moonLong, birthTime, onActiveDashaChange }) {
  const dashas = useMemo(() => {
    if (moonLong == null || !birthTime) return [];
    return computeDashas(moonLong, birthTime, new Date());
  }, [moonLong, birthTime]);

  useEffect(() => {
    if (!dashas.length) return;
    for (const m of dashas) {
      if (m.isActive) {
        for (const b of m.children) {
          if (b.isActive) {
            for (const p of b.children) {
              if (p.isActive) {
                onActiveDashaChange?.({ mahadasha: m.lord, bhukti: b.lord, pratyantar: p.lord });
                return;
              }
            }
            onActiveDashaChange?.({ mahadasha: m.lord, bhukti: b.lord, pratyantar: "" });
            return;
          }
        }
        onActiveDashaChange?.({ mahadasha: m.lord, bhukti: "", pratyantar: "" });
        return;
      }
    }
  }, [dashas, onActiveDashaChange]);

  return (
    <div style={treeWrap}>
      <h3 style={headerStyle}>Vimshottari Dasha</h3>
      {dashas.length === 0 && <div style={{ color: "#666", fontSize: "0.85rem" }}>No dasha data available</div>}
      {dashas.map((d, i) => (
        <MahaNode key={i} dasha={d} />
      ))}
    </div>
  );
}
