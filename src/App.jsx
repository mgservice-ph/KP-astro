import { useState, useEffect, useCallback } from "react";
import * as C from "./data/constants";
import {
  getStellarData, formatArcMinutes, getBhavaIndex,
  computeVaara, computeThithi, computeYoga, computeKarana, computeThithiSoonya,
  calculateMandi, calculateMandiEx, computePlacidusSystem,
  checkPushkarNavamsam, checkGuruAspect, checkPavagraha68Rule,
  checkPathagamDusthanaRule, checkEdgeIssue, checkMiruthiviPagai,
  checkVarkothaam, checkHouseCategory, buildEntity, buildEntityFromPlanet,
} from "./utils/astrology";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import PanchangaCard from "./components/PanchangaCard";
import RulingPlanets from "./components/RulingPlanets";
import LiveTracker from "./components/LiveTracker";
import ChartGrid from "./components/ChartGrid";
import PlanetTable from "./components/PlanetTable";
import DashaTree from "./components/DashaTree";
import CuspHouse from "./components/CuspHouse";
import CheckSection from "./components/CheckSection";
import Footer from "./components/Footer";
import LoginScreen from "./components/LoginScreen";
import ChangePassword from "./components/ChangePassword";
import "./App.css";

const COLOR_MAP = { STRONG: "#2E7D32", MEDIUM: "#E65100", WEAK: "#C62828" };
const STATUS_TEXT = { STRONG: "Strong", MEDIUM: "Medium", WEAK: "Weak" };

export default function App() {
  const [theme, setTheme] = useState("light");
  const [viewFilter, setViewFilter] = useState("all");
  const [checkFilter, setCheckFilter] = useState("strength");
  const [config, setConfig] = useState({
    name: "Radha Iyer", dob: "", tob: "", location: "Mumbai, India",
    latitude: 19.076, longitude: 72.8777, ayanamsa: "kp", mandiMode: "kp",
  });
  const [computedData, setComputedData] = useState(null);
  const [panchanga, setPanchanga] = useState(null);
  const [rpData, setRpData] = useState(null);
  const [transitPanchanga, setTransitPanchanga] = useState(null);
  const [activeDasha, setActiveDasha] = useState({ mahadasha: "", bhukti: "", pratyantar: "" });
  const [transitPlanets, setTransitPlanets] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("adminLoggedIn"));
  const [showChangePwd, setShowChangePwd] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("light");
    const now = new Date();
    setConfig(c => ({
      ...c, dob: now.toISOString().slice(0, 10), tob: now.toTimeString().slice(0, 5),
    }));
  }, []);

  const handleCompute = useCallback(() => {
    if (typeof Astronomy === "undefined") { setComputedData(null); setPanchanga(null); return; }
    const { dob, tob, latitude: lat, longitude: lng, ayanamsa: ayanamsaMode } = config;
    if (!dob || !tob) return;
    try {
    const targetDate = new Date(`${dob}T${tob}`);
    const astroTime = Astronomy.MakeTime(targetDate);
    const jd = astroTime.ut + 2451545.0;
    const ayan = C.BASELINE_AYANAMSAS[ayanamsaMode] + (50.238 / 3600) * ((2000 + (jd - 2451545.0) / 365.25) - 2000);
    const oblRad = (23.439291 - 0.0130042 * ((jd - 2451545.0) / 36525)) * Math.PI / 180;
    const sidH = Astronomy.SiderealTime(targetDate);
    const lsDeg = ((sidH * 15 + lng) % 360 + 360) % 360;
    const lRad = lat * Math.PI / 180;
    const lmRad = lsDeg * Math.PI / 180;
    let ascV = Math.atan2(-Math.cos(lmRad), Math.sin(oblRad) * Math.tan(lRad) + Math.cos(oblRad) * Math.sin(lmRad)) * 180 / Math.PI;
    ascV = (ascV + 180 + 360) % 360;
    let mcV = Math.atan2(Math.sin(lmRad), Math.cos(oblRad) * Math.cos(lmRad)) * 180 / Math.PI;
    if (Math.cos(lmRad) < 0) mcV += 180;
    mcV = (mcV + 360) % 360;
    const ascLong = ((ascV - ayan) % 360 + 360) % 360;
    const mcSid = ((mcV - ayan) % 360 + 360) % 360;
    const cusps = computePlacidusSystem(ascLong, mcSid, lat);
    const planets = [];

    C.PLANET_DEFS.slice(0, 7).forEach(pd => {
      try {
        const v = Astronomy.GeoVector(C.ENGINE_BODIES[pd.id], targetDate, true);
        const ec = Astronomy.Ecliptic(v);
        const sa = ((ec.elon - ayan) % 360 + 360) % 360;
        let ir = 0;
        const va = Astronomy.GeoVector(C.ENGINE_BODIES[pd.id], new Date(targetDate.getTime() + 3600000), true);
        if (((Astronomy.Ecliptic(va).elon - ec.elon + 540) % 360 - 180) < 0) ir = 1;
        planets.push({ id: pd.id, name: pd.n, absoluteLong: sa, signIndex: Math.floor(sa / 30), signDeg: sa % 30, isRetro: ir });
      } catch (e) {}
    });

    let rLon = 125.044555 - 0.0529538 * (jd - 2451545.0);
    rLon = ((rLon % 360 + 360) % 360);
    const rSid = ((rLon - ayan) % 360 + 360) % 360;
    const kSid = (rSid + 180) % 360;
    planets.push({ id: "rahu", name: "Rahu", absoluteLong: rSid, signIndex: Math.floor(rSid / 30), signDeg: rSid % 30, isRetro: 1 });
    planets.push({ id: "ketu", name: "Ketu", absoluteLong: kSid, signIndex: Math.floor(kSid / 30), signDeg: kSid % 30, isRetro: 1 });
    try {
      const mLon = config.mandiMode === "jhora"
        ? calculateMandiEx(targetDate, lat, lng, ayan, "eighth", "start")
        : calculateMandi(targetDate, lat, lng, ayan);
      planets.push({ id: "mandi", name: "Mandi", absoluteLong: mLon, signIndex: Math.floor(mLon / 30), signDeg: mLon % 30, isRetro: 0 });
    } catch (e) {}

    const rL = planets.find(p => p.name === "Rahu")?.absoluteLong;
    const kL = planets.find(p => p.name === "Ketu")?.absoluteLong;
    planets.forEach(p => {
      p.isGrahana = false; p.isTrikona = false;
      if (p.name !== "Rahu" && p.name !== "Ketu" && rL != null && kL != null) {
        const tR = ((rL - p.absoluteLong) % 360 + 360) % 360;
        const tK = ((kL - p.absoluteLong) % 360 + 360) % 360;
        p.isGrahana = (tR > 0 && tR <= 3) || (tK > 0 && tK <= 3);
        const rS = Math.floor(rL / 30), rD = rL % 30, kS = Math.floor(kL / 30), kD = kL % 30;
        const rT = [rS, (rS + 4) % 12, (rS + 8) % 12], kT = [kS, (kS + 4) % 12, (kS + 8) % 12];
        if (rT.includes(p.signIndex)) p.isTrikona = (rD - p.signDeg) >= 0 && (rD - p.signDeg) <= 3;
        else if (kT.includes(p.signIndex)) p.isTrikona = (kD - p.signDeg) >= 0 && (kD - p.signDeg) <= 3;
      }
    });

    const sun = planets.find(p => p.id === "sun");
    const moon = planets.find(p => p.id === "moon");
    let pData = null;
    if (sun && moon) {
      const va = computeVaara(jd);
      const th = computeThithi(sun.absoluteLong, moon.absoluteLong);
      const yo = computeYoga(sun.absoluteLong, moon.absoluteLong);
      const ka = computeKarana(sun.absoluteLong, moon.absoluteLong);
      const nak = getStellarData(moon.absoluteLong);
      const so = computeThithiSoonya(th.index);
      const yP = (sun.absoluteLong + moon.absoluteLong + 93.3333) % 360;
      const aP = (yP + 186.6667) % 360;
      const yN = getStellarData(yP), aN = getStellarData(aP);
      pData = {
        vaara: va, thithi: th.name, nakshatra: `${nak.nak.n} (${nak.starLordTamil})`,
        yoga: yo.name, karana: ka.name,
        dayLord: C.VAARA_LORDS[Math.floor(jd + 1.5) % 7],
        yogiAvayogi: { yogi: `${yN.starLordTamil} (${yN.nak.n})`, avayogi: `${aN.starLordTamil} (${aN.nak.n})`, yogiStar: yN.starLord, avayogiStar: aN.starLord },
        soonyaSigns: so.signs, soonyaGrahas: so.grahas,
        vainasikaNakIndex: (nak.index + 21) % 27,
        yogiLordShort: yN.starLord, avayogiLordShort: aN.starLord,
      };
    }

    const data = { planets, cusps, ascendantAbsoluteLong: ascLong, ayanamsaOffset: ayan, birthTime: targetDate };

    const strData = computeCheckData(planets, cusps, ascLong);
    const brainData = computeBrainCheck(planets, cusps, ascLong);
    const muteData = computeMuteCheck(planets, cusps, ascLong);
    const purvaData = computePurvaCheck(planets, cusps, ascLong);
    const marriageData = computeMarriageCheck(planets, cusps, ascLong);
    const healthData = computeHealthCheck(planets, cusps, ascLong);
    const familyData = computeFamilyCheck(planets, cusps, ascLong);
    const jobData = computeJobCheck(planets, cusps, ascLong);
    const foreignOpp = computeForeignOpportunity(planets, cusps, ascLong);
    const businessOffice = computeBusinessOfficeCheck(planets, cusps, ascLong);
    const sportData = computeSportCheck(planets, cusps, ascLong);
    const studyData = computeStudyCheck(planets, cusps, ascLong);
    const religionData = computeReligionCheck(planets, cusps, ascLong);
    const dnaData = computeDNACheck(planets, cusps, ascLong);
    const ashtakavarga = computeAshtakavarga(planets, cusps, ascLong);

    setComputedData({ ...data, strData, brainData, muteData, purvaData, marriageData, healthData, familyData, jobData, foreignOpp, businessOffice, sportData, studyData, religionData, dnaData, ashtakavarga });
    setPanchanga(pData);
    } catch (e) { setComputedData(null); setPanchanga(null); }
  }, [config]);

  const computeTransitPlanets = useCallback((istDate, lat, lng, ayanMode, mandiMode) => {
    if (typeof Astronomy === "undefined") return [];
    const at = Astronomy.MakeTime(istDate);
    const jd = at.ut + 2451545.0;
    const ayan = C.BASELINE_AYANAMSAS[ayanMode] + (50.238 / 3600) * ((2000 + (jd - 2451545.0) / 365.25) - 2000);
    const oR = (23.439291 - 0.0130042 * ((jd - 2451545.0) / 36525)) * Math.PI / 180;
    const sH = Astronomy.SiderealTime(istDate);
    const lD = ((sH * 15 + lng) % 360 + 360) % 360;
    const lR = lat * Math.PI / 180, lM = lD * Math.PI / 180;
    let aV = Math.atan2(-Math.cos(lM), Math.sin(oR) * Math.tan(lR) + Math.cos(oR) * Math.sin(lM)) * 180 / Math.PI;
    aV = (aV + 180 + 360) % 360;
    const ascLong = ((aV - ayan) % 360 + 360) % 360;

    const tPlanets = [];
    C.PLANET_DEFS.slice(0, 7).forEach(pd => {
      try {
        const v = Astronomy.GeoVector(C.ENGINE_BODIES[pd.id], istDate, true);
        const ec = Astronomy.Ecliptic(v);
        const sa = ((ec.elon - ayan) % 360 + 360) % 360;
        let ir = 0;
        const va = Astronomy.GeoVector(C.ENGINE_BODIES[pd.id], new Date(istDate.getTime() + 3600000), true);
        if (((Astronomy.Ecliptic(va).elon - ec.elon + 540) % 360 - 180) < 0) ir = 1;
        tPlanets.push({ id: pd.id, name: pd.n, absoluteLong: sa, signIndex: Math.floor(sa / 30), signDeg: sa % 30, isRetro: ir });
      } catch (e) {}
    });
    let rLon = 125.044555 - 0.0529538 * (jd - 2451545.0);
    rLon = ((rLon % 360 + 360) % 360);
    const rSid = ((rLon - ayan) % 360 + 360) % 360;
    const kSid = (rSid + 180) % 360;
    tPlanets.push({ id: "rahu", name: "Rahu", absoluteLong: rSid, signIndex: Math.floor(rSid / 30), signDeg: rSid % 30, isRetro: 1 });
    tPlanets.push({ id: "ketu", name: "Ketu", absoluteLong: kSid, signIndex: Math.floor(kSid / 30), signDeg: kSid % 30, isRetro: 1 });
    try {
      const mLon = mandiMode === "jhora"
        ? calculateMandiEx(istDate, lat, lng, ayan, "eighth", "start")
        : calculateMandi(istDate, lat, lng, ayan);
      tPlanets.push({ id: "mandi", name: "Mandi", absoluteLong: mLon, signIndex: Math.floor(mLon / 30), signDeg: mLon % 30, isRetro: 0 });
    } catch (e) {}
    tPlanets.push({ id: "asc", name: "Asc", absoluteLong: ascLong, signIndex: Math.floor(ascLong / 30), signDeg: ascLong % 30, isRetro: 0 });
    return tPlanets;
  }, []);

  const computeRpFromDate = useCallback((istDate) => {
    if (typeof Astronomy === "undefined") return;
    const tLat = config.latitude || 0, tLng = config.longitude || 0;
    const ayanam = config.ayanamsa || "kp";
    const tp = computeTransitPlanets(istDate, tLat, tLng, ayanam, config.mandiMode || "kp");
    if (!tp) return;
    const asc = tp.find(p => p.id === "asc");
    const moon = tp.find(p => p.id === "moon");
    if (!asc || !moon) return;
    const aSt = getStellarData(asc.absoluteLong);
    const mSt = getStellarData(moon.absoluteLong);
    const aSI = Math.floor(asc.absoluteLong / 30);
    const aSL = C.LORDS_ORDER[C.RASI_DOMINIONS[aSI]];
    const at = Astronomy.MakeTime(istDate);
    const jd = at.ut + 2451545.0;
    const dL = C.VAARA_LORDS[Math.floor(jd + 1.5) % 7];
    const mSL = C.LORDS_ORDER[C.RASI_DOMINIONS[Math.floor(moon.absoluteLong / 30)]];
    setRpData({
      timestamp: istDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true }),
      lagna: `${C.ZODIAC_NAMES[aSI].s} ${C.ZODIAC_NAMES[aSI].n} (${formatArcMinutes(asc.absoluteLong % 30)})`,
      rp0: dL, rp1: aSL, rp2: aSt.starLord, rp4: mSt.starLord, rp6: mSL,
    });
    setTransitPlanets(tp);
    const tSun = tp.find(p => p.id === "sun");
    if (tSun) {
      const tth = computeThithi(tSun.absoluteLong, moon.absoluteLong);
      const tso = computeThithiSoonya(tth.index);
      setTransitPanchanga({ soonyaSigns: tso.signs, soonyaGrahas: tso.grahas });
    }
  }, [computeTransitPlanets, config.latitude, config.longitude, config.ayanamsa, config.mandiMode]);

  useEffect(() => {
    if (config.dob && config.tob) handleCompute();
  }, [handleCompute]);

  useEffect(() => {
    const fetchRp = () => {
      fetch("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata")
        .then(r => r.json()).then(d => { computeRpFromDate(new Date(d.dateTime)); })
        .catch(() => {
          const n = new Date(); const i = n.getTime() + 5.5 * 3600000;
          computeRpFromDate(new Date(i));
          setRpData(p => p ? { ...p, timestamp: "⚠️ Offline" } : null);
        });
    };
    fetchRp();
    const iv = setInterval(fetchRp, 60000);
    return () => clearInterval(iv);
  }, [computeRpFromDate]);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === "light" ? "dark" : "light";
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(next);
      return next;
    });
  };

  const d = computedData;
  const strEval = d?.strData || [];
  const brainEval = d?.brainData || [];
  const muteEval = d?.muteData || [];
  const purvaEval = d?.purvaData || [];
  const marriageEval = d?.marriageData || [];
  const healthEval = d?.healthData || [];
  const familyEval = d?.familyData || [];
  const jobEval = d?.jobData || [];
  const foreignOpp = d?.foreignOpp;
  const businessOffice = d?.businessOffice;
  const sportEval = d?.sportData || [];
  const studyEval = d?.studyData || [];
  const religionData = d?.religionData;
  const dnaData = d?.dnaData;

  const evalMap = { strength: strEval, brain: brainEval, mute: muteEval, purvapuniya: purvaEval, marriage: marriageEval, health: healthEval, family: familyEval, job: jobEval, sport: sportEval, study: studyEval };
  const entityIdMap = { strength: ["strLagnaLord","strLagnaStar","strAscLordStar","strMoonSign","strMoonStar"], brain: ["brainGuru","brainGuruStar","brainBudhan","brainBudhanStar","brainMoon","brainMoonStar"], mute: ["mute2ndLord","mute2ndLordStar","mute3rdLord","mute3rdLordStar"], purvapuniya: ["purva5thLord","purva5thLordStar"], marriage: ["marriage7thLord","marriage7thLordStar","marriageVenus","marriageVenusStar","marriage2ndLord","marriage2ndLordStar","marriage11thLord","marriage11thLordStar"], health: ["healthAscLord","health6thLord"], family: ["familySun","familyMoon","familyMars","familyMercury","familyJupiter","familyVenus","familySaturn","familyRahu","familyKetu"], job: ["job10thLord","job2ndLord","jobSaturn","job11thLord"], sport: ["sport3rdLord"], study: ["studyBudhan"] };
  const shortLabelMap = { strength: ["LL","LS","AL","ML","MS"], brain: ["G","GS","B","BS","M","MS"], mute: ["2L","2LS","3L","3LS"], purvapuniya: ["5L","5LS"], marriage: ["7L","7LS","V","VS","2L","2LS","11L","11LS"], health: ["AL","6L"], family: ["Su","Mo","Ma","Me","Ju","Ve","Sa","Ra","Ke"], job: ["10","2","Sa","11"], sport: ["3L"], study: ["B"] };

  const showChart = viewFilter === "all" || viewFilter === "charts";
  const showAnalytics = viewFilter === "all" || viewFilter === "tables";

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="container">
      <Header theme={theme} onThemeToggle={toggleTheme} />
      <ControlPanel config={config} onConfigChange={setConfig} onCompute={handleCompute} />
      <div className="meta-bar">
        <div>Krishnamurti Paddhati — Precision Relational System • Placidus Coordinate Engine</div>
        <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
          {d ? `Ayanamsa: ${formatArcMinutes(d.ayanamsaOffset)} | Ascendant: ${formatArcMinutes(d.ascendantAbsoluteLong)}` : "Initializing Ephemeris Vector System..."}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 12, fontSize: "0.65rem" }}>
        <button onClick={() => setShowChangePwd(true)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.65rem", fontFamily: "inherit" }}>Change Password</button>
        <span style={{ color: "var(--bdr-strong)" }}>|</span>
        <button onClick={() => { sessionStorage.removeItem("adminLoggedIn"); setIsLoggedIn(false); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.65rem", fontFamily: "inherit" }}>Logout</button>
      </div>

      <div className="workspace-grid">
        <div className="studio-card"><PanchangaCard data={panchanga} /></div>
        <div className="studio-card" id="rpCard"><RulingPlanets data={rpData} /></div>
      </div>

      <LiveTracker activeDasha={activeDasha} visible={!!activeDasha.mahadasha} />

      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginRight: 4 }}>Check:</span>
        {["all","strength","brain","mute","purvapuniya","marriage","health","family","job","sport","study","religion","dna"].map(v => (
          <button key={v} style={{
            padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem",
            textTransform: "capitalize", transition: "background 0.2s",
            background: checkFilter === v ? "var(--accent)" : "var(--card-sub)",
            color: checkFilter === v ? "#fff" : "var(--accent)",
            border: checkFilter === v ? "1px solid var(--accent)" : "1px solid var(--bdr-strong)"
          }} onClick={() => setCheckFilter(v)}>
            {v === "all" ? "All" : v}
          </button>
        ))}
      </div>

      {checkFilter === "all" ? (<>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Strength Rasi Lagna check" data={strEval} meterId="strength" tableId="strengthTableBody" entityIds={["strLagnaLord","strLagnaStar","strAscLordStar","strMoonSign","strMoonStar"]} shortLabels={["LL","LS","AL","ML","MS"]} />
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Brain check" data={brainEval} meterId="brain" tableId="brainTableBody" entityIds={["brainGuru","brainGuruStar","brainBudhan","brainBudhanStar","brainMoon","brainMoonStar"]} shortLabels={["G","GS","B","BS","M","MS"]} />
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Mute check" data={muteEval} meterId="mute" tableId="muteTableBody" entityIds={["mute2ndLord","mute2ndLordStar","mute3rdLord","mute3rdLordStar"]} shortLabels={["2L","2LS","3L","3LS"]} />
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Purvapuniya check" data={purvaEval} meterId="purva" tableId="purvaTableBody" entityIds={["purva5thLord","purva5thLordStar"]} shortLabels={["5L","5LS"]} />
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Marriage check" data={marriageEval} meterId="marriage" tableId="marriageTableBody" entityIds={["marriage7thLord","marriage7thLordStar","marriageVenus","marriageVenusStar","marriage2ndLord","marriage2ndLordStar","marriage11thLord","marriage11thLordStar"]} shortLabels={["7L","7LS","V","VS","2L","2LS","11L","11LS"]} />
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Health check" data={healthEval} meterId="health" tableId="healthTableBody" entityIds={["healthAscLord","health6thLord"]} shortLabels={["AL","6L"]} />
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Family check" data={familyEval} meterId="family" tableId="familyTableBody" entityIds={["familySun","familyMoon","familyMars","familyMercury","familyJupiter","familyVenus","familySaturn","familyRahu","familyKetu"]} shortLabels={["Su","Mo","Ma","Me","Ju","Ve","Sa","Ra","Ke"]} />
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Study check" data={studyEval} meterId="study" tableId="studyTableBody" entityIds={["studyBudhan"]} shortLabels={["B"]} />
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Job check" data={jobEval} meterId="job" tableId="jobTableBody" entityIds={["job10thLord","job2ndLord","jobSaturn","job11thLord"]} shortLabels={["10","2","Sa","11"]} />
          {foreignOpp && (
            <div style={{ marginTop: 4, padding: "4px 8px", background: foreignOpp.hasOpportunity ? "rgba(46,125,50,0.08)" : "var(--card-sub)", borderRadius: 4, border: "1px solid " + (foreignOpp.hasOpportunity ? "#2E7D32" : "var(--bdr)") }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, marginBottom: 2, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Foreign Opportunity</div>
              <div style={{ fontSize: "0.7rem" }}>
                10th Lord <strong style={{ color: C.PLANET_COLORS[foreignOpp.lord10Name] }}>{foreignOpp.lord10Name}</strong> Star Lord: <strong>{foreignOpp.starLord}</strong> ({foreignOpp.starLordPlanet}) in <strong>{foreignOpp.starLordSign}</strong>
              </div>
              <div style={{ marginTop: 2, fontWeight: 700, fontSize: "0.75rem", color: foreignOpp.hasOpportunity ? "#2E7D32" : "#C62828" }}>
                {foreignOpp.hasOpportunity ? "✓ High opportunity for foreign job" : "✗ No strong indication for foreign job"}
              </div>
            </div>
          )}
          {businessOffice && (
            <div style={{ marginTop: 4, padding: "4px 8px", background: businessOffice.isOffice ? "rgba(198,40,40,0.08)" : "rgba(46,125,50,0.08)", borderRadius: 4, border: "1px solid " + (businessOffice.isOffice ? "#C62828" : "#2E7D32") }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, marginBottom: 2, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Business / Office</div>
              <div style={{ fontSize: "0.7rem" }}>
                10th Sign: <strong>{businessOffice.tenthSign}</strong> (Ucham: {businessOffice.ucham}, Aatchi: {businessOffice.aatchi})
              </div>
              <div style={{ fontSize: "0.7rem" }}>
                Selected: <strong style={{ color: C.PLANET_COLORS[businessOffice.selectedPlanet] }}>{businessOffice.selectedPlanet}</strong> ({businessOffice.selectedReason}) in <strong>{businessOffice.planetSign}</strong> (H{businessOffice.planetBhava})
              </div>
              {businessOffice.conditions.length > 0 && (
                <div style={{ fontSize: "0.6rem", color: "#C62828", marginTop: 1 }}>
                  {businessOffice.conditions.map((c, i) => <div key={i}>✗ {c}</div>)}
                </div>
              )}
              <div style={{ marginTop: 2, fontWeight: 700, fontSize: "0.75rem", color: businessOffice.isOffice ? "#C62828" : "#2E7D32" }}>
                {businessOffice.isOffice ? "✗ Office Work" : "✓ Business Work"}
              </div>
            </div>
          )}
        </div>
        <div className="studio-card" style={{ marginBottom: 4 }}>
          <CheckSection title="Sport check" data={sportEval} meterId="sport" tableId="sportTableBody" entityIds={["sport3rdLord"]} shortLabels={["3L"]} />
        </div>
        {religionData && <div className="studio-card" style={{ marginBottom: 4, borderTop: "2px solid " + (religionData.classification === "North" ? "#D4A017" : religionData.classification === "West" ? "#3B82F6" : "#22C55E") }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "0.8rem" }}>Religion check</h3>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4, color: religionData.classification === "North" ? "#D4A017" : religionData.classification === "West" ? "#3B82F6" : "#22C55E" }}>{religionData.classification}</div>
          <table style={{ width: "100%", fontSize: "0.7rem", borderCollapse: "collapse" }}>
            <thead><tr><th style={{ textAlign: "left", padding: "1px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Entity</th><th style={{ textAlign: "left", padding: "1px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Star Lord</th></tr></thead>
            <tbody>{religionData.items.map((item, i) => (
              <tr key={i}><td style={{ padding: "1px 4px" }}>{item.label}</td><td style={{ padding: "1px 4px", color: item.starLord === "Rah" ? "#9933FF" : item.starLord === "Ket" ? "#CC6600" : "var(--text)" }}>{item.starLord}</td></tr>
            ))}</tbody>
          </table>
          <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 4 }}>Rahu: {religionData.rahuCount}/4 | Ketu: {religionData.ketuCount}/4</div>
        </div>}
        {dnaData && <div className="studio-card" style={{ marginBottom: 4, borderTop: "2px solid " + (dnaData.dominant ? C.DNA_KARMA_COLORS[dnaData.dominant] : "#888") }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "0.8rem" }}>DNA Karma check</h3>
          <table style={{ width: "100%", fontSize: "0.7rem", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={{ textAlign: "left", padding: "1px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Entity</th>
              <th style={{ textAlign: "left", padding: "1px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Detail</th>
              <th style={{ textAlign: "left", padding: "1px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Karma</th>
            </tr></thead>
            <tbody>{dnaData.entities.map((e, i) => (
              <tr key={i}>
                <td style={{ padding: "1px 4px" }}>{e.label}</td>
                <td style={{ padding: "1px 4px", color: "var(--muted)" }}>{e.detail}</td>
                <td style={{ padding: "1px 4px" }}>{e.karmas.map(k => (
                  <span key={k} style={{ display: "inline-block", background: C.DNA_KARMA_COLORS[k], color: "#fff", padding: "1px 4px", borderRadius: 2, fontWeight: 600, fontSize: "0.6rem", marginRight: 1 }}>{C.DNA_KARMA_LABELS[k]}</span>
                ))}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
            {Object.entries(dnaData.counts).filter(([, v]) => v > 0).map(([k, v]) => (
              <span key={k} style={{ background: C.DNA_KARMA_COLORS[k] + "22", color: C.DNA_KARMA_COLORS[k], padding: "1px 6px", borderRadius: 2, fontWeight: 600, fontSize: "0.65rem" }}>{C.DNA_KARMA_LABELS[k]}: {v}</span>
            ))}
          </div>
          <div style={{ marginTop: 4, fontSize: "0.75rem", fontWeight: 700, color: dnaData.dominant ? C.DNA_KARMA_COLORS[dnaData.dominant] : "var(--muted)" }}>
            {dnaData.isTie ? "⚖️ Tie between multiple karmas" : "✓ " + dnaData.dominantLabel + " is dominant"}
          </div>
          {dnaData.seventhEntities && <><div style={{ borderTop: "1px dashed var(--bdr)", margin: "6px 0" }}></div>
          <h4 style={{ margin: "0 0 4px 0", fontSize: "0.75rem", color: "var(--accent)" }}>7th House DNA Match</h4>
          <table style={{ width: "100%", fontSize: "0.7rem", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={{ textAlign: "left", padding: "1px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Entity</th>
              <th style={{ textAlign: "left", padding: "1px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Detail</th>
              <th style={{ textAlign: "left", padding: "1px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Karma</th>
            </tr></thead>
            <tbody>{dnaData.seventhEntities.map((e, i) => (
              <tr key={i}>
                <td style={{ padding: "1px 4px" }}>{e.label}</td>
                <td style={{ padding: "1px 4px", color: "var(--muted)" }}>{e.detail}</td>
                <td style={{ padding: "1px 4px" }}>{e.karmas.map(k => (
                  <span key={k} style={{ display: "inline-block", background: C.DNA_KARMA_COLORS[k], color: "#fff", padding: "1px 4px", borderRadius: 2, fontWeight: 600, fontSize: "0.6rem", marginRight: 1 }}>{C.DNA_KARMA_LABELS[k]}</span>
                ))}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
            {Object.entries(dnaData.seventhCounts).filter(([, v]) => v > 0).map(([k, v]) => (
              <span key={k} style={{ background: C.DNA_KARMA_COLORS[k] + "22", color: C.DNA_KARMA_COLORS[k], padding: "1px 6px", borderRadius: 2, fontWeight: 600, fontSize: "0.65rem" }}>{C.DNA_KARMA_LABELS[k]}: {v}</span>
            ))}
          </div>
          <div style={{ marginTop: 4, fontSize: "0.75rem", fontWeight: 700, color: dnaData.seventhDominant ? C.DNA_KARMA_COLORS[dnaData.seventhDominant] : "var(--muted)" }}>
            {dnaData.seventhIsTie ? "⚖️ Tie between multiple karmas" : "✓ " + dnaData.seventhDominantLabel + " is dominant"}
          </div></>}
        </div>}
      </>) : checkFilter === "religion" ? (
        religionData && <div className="studio-card" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "0.9rem" }}>Religion check</h3>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8, color: religionData.classification === "North" ? "#D4A017" : religionData.classification === "West" ? "#3B82F6" : "#22C55E" }}>{religionData.classification}</div>
          <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
            <thead><tr><th style={{ textAlign: "left", padding: "2px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Entity</th><th style={{ textAlign: "left", padding: "2px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Star Lord</th></tr></thead>
            <tbody>{religionData.items.map((item, i) => (
              <tr key={i}><td style={{ padding: "2px 4px" }}>{item.label}</td><td style={{ padding: "2px 4px", color: item.starLord === "Rah" ? "#9933FF" : item.starLord === "Ket" ? "#CC6600" : "var(--text)" }}>{item.starLord}</td></tr>
            ))}</tbody>
          </table>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 6 }}>Rahu: {religionData.rahuCount}/4 | Ketu: {religionData.ketuCount}/4</div>
        </div>
      ) : checkFilter === "dna" ? (
        dnaData && <div className="studio-card" style={{ marginBottom: 16, borderTop: "3px solid " + (dnaData.dominant ? C.DNA_KARMA_COLORS[dnaData.dominant] : "#888") }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "0.9rem" }}>DNA Karma check</h3>
          <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={{ textAlign: "left", padding: "2px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Entity</th>
              <th style={{ textAlign: "left", padding: "2px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Detail</th>
              <th style={{ textAlign: "left", padding: "2px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Karma</th>
            </tr></thead>
            <tbody>{dnaData.entities.map((e, i) => (
              <tr key={i}>
                <td style={{ padding: "2px 4px" }}>{e.label}</td>
                <td style={{ padding: "2px 4px", color: "var(--muted)" }}>{e.detail}</td>
                <td style={{ padding: "2px 4px" }}>{e.karmas.map(k => (
                  <span key={k} style={{ display: "inline-block", background: C.DNA_KARMA_COLORS[k], color: "#fff", padding: "1px 5px", borderRadius: 3, fontWeight: 600, fontSize: "0.65rem", marginRight: 2 }}>{C.DNA_KARMA_LABELS[k]}</span>
                ))}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {Object.entries(dnaData.counts).filter(([, v]) => v > 0).map(([k, v]) => (
              <span key={k} style={{ background: C.DNA_KARMA_COLORS[k] + "22", color: C.DNA_KARMA_COLORS[k], padding: "2px 8px", borderRadius: 3, fontWeight: 600, fontSize: "0.7rem" }}>{C.DNA_KARMA_LABELS[k]}: {v}</span>
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: "0.85rem", fontWeight: 700, color: dnaData.dominant ? C.DNA_KARMA_COLORS[dnaData.dominant] : "var(--muted)" }}>
            {dnaData.isTie ? "⚖️ Tie between multiple karmas" : "✓ " + dnaData.dominantLabel + " is dominant"}
          </div>
          {dnaData.seventhEntities && <><div style={{ borderTop: "1px dashed var(--bdr)", margin: "10px 0" }}></div>
          <h4 style={{ margin: "0 0 6px 0", fontSize: "0.85rem", color: "var(--accent)" }}>7th House DNA Match</h4>
          <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={{ textAlign: "left", padding: "2px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Entity</th>
              <th style={{ textAlign: "left", padding: "2px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Detail</th>
              <th style={{ textAlign: "left", padding: "2px 4px", borderBottom: "1px solid var(--bdr-strong)" }}>Karma</th>
            </tr></thead>
            <tbody>{dnaData.seventhEntities.map((e, i) => (
              <tr key={i}>
                <td style={{ padding: "2px 4px" }}>{e.label}</td>
                <td style={{ padding: "2px 4px", color: "var(--muted)" }}>{e.detail}</td>
                <td style={{ padding: "2px 4px" }}>{e.karmas.map(k => (
                  <span key={k} style={{ display: "inline-block", background: C.DNA_KARMA_COLORS[k], color: "#fff", padding: "1px 5px", borderRadius: 3, fontWeight: 600, fontSize: "0.65rem", marginRight: 2 }}>{C.DNA_KARMA_LABELS[k]}</span>
                ))}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {Object.entries(dnaData.seventhCounts).filter(([, v]) => v > 0).map(([k, v]) => (
              <span key={k} style={{ background: C.DNA_KARMA_COLORS[k] + "22", color: C.DNA_KARMA_COLORS[k], padding: "2px 8px", borderRadius: 3, fontWeight: 600, fontSize: "0.7rem" }}>{C.DNA_KARMA_LABELS[k]}: {v}</span>
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: "0.85rem", fontWeight: 700, color: dnaData.seventhDominant ? C.DNA_KARMA_COLORS[dnaData.seventhDominant] : "var(--muted)" }}>
            {dnaData.seventhIsTie ? "⚖️ Tie between multiple karmas" : "✓ " + dnaData.seventhDominantLabel + " is dominant"}
          </div></>}
        </div>
      ) : checkFilter === "job" ? (
        <div className="studio-card" style={{ marginBottom: 16 }}>
          <CheckSection title="Job check" data={jobEval} meterId="job" tableId="jobTableBody" entityIds={["job10thLord","job2ndLord","jobSaturn","job11thLord"]} shortLabels={["10","2","Sa","11"]} />
          {foreignOpp && (
            <div style={{ marginTop: 8, padding: "8px 10px", background: foreignOpp.hasOpportunity ? "rgba(46,125,50,0.08)" : "var(--card-sub)", borderRadius: 6, border: "1px solid " + (foreignOpp.hasOpportunity ? "#2E7D32" : "var(--bdr)") }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: 4, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Foreign Opportunity</div>
              <div style={{ fontSize: "0.8rem" }}>
                10th Lord <strong style={{ color: C.PLANET_COLORS[foreignOpp.lord10Name] }}>{foreignOpp.lord10Name}</strong> Star Lord: <strong>{foreignOpp.starLord}</strong> ({foreignOpp.starLordPlanet}) in <strong>{foreignOpp.starLordSign}</strong>
              </div>
              <div style={{ marginTop: 4, fontWeight: 700, fontSize: "0.85rem", color: foreignOpp.hasOpportunity ? "#2E7D32" : "#C62828" }}>
                {foreignOpp.hasOpportunity ? "✓ High opportunity for foreign job" : "✗ No strong indication for foreign job"}
              </div>
            </div>
          )}
          {businessOffice && (
            <div style={{ marginTop: 8, padding: "8px 10px", background: businessOffice.isOffice ? "rgba(198,40,40,0.08)" : "rgba(46,125,50,0.08)", borderRadius: 6, border: "1px solid " + (businessOffice.isOffice ? "#C62828" : "#2E7D32") }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: 4, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Business / Office</div>
              <div style={{ fontSize: "0.8rem" }}>
                10th Sign: <strong>{businessOffice.tenthSign}</strong> (Ucham: {businessOffice.ucham}, Aatchi: {businessOffice.aatchi})
              </div>
              <div style={{ fontSize: "0.8rem" }}>
                Selected: <strong style={{ color: C.PLANET_COLORS[businessOffice.selectedPlanet] }}>{businessOffice.selectedPlanet}</strong> ({businessOffice.selectedReason}) in <strong>{businessOffice.planetSign}</strong> (H{businessOffice.planetBhava})
              </div>
              {businessOffice.conditions.length > 0 && (
                <div style={{ fontSize: "0.7rem", color: "#C62828", marginTop: 2 }}>
                  {businessOffice.conditions.map((c, i) => <div key={i}>✗ {c}</div>)}
                </div>
              )}
              <div style={{ marginTop: 4, fontWeight: 700, fontSize: "0.85rem", color: businessOffice.isOffice ? "#C62828" : "#2E7D32" }}>
                {businessOffice.isOffice ? "✗ Office Work" : "✓ Business Work"}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="studio-card" style={{ marginBottom: 16 }}>
          <CheckSection title={checkFilter.charAt(0).toUpperCase() + checkFilter.slice(1) + " check"} data={evalMap[checkFilter]} meterId={checkFilter} tableId={checkFilter + "TableBody"} entityIds={entityIdMap[checkFilter]} shortLabels={shortLabelMap[checkFilter]} />
        </div>
      )}

      {d && (<div style={{ display: showChart ? "block" : "none", marginBottom: 24 }}>
        <ChartGrid planets={d.planets} cusps={d.cusps} ascendantAbsoluteLong={d.ascendantAbsoluteLong} panchanga={panchanga} birthTime={d.birthTime} config={config} transitPlanets={transitPlanets} transitPanchanga={transitPanchanga} onConfigChange={setConfig} ashtakavarga={d?.ashtakavarga} />
      </div>)}

      {d && (<div id="analyticsContainer" style={{ display: showAnalytics ? "block" : "none" }}>
        <PlanetTable planets={d.planets} cusps={d.cusps} ascendantAbsoluteLong={d.ascendantAbsoluteLong} />
        <div className="studio-card">
          <h3>Vimshottari Dasha Chart</h3>
          <DashaTree moonLong={d.planets.find(p => p.id === "moon")?.absoluteLong || 0} birthTime={d.birthTime} onActiveDashaChange={setActiveDasha} />
        </div>
        <CuspHouse cusps={d.cusps} planets={d.planets} />
      </div>)}

      <Footer />
      {showChangePwd && <ChangePassword onClose={() => setShowChangePwd(false)} />}
    </div>
  );
}

function evaluateEntity(entity, planets, cusps, ascLong, skipGuru, skipPavagraha) {
  const sr = [], wr = [];
  const h = checkHouseCategory(entity.bhavaIdx);
  const d = entity.dignity;
  const vk = checkVarkothaam(entity.absoluteLong);
  if (vk.isMatch) return { status: "STRONG", score: 5, strongReasons: [`Varkothaam — D1 #${vk.d1Sign+1} = D9 #${vk.d9Sign+1}`], weakReasons: [], guruAspect: false };

  const gH = h.isKendra || h.isTrikona;
  const bH = h.isDusthana;
  const gD = d.isUcham || d.isAatchi || d.isNatpu;
  const bD = d.isNeecham || d.isPagai;

  if (gH && gD) sr.push(`Kendra/Trikona (H${entity.bhavaIdx}) + good dignity`);
  else { if (gH) sr.push(`House ${entity.bhavaIdx} in Kendra/Trikona`); if (gD) sr.push(d.isUcham ? "Ucham" : d.isAatchi ? "Aatchi" : "Natpu"); }

  if (bH && (bD || entity.isCombust || entity.isGrahana || entity.isTrikona)) {
    const p = [`Dusthana H${entity.bhavaIdx}`];
    if (bD) p.push(d.isNeecham ? "Neecham" : "Pagai");
    if (entity.isCombust) p.push("Combust");
    if (entity.isGrahana) p.push("Grahana");
    if (entity.isTrikona) p.push("Trikona");
    wr.push(p.join(" + "));
  } else {
    if (bH) wr.push(`Dusthana H${entity.bhavaIdx}`);
    if (bD) wr.push(d.isNeecham ? "Neecham" : "Pagai");
    if (entity.isCombust) wr.push("Combust");
    if (entity.isGrahana) wr.push("Grahana Dosha");
    if (entity.isTrikona) wr.push("Trikona Grahana");
  }

  const pk = checkPushkarNavamsam(entity.nakIdx, entity.pada);
  if (pk.isPushkar) sr.push(`Pushkar Navamsam (${pk.lord})`);

  const eg = checkEdgeIssue(entity.signIdx, entity.signDeg);
  if (eg.hasIssue) wr.push("Edge: " + eg.label);

  const mp = checkMiruthiviPagai(entity.nakIdx, entity.pada);
  if (mp.isAffected) wr.push("Miruthivi Pagai — " + mp.label);

  let p68 = { hasPavagrahaIn68: false, enemyStarLordFound: false };
  if (!skipPavagraha && C.PAVAGRAHA_TARGETS.includes(entity.label)) {
    p68 = checkPavagraha68Rule(entity, planets, cusps);
    if (p68.hasPavagrahaIn68) wr.push("Pavagraha in 6th/8th bhava");
    if (p68.enemyStarLordFound) wr.push("Enemy star lord from 6th/8th bhava");
  }

  let pRule = { hasIssue: false, reasons: [] }, pkOv = false;
  if (C.PATHAGAM_TARGETS.includes(entity.label)) {
    const r = checkPathagamDusthanaRule({ ...entity, ascendantAbsoluteLong: ascLong }, cusps, planets);
    if (r.hasIssue) {
      r.reasons.forEach(x => wr.push("Pathagam/Dusthana: " + x));
      if (pk.isPushkar) { pkOv = true; wr.push("Pushkar Navamsam overridden by Pathagam/Dusthana"); }
    }
  }

  const gu = skipGuru ? { hasAspect: false, reason: "" } : checkGuruAspect(entity.bhavaIdx, entity.label, planets, cusps);
  const hPk = pk.isPushkar && !pkOv;
  const sG = gH && gD, sB = bH && (bD || entity.isCombust || entity.isGrahana || entity.isTrikona);

  let status;
  if (sG && !eg.hasIssue && !mp.isAffected && !p68.enemyStarLordFound && !p68.hasPavagrahaIn68 && !pRule.hasIssue) status = "STRONG";
  else if (hPk && !eg.hasIssue && !mp.isAffected && !sB && !p68.enemyStarLordFound && !p68.hasPavagrahaIn68 && !pRule.hasIssue) status = "STRONG";
  else if (sB || eg.hasIssue || mp.isAffected || p68.hasPavagrahaIn68 || p68.enemyStarLordFound || pRule.hasIssue) status = "WEAK";
  else status = "MEDIUM";

  if (gu.hasAspect && status === "WEAK") {
    if (p68.enemyStarLordFound) { status = "MEDIUM"; sr.push("Guru aspect partial remedy — enemy star lord in 6th/8th"); }
    else if (pRule.hasIssue) { status = "MEDIUM"; sr.push("Guru aspect partial remedy — Pathagam/Dusthana"); }
    else { status = "STRONG"; sr.push("Guru aspect remedy — " + gu.reason); }
  }

  const score = (sG ? 3 : 0) + (hPk ? 2 : 0) - (sB ? 3 : 0) - (eg.hasIssue ? 2 : 0) - (mp.isAffected ? 2 : 0) - (p68.hasPavagrahaIn68 ? 2 : 0) - (p68.enemyStarLordFound ? 3 : 0) - (pRule.hasIssue ? 2 : 0);
  return { status, score, strongReasons: sr, weakReasons: wr, guruAspect: gu.hasAspect };
}

function computeCheckData(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const aSLC = C.LORDS_ORDER[C.RASI_DOMINIONS[aSI]];
  const aStC = getStellarData(ascLong).starLord;
  const aLP = planets.find(p => p.name === C.STAR_TO_PLANET[aSLC]);
  const aLSC = aLP ? getStellarData(aLP.absoluteLong).starLord : "";
  const mD = planets.find(p => p.id === "moon");
  const mSLC = mD ? C.LORDS_ORDER[C.RASI_DOMINIONS[Math.floor(mD.absoluteLong / 30)]] : "";
  const mStC = mD ? getStellarData(mD.absoluteLong).starLord : "";
  const ents = [buildEntity("Asc Lord", aSLC, planets, cusps, ascLong), buildEntity("Asc Star Lord", aStC, planets, cusps, ascLong), buildEntity("Asc Lord Starlord", aLSC, planets, cusps, ascLong), mD ? buildEntity("Moon Sign Lord", mSLC, planets, cusps, ascLong) : null, mD ? buildEntity("Moon Star Lord", mStC, planets, cusps, ascLong) : null].filter(Boolean);
  return ents.map(e => ({ entity: e, evaluation: evaluateEntity(e, planets, cusps, ascLong) }));
}

function computeBrainCheck(planets, cusps, ascLong) {
  const gP = planets.find(p => p.id === "jupiter"), bP = planets.find(p => p.id === "mercury"), mP = planets.find(p => p.id === "moon");
  const gSC = gP ? getStellarData(gP.absoluteLong).starLord : "", bSC = bP ? getStellarData(bP.absoluteLong).starLord : "", mSC = mP ? getStellarData(mP.absoluteLong).starLord : "";
  const ents = [buildEntityFromPlanet("Guru", gP, cusps, planets), buildEntity("Guru Star Lord", gSC, planets, cusps, ascLong), buildEntityFromPlanet("Budhan", bP, cusps, planets), buildEntity("Budhan Star Lord", bSC, planets, cusps, ascLong), buildEntityFromPlanet("Moon", mP, cusps, planets), buildEntity("Moon Star Lord", mSC, planets, cusps, ascLong)].filter(Boolean);
  return ents.map(e => ({ entity: e, evaluation: evaluateEntity(e, planets, cusps, ascLong, true) }));
}

function computeMuteCheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const l2C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 1) % 12]], l3C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 2) % 12]];
  const l2P = planets.find(p => p.name === C.STAR_TO_PLANET[l2C]), l3P = planets.find(p => p.name === C.STAR_TO_PLANET[l3C]);
  const l2SC = l2P ? getStellarData(l2P.absoluteLong).starLord : "", l3SC = l3P ? getStellarData(l3P.absoluteLong).starLord : "";
  const ents = [buildEntity("2nd Lord", l2C, planets, cusps, ascLong), buildEntity("2nd Lord Star Ld", l2SC, planets, cusps, ascLong), buildEntity("3rd Lord", l3C, planets, cusps, ascLong), buildEntity("3rd Lord Star Ld", l3SC, planets, cusps, ascLong)].filter(Boolean);
  return ents.map(e => ({ entity: e, evaluation: evaluateEntity(e, planets, cusps, ascLong, true) }));
}

function computePurvaCheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const l5C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 4) % 12]];
  const l5P = planets.find(p => p.name === C.STAR_TO_PLANET[l5C]);
  const l5SC = l5P ? getStellarData(l5P.absoluteLong).starLord : "";
  const ents = [buildEntity("5th Lord", l5C, planets, cusps, ascLong), buildEntity("5th Lord Star Ld", l5SC, planets, cusps, ascLong)].filter(Boolean);
  return ents.map(e => ({ entity: e, evaluation: evaluateEntity(e, planets, cusps, ascLong, true) }));
}

function computeMarriageCheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const l7C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 6) % 12]], l2C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 1) % 12]], l11C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 10) % 12]];
  const l7P = planets.find(p => p.name === C.STAR_TO_PLANET[l7C]), l2P = planets.find(p => p.name === C.STAR_TO_PLANET[l2C]), l11P = planets.find(p => p.name === C.STAR_TO_PLANET[l11C]);
  const vP = planets.find(p => p.id === "venus");
  const l7SC = l7P ? getStellarData(l7P.absoluteLong).starLord : "", l2SC = l2P ? getStellarData(l2P.absoluteLong).starLord : "", l11SC = l11P ? getStellarData(l11P.absoluteLong).starLord : "", vSC = vP ? getStellarData(vP.absoluteLong).starLord : "";
  let ents = [buildEntity("7th Lord", l7C, planets, cusps, ascLong), buildEntity("7th Lord Star Ld", l7SC, planets, cusps, ascLong), vP ? buildEntityFromPlanet("Venus", vP, cusps, planets) : null, buildEntity("Venus Star Ld", vSC, planets, cusps, ascLong), buildEntity("2nd Lord", l2C, planets, cusps, ascLong), buildEntity("2nd Lord Star Ld", l2SC, planets, cusps, ascLong), buildEntity("11th Lord", l11C, planets, cusps, ascLong), buildEntity("11th Lord Star Ld", l11SC, planets, cusps, ascLong)].filter(Boolean);
  let res = ents.map(e => ({ entity: e, evaluation: evaluateEntity(e, planets, cusps, ascLong, true, true) }));
  res.forEach(r => {
    if (C.MARRIAGE_PATHAGAM_2ND.includes(r.entity.label)) {
      const pd = checkPathagamDusthanaRule({ ...r.entity, ascendantAbsoluteLong: ascLong }, cusps, planets);
      if (pd.hasIssue) { pd.reasons.forEach(x => r.evaluation.weakReasons.push("Pathagam/Dusthana: " + x)); r.evaluation.status = "WEAK"; r.evaluation.score -= 2; }
    }
    const bhava6 = ((r.entity.bhavaIdx + 4) % 12) + 1, bhava8 = ((r.entity.bhavaIdx + 6) % 12) + 1;
    const pavIn68 = planets.filter(p => [bhava6, bhava8].includes(getBhavaIndex(p.absoluteLong, cusps)) && C.PAVAGRAHAS.includes(C.PLANET_TO_LORD_MAP[p.name]));
    for (const pp of pavIn68) {
      const eSl = r.entity.starLord, pSl = getStellarData(pp.absoluteLong).starLord;
      if ((C.ENEMY_MAP[eSl] || []).includes(pSl) && (C.ENEMY_MAP[pSl] || []).includes(eSl)) {
        r.evaluation.weakReasons.push(`Pavagraha ${pp.name} in 6th/8th — enemy star lords`);
        r.evaluation.score -= 5; if (r.evaluation.status === "MEDIUM") r.evaluation.status = "WEAK"; break;
      }
    }
    const slN = C.STAR_TO_PLANET[r.entity.starLord];
    const slP = planets.find(p => p.name === slN);
    if (slP) {
      const sC = C.PLANET_TO_LORD_MAP[slN];
      const sD = C.SIGN_DIGNITY[slP.signIndex];
      if (sD && sD.neecham === sC) {
        r.evaluation.weakReasons.push(`${slN} (star lord of ${r.entity.planetName}) is Neecham`);
        r.evaluation.score -= 2; if (r.evaluation.status === "MEDIUM") r.evaluation.status = "WEAK";
      }
      const sL = planets.find(p => p.id === "sun")?.absoluteLong || 0;
      const dI = Math.min(Math.abs((slP.absoluteLong - sL + 360) % 360), 360 - Math.abs((slP.absoluteLong - sL + 360) % 360));
      const CO = { venus: 9, mercury: 13, mars: 17, jupiter: 11, saturn: 15 };
      if (CO[slP.id] && dI <= CO[slP.id] && slP.id !== "sun") {
        r.evaluation.weakReasons.push(`${slN} (star lord of ${r.entity.planetName}) is Combust`);
        r.evaluation.score -= 2; if (r.evaluation.status === "MEDIUM") r.evaluation.status = "WEAK";
      }
    }
    const l8C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 7) % 12]];
    const slCode = C.PLANET_TO_LORD_MAP[C.STAR_TO_PLANET[r.entity.starLord]];
    if (slCode === l8C) {
      r.evaluation.weakReasons.push(r.entity.starLord + " (star lord) is 8th lord");
      r.evaluation.score -= 2; if (r.evaluation.status === "MEDIUM") r.evaluation.status = "WEAK";
    }
    const slPlanet = planets.find(p => p.name === C.STAR_TO_PLANET[r.entity.starLord]);
    if (slPlanet) {
      const slBhava = getBhavaIndex(slPlanet.absoluteLong, cusps);
      if (slBhava === 6 || slBhava === 8 || slBhava === 12) {
        r.evaluation.weakReasons.push(slPlanet.name + " (star lord of " + r.entity.planetName + ") in H" + slBhava);
        r.evaluation.score -= 2; if (r.evaluation.status === "MEDIUM") r.evaluation.status = "WEAK";
      }
    }
  });
  return res;
}

function computeHealthCheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const ascLordCode = C.LORDS_ORDER[C.RASI_DOMINIONS[aSI]];
  const l6C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 5) % 12]];
  const l8C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 7) % 12]];

  const ascEntity = buildEntity("Asc Lord", ascLordCode, planets, cusps, ascLong);
  const l6Entity = buildEntity("6th Lord", l6C, planets, cusps, ascLong);
  if (!ascEntity || !l6Entity) return [];

  const aspectsOrSitsH1 = (planet) => {
    const b = getBhavaIndex(planet.absoluteLong, cusps);
    return b === 1 || b === 7;
  };

  const ascSlName = C.STAR_TO_PLANET[ascEntity.starLord];
  const l6SlName = C.STAR_TO_PLANET[l6Entity.starLord];
  const ascSlPlanet = planets.find(p => p.name === ascSlName);
  const l6SlPlanet = planets.find(p => p.name === l6SlName);

  const sameStarLord = ascEntity.starLord === l6Entity.starLord;
  let exchange = false;
  if (ascSlPlanet && l6SlPlanet) {
    exchange = getStellarData(ascSlPlanet.absoluteLong).starLord === l6Entity.starLord
      && getStellarData(l6SlPlanet.absoluteLong).starLord === ascEntity.starLord;
  }

  const ascWr = [];
  let ascSc = 0;
  const ascBhava = ascEntity.bhavaIdx;

  if ([6, 8, 12].includes(ascBhava) && ascSlPlanet) {
    const slBhava = getBhavaIndex(ascSlPlanet.absoluteLong, cusps);
    if ([6, 8].includes(slBhava)) {
      ascWr.push(`Asc Lord in H${ascBhava} — star lord in H${slBhava}`); ascSc -= 3;
    }
  }

  if (ascEntity.dignity.isNeecham && ascEntity.isCombust && ascBhava === 1) {
    const pavOnAsc = planets.filter(p => C.PAVAGRAHAS.includes(C.PLANET_TO_LORD_MAP[p.name]) && aspectsOrSitsH1(p));
    const l6P = planets.find(p => p.name === C.STAR_TO_PLANET[l6C]);
    const l8P = planets.find(p => p.name === C.STAR_TO_PLANET[l8C]);
    if (pavOnAsc.length > 0 && ((l6P && aspectsOrSitsH1(l6P)) || (l8P && aspectsOrSitsH1(l8P)))) {
      ascWr.push("Asc Lord neecham/combust in H1 — Pavagraha+6L/8L influence on Asc"); ascSc -= 3;
    }
  }

  const ascWithPav = planets.filter(p => C.PAVAGRAHAS.includes(C.PLANET_TO_LORD_MAP[p.name]) && getBhavaIndex(p.absoluteLong, cusps) === ascBhava);
  if (ascWithPav.length > 0) {
    const slInH8 = ascSlPlanet && getBhavaIndex(ascSlPlanet.absoluteLong, cusps) === 8;
    if (slInH8 || ascEntity.dignity.isNeecham || ascEntity.isCombust) {
      const parts = ["Asc Lord conjunct Pavagraha"];
      if (ascEntity.dignity.isNeecham) parts.push("neecham");
      if (ascEntity.isCombust) parts.push("combust");
      if (slInH8) parts.push("star lord in H8");
      ascWr.push(parts.join(" — ")); ascSc -= 3;
    }
  }

  if (sameStarLord) { ascWr.push(`Asc Lord and 6th Lord share star lord (${ascEntity.starLord})`); ascSc -= 3; }
  if (exchange) { ascWr.push("Star lord exchange between Asc Lord and 6th Lord"); ascSc -= 5; }

  const l6Wr = [];
  let l6Sc = 0;

  if (l6Entity.bhavaIdx === 6 && l6SlPlanet && getBhavaIndex(l6SlPlanet.absoluteLong, cusps) === 1) {
    l6Wr.push("6th Lord in H6 — star lord in Ascendant"); l6Sc -= 3;
  }

  if ([8, 12].includes(l6Entity.bhavaIdx) && l6SlPlanet && getBhavaIndex(l6SlPlanet.absoluteLong, cusps) === 1) {
    l6Wr.push(`6th Lord in H${l6Entity.bhavaIdx} — star lord in Ascendant`); l6Sc -= 3;
  }

  if (sameStarLord) { l6Wr.push(`6th Lord and Asc Lord share star lord (${l6Entity.starLord})`); l6Sc -= 3; }
  if (exchange) { l6Wr.push("Star lord exchange between 6th Lord and Asc Lord"); l6Sc -= 5; }

  return [
    { entity: ascEntity, evaluation: { status: ascSc < 0 ? "WEAK" : "MEDIUM", score: ascSc, strongReasons: [], weakReasons: ascWr, guruAspect: false } },
    { entity: l6Entity, evaluation: { status: l6Sc < 0 ? "WEAK" : "MEDIUM", score: l6Sc, strongReasons: [], weakReasons: l6Wr, guruAspect: false } }
  ];
}

function computeFamilyCheck(planets, cusps, ascLong) {
  const fps = [{id:"sun",n:"Sun",l:"Sun (Father)"},{id:"moon",n:"Moon",l:"Moon (Mother)"},{id:"mars",n:"Mars",l:"Mars (Siblings)"},{id:"mercury",n:"Mercury",l:"Mercury (Maternal)"},{id:"jupiter",n:"Jupiter",l:"Jupiter (Children)"},{id:"venus",n:"Venus",l:"Venus (Wife)"},{id:"saturn",n:"Saturn",l:"Saturn (Elders)"},{id:"rahu",n:"Rahu",l:"Rahu (Maternal GP)"},{id:"ketu",n:"Ketu",l:"Ketu (Paternal GP)"}];
  const ents = fps.map(f => { const p = planets.find(x => x.name === f.n); return p ? buildEntityFromPlanet(f.l, p, cusps, planets) : null; }).filter(Boolean);
  return ents.map(e => {
    const wr = []; const sr = []; let sc = 0; const d = e.dignity;
    if (d.isNeecham) { wr.push("Neecham"); sc -= 2; } if (d.isPagai) { wr.push("Pagai"); sc -= 1; }
    if (e.isCombust) { wr.push("Combust"); sc -= 2; } if (e.isGrahana) { wr.push("Grahana Dosha"); sc -= 2; } if (e.isTrikona) { wr.push("Trikona Grahana"); sc -= 2; }
    const eg = checkEdgeIssue(e.signIdx, e.signDeg); if (eg.hasIssue) { wr.push("Edge: " + eg.label); sc -= 2; }
    const mp = checkMiruthiviPagai(e.nakIdx, e.pada); if (mp.isAffected) { wr.push("Miruthivi Pagai — " + mp.label); sc -= 2; }
    const hc = checkHouseCategory(e.bhavaIdx);
    if (hc.isKendra || hc.isTrikona) { sr.push(`Kendra/Trikona H${e.bhavaIdx}`); sc += 2; }
    const bhava6 = ((e.bhavaIdx + 4) % 12) + 1, bhava8 = ((e.bhavaIdx + 6) % 12) + 1;
    const pavIn68 = planets.filter(p => [bhava6, bhava8].includes(getBhavaIndex(p.absoluteLong, cusps)) && C.PAVAGRAHAS.includes(C.PLANET_TO_LORD_MAP[p.name]));
    for (const pp of pavIn68) {
      const eSl = e.starLord, pSl = getStellarData(pp.absoluteLong).starLord;
      if ((C.ENEMY_MAP[eSl] || []).includes(pSl) && (C.ENEMY_MAP[pSl] || []).includes(eSl)) {
        wr.push(`Pavagraha ${pp.name} in 6th/8th — enemy star lords`); sc -= 5; break;
      }
    }
    const slN = C.STAR_TO_PLANET[e.starLord];
    const slP = planets.find(p => p.name === slN);
    if (slP) {
      const sC = C.PLANET_TO_LORD_MAP[slN];
      const sD = C.SIGN_DIGNITY[slP.signIndex];
      if (sD && sD.neecham === sC) { wr.push(`${slN} (star lord of ${e.planetName}) is Neecham`); sc -= 2; }
      const sL = planets.find(p => p.id === "sun")?.absoluteLong || 0;
      const dI = Math.min(Math.abs((slP.absoluteLong - sL + 360) % 360), 360 - Math.abs((slP.absoluteLong - sL + 360) % 360));
      const CO = { venus: 9, mercury: 13, mars: 17, jupiter: 11, saturn: 15 };
      if (CO[slP.id] && dI <= CO[slP.id] && slP.id !== "sun") { wr.push(`${slN} (star lord of ${e.planetName}) is Combust`); sc -= 2; }
      const sB = getBhavaIndex(slP.absoluteLong, cusps);
      if (sB === 6 || sB === 8 || sB === 12) { wr.push(`${slN} (star lord of ${e.planetName}) in H${sB}`); sc -= 2; }
    }
    let st = sc >= 0 ? "MEDIUM" : "WEAK";
    const gu = checkGuruAspect(e.bhavaIdx, e.label, planets, cusps); if (gu.hasAspect && st === "WEAK") { st = "MEDIUM"; sc += 2; }
    if (gu.hasAspect) { sr.push("Guru aspect remedy — " + gu.reason); }
    return { entity: e, evaluation: { status: st, score: sc, strongReasons: sr, weakReasons: wr, guruAspect: gu.hasAspect } };
  });
}

function computeJobCheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const l2C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 1) % 12]], l10C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 9) % 12]], l11C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 10) % 12]];
  const sP = planets.find(p => p.name === "Saturn");
  const ents = [buildEntity("10th Lord (Career)", l10C, planets, cusps, ascLong), buildEntity("2nd Lord (Finance)", l2C, planets, cusps, ascLong), sP ? buildEntityFromPlanet("Saturn (Karma)", sP, cusps, planets) : null, buildEntity("11th Lord (Gains)", l11C, planets, cusps, ascLong)].filter(Boolean);
  return ents.map(e => {
    const wr = []; const sr = []; let sc = 0; const d = e.dignity;
    if (d.isNeecham) { wr.push("Neecham"); sc -= 2; } if (d.isPagai) { wr.push("Pagai"); sc -= 1; } if (e.isCombust) { wr.push("Combust"); sc -= 2; }
    const hc = checkHouseCategory(e.bhavaIdx);
    if (hc.isKendra || hc.isTrikona) { sr.push(`Kendra/Trikona H${e.bhavaIdx}`); sc += 2; }
    const bhava6 = ((e.bhavaIdx + 4) % 12) + 1, bhava8 = ((e.bhavaIdx + 6) % 12) + 1;
    const planetsIn68 = planets.filter(p => [bhava6, bhava8].includes(getBhavaIndex(p.absoluteLong, cusps)));
    if (planetsIn68.some(p => p.name === "Saturn")) { wr.push("Saturn in 6th/8th bhava"); sc -= 2; }
    const entityCode = C.PLANET_TO_LORD_MAP[e.planetName];
    let enemyStarLordFound = false;
    if (entityCode) {
      const enemyCodes = C.ENEMY_MAP[entityCode] || [];
      for (const p of planetsIn68) {
        if (enemyCodes.includes(getStellarData(p.absoluteLong).starLord)) { enemyStarLordFound = true; break; }
      }
    }
    if (enemyStarLordFound) { wr.push("Enemy star lord from 6th/8th bhava"); sc -= 3; }
    const saturnP = planets.find(p => p.name === "Saturn");
    const ketuP = planets.find(p => p.name === "Ketu");
    if (saturnP && ketuP) {
      const satBhava = getBhavaIndex(saturnP.absoluteLong, cusps);
      const ketuBhava = getBhavaIndex(ketuP.absoluteLong, cusps);
      const bhavaDiff = ((ketuBhava - satBhava + 12) % 12);
      if (bhavaDiff === 5 || bhavaDiff === 7) {
        wr.push("Ketu in 6th/8th from Saturn"); sc -= 2;
        const satStarLord = getStellarData(saturnP.absoluteLong).starLord;
        const ketuStarLord = getStellarData(ketuP.absoluteLong).starLord;
        const satCode = C.PLANET_TO_LORD_MAP["Saturn"];
        const ketuCode = C.PLANET_TO_LORD_MAP["Ketu"];
        const satEnemyCodes = C.ENEMY_MAP[satCode] || [];
        const ketuEnemyCodes = C.ENEMY_MAP[ketuCode] || [];
        const satStarLordEnemies = C.ENEMY_MAP[satStarLord] || [];
        const ketuStarLordEnemies = C.ENEMY_MAP[ketuStarLord] || [];
        if (satEnemyCodes.includes(ketuStarLord) || ketuEnemyCodes.includes(satStarLord)
            || satStarLordEnemies.includes(ketuStarLord) || ketuStarLordEnemies.includes(satStarLord)) {
          wr.push("Saturn-Ketu enemy star lords"); sc -= 5;
        }
      }
    }
    const slName = C.STAR_TO_PLANET[e.starLord];
    const slPlanet = planets.find(p => p.name === slName);
    if (slPlanet) {
      const slCode = C.PLANET_TO_LORD_MAP[slName];
      const slDignity = C.SIGN_DIGNITY[slPlanet.signIndex];
      if (slDignity && slDignity.neecham === slCode) {
        wr.push(`${slName} (star lord of ${e.planetName}) is Neecham`); sc -= 2;
      }
      const sunLong = planets.find(p => p.id === "sun")?.absoluteLong || 0;
      const diff = Math.min(Math.abs((slPlanet.absoluteLong - sunLong + 360) % 360), 360 - Math.abs((slPlanet.absoluteLong - sunLong + 360) % 360));
      const COMBUST_ORBS = { venus: 9, mercury: 13, mars: 17, jupiter: 11, saturn: 15 };
      if (COMBUST_ORBS[slPlanet.id] && diff <= COMBUST_ORBS[slPlanet.id] && slPlanet.id !== "sun") {
        wr.push(`${slName} (star lord of ${e.planetName}) is Combust`); sc -= 2;
      }
      const l8C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 7) % 12]];
      if (slCode === l8C) {
        wr.push(`${slName} (star lord of ${e.planetName}) is 8th lord`); sc -= 2;
      }
    }
    let st = sc >= 0 ? "MEDIUM" : "WEAK";
    const gu = checkGuruAspect(e.bhavaIdx, e.label, planets, cusps); if (gu.hasAspect && st === "WEAK") { st = "MEDIUM"; sc += 2; sr.push("Guru aspect remedy — " + gu.reason); }
    const sC = e.starLord;
    const sPN = C.STAR_TO_PLANET[sC] || "";
    const sPl = planets.find(p => p.name === sPN);
    if (sPl) { const sB = getBhavaIndex(sPl.absoluteLong, cusps); if ((sB === 6 || sB === 8 || sB === 12) && st === "WEAK") { st = "MEDIUM"; wr.push(`Star lord in ${sB} bhava — upgraded to average`); } }
    return { entity: e, evaluation: { status: st, score: sc, strongReasons: sr, weakReasons: wr, guruAspect: gu.hasAspect } };
  });
}

function computeForeignOpportunity(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const l10C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 9) % 12]];
  const ubhayaRasis = [2, 5, 8, 11];
  const l10Planet = planets.find(p => p.name === C.STAR_TO_PLANET[l10C]);
  if (!l10Planet) return null;
  const starData = getStellarData(l10Planet.absoluteLong);
  const starLordPlanet = planets.find(p => p.name === C.STAR_TO_PLANET[starData.starLord]);
  if (!starLordPlanet) return null;
  const isUbhaya = ubhayaRasis.includes(starLordPlanet.signIndex);
  const ascStarData = getStellarData(ascLong);
  const rahuPlanet = planets.find(p => p.name === "Rahu");
  const mentionedRasis = [2, 6, 10];
  let condition1 = false, condition2 = false;
  if (ascStarData && rahuPlanet) {
    const rahuStarData = getStellarData(rahuPlanet.absoluteLong);
    condition1 = ascStarData.starLord === rahuStarData.starLord && mentionedRasis.includes(rahuPlanet.signIndex);
    if (!condition1) {
      const ascStarLordPlanet = planets.find(p => p.name === C.STAR_TO_PLANET[ascStarData.starLord]);
      condition2 = ascStarLordPlanet && mentionedRasis.includes(ascStarLordPlanet.signIndex);
    }
  }
  const hasOpportunity = isUbhaya || condition1 || condition2;
  return {
    lord10Name: l10Planet.name,
    starLord: starData.starLord,
    starLordPlanet: starLordPlanet.name,
    starLordSign: C.ZODIAC_NAMES[starLordPlanet.signIndex]?.n + " " + C.ZODIAC_NAMES[starLordPlanet.signIndex]?.s,
    starLordSignIdx: starLordPlanet.signIndex,
    isUbhaya,
    condition1,
    condition2,
    hasOpportunity
  };
}

function computeBusinessOfficeCheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const tenthSign = (aSI + 9) % 12;
  const dign = C.SIGN_DIGNITY[tenthSign];

  const selectedCode = dign.ucham || dign.aatshi[0];
  const selectedName = C.STAR_TO_PLANET[selectedCode];
  const selectedReason = dign.ucham ? "Ucham" : "Aatchi";

  const planet = planets.find(p => p.name === selectedName);
  if (!planet) return null;

  const tenthSignName = C.ZODIAC_NAMES[tenthSign].n;
  const planetSignIdx = planet.signIndex;
  const planetSignName = C.ZODIAC_NAMES[planetSignIdx].n;
  const bhava = getBhavaIndex(planet.absoluteLong, cusps);

  const pLord = C.PLANET_TO_LORD_MAP[planet.name];
  const sD = C.SIGN_DIGNITY[planetSignIdx];
  const isNeecham = sD.neecham === pLord;
  const isPagai = sD.pagai.includes(pLord);
  const sun = planets.find(p => p.id === "sun");
  const combustOrbs = { venus: 9, mercury: 13, mars: 17, jupiter: 11, saturn: 15 };
  const cDiff = sun ? Math.min(Math.abs((planet.absoluteLong - sun.absoluteLong + 360) % 360), 360 - Math.abs((planet.absoluteLong - sun.absoluteLong + 360) % 360)) : 999;
  const isCombust = combustOrbs[planet.id] && cDiff <= combustOrbs[planet.id] && planet.id !== "sun";

  const sixthFrom10th = (tenthSign + 5) % 12;
  const eighthFrom10th = (tenthSign + 7) % 12;
  const in6thOr8thSign = planetSignIdx === sixthFrom10th || planetSignIdx === eighthFrom10th;

  const inBadBhava = bhava === 6 || bhava === 8 || bhava === 12;

  const conditions = [];
  if (in6thOr8thSign) conditions.push(`Sign ${planetSignName} = ${planetSignIdx === sixthFrom10th ? "6th" : "8th"} from ${tenthSignName}`);
  if (isNeecham) conditions.push("Neecham");
  if (isPagai) conditions.push("Pagai");
  if (isCombust) conditions.push("Combust");
  if (inBadBhava) conditions.push(`Bhava ${bhava} from asc`);

  const isOffice = conditions.length > 0;

  return {
    tenthSign: tenthSignName,
    ucham: C.STAR_TO_PLANET[dign.ucham] || "—",
    aatchi: C.STAR_TO_PLANET[dign.aatshi[0]] || "—",
    selectedPlanet: selectedName,
    selectedReason,
    planetSign: planetSignName,
    planetBhava: bhava,
    conditions,
    isOffice,
    label: isOffice ? "OFFICE WORK" : "BUSINESS WORK"
  };
}

function computeSportCheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const l3C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 2) % 12]];
  const e = buildEntity("3rd Lord (Sport)", l3C, planets, cusps, ascLong);
  if (!e) return [];
  const wr = []; let sc = 0, slIssue = false;
  const slN = C.STAR_TO_PLANET[e.starLord];
  const slP = planets.find(p => p.name === slN);
  if (slP) {
    const sC = C.PLANET_TO_LORD_MAP[slN];
    const sD = C.SIGN_DIGNITY[slP.signIndex];
    if (sD && sD.neecham === sC) { wr.push(`${slN} (star lord of ${e.planetName}) is Neecham`); sc -= 2; slIssue = true; }
    const sL = planets.find(p => p.id === "sun")?.absoluteLong || 0;
    const dI = Math.min(Math.abs((slP.absoluteLong - sL + 360) % 360), 360 - Math.abs((slP.absoluteLong - sL + 360) % 360));
    const CO = { venus: 9, mercury: 13, mars: 17, jupiter: 11, saturn: 15 };
    if (CO[slP.id] && dI <= CO[slP.id] && slP.id !== "sun") { wr.push(`${slN} (star lord of ${e.planetName}) is Combust`); sc -= 2; slIssue = true; }
    const sB = getBhavaIndex(slP.absoluteLong, cusps);
    if (sB === 8 || sB === 12) { wr.push(`${slN} (star lord of ${e.planetName}) in H${sB}`); sc -= 2; slIssue = true; }
  }
  if (e.isCombust) { wr.push("3rd Lord is Combust"); sc -= 2; }
  if ((e.bhavaIdx === 8 || e.bhavaIdx === 12) && slIssue) { wr.push(`3rd Lord in H${e.bhavaIdx}`); sc -= 2; }
  let st = sc >= 0 ? "MEDIUM" : "WEAK";
  return [{ entity: e, evaluation: { status: st, score: sc, strongReasons: [], weakReasons: wr, guruAspect: false } }];
}

function computeStudyCheck(planets, cusps, ascLong) {
  const mercury = planets.find(p => p.name === "Mercury");
  if (!mercury) return [];
  const e = buildEntityFromPlanet("Budhan (Mercury)", mercury, cusps, planets);
  if (!e) return [];
  const wr = []; const sr = []; let sc = 0;
  const slN = C.STAR_TO_PLANET[e.starLord];
  const slP = planets.find(p => p.name === slN);
  if (slP) {
    const sB = getBhavaIndex(slP.absoluteLong, cusps);
    if (sB === 6 || sB === 8 || sB === 12) {
      wr.push(`${slN} (star lord of Mercury) in H${sB}`); sc -= 2;
    }
    const sC = C.PLANET_TO_LORD_MAP[slN];
    const sD = C.SIGN_DIGNITY[slP.signIndex];
    if (sD && sD.neecham === sC) {
      wr.push(`${slN} (star lord of Mercury) is Neecham`); sc -= 2;
    }
    const sL = planets.find(p => p.id === "sun")?.absoluteLong || 0;
    const dI = Math.min(Math.abs((slP.absoluteLong - sL + 360) % 360), 360 - Math.abs((slP.absoluteLong - sL + 360) % 360));
    const CO = { venus: 9, mercury: 13, mars: 17, jupiter: 11, saturn: 15 };
    if (CO[slP.id] && dI <= CO[slP.id] && slP.id !== "sun") {
      wr.push(`${slN} (star lord of Mercury) is Combust`); sc -= 2;
    }
  }
  if (wr.length === 0) {
    sr.push("Mercury's star lord — no afflictions, good for studies"); sc += 2;
  }
  let st = sc >= 0 ? "MEDIUM" : "WEAK";
  return [{ entity: e, evaluation: { status: st, score: sc, strongReasons: sr, weakReasons: wr, guruAspect: false } }];
}

function computeAshtakavarga(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const sourceOrder = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Lagna"];
  const targetNames = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
  const planetMap = {};
  planets.forEach(p => { planetMap[p.name] = p.signIndex; });
  planetMap.Lagna = aSI;

  const RULES = {
    Sun: {
      Sun: [1,2,4,7,8,9,10,11], Moon: [3,6,10,11], Mars: [1,2,4,7,8,9,10,11],
      Mercury: [3,5,6,9,10,11,12], Jupiter: [5,6,9,11], Venus: [6,7,12],
      Saturn: [1,2,4,7,8,9,10,11], Lagna: [3,4,6,10,11,12]
    },
    Moon: {
      Sun: [3,6,7,8,10,11], Moon: [1,3,6,7,10,11], Mars: [2,3,5,6,9,10,11],
      Mercury: [1,3,4,5,7,8,10,11], Jupiter: [1,4,7,8,10,11,12], Venus: [3,4,5,7,9,10,11],
      Saturn: [3,5,6,11], Lagna: [3,6,10,11]
    },
    Mars: {
      Sun: [3,5,6,10,11], Moon: [3,6,11], Mars: [1,2,4,7,8,10,11],
      Mercury: [3,5,6,11], Jupiter: [6,10,11,12], Venus: [6,8,11,12],
      Saturn: [1,4,7,8,9,10,11], Lagna: [1,3,6,10,11]
    },
    Mercury: {
      Sun: [5,6,9,11,12], Moon: [2,4,6,8,10,11], Mars: [1,2,4,7,8,9,10,11],
      Mercury: [1,3,5,6,9,10,11,12], Jupiter: [6,8,11,12], Venus: [1,2,3,4,5,8,9,11],
      Saturn: [1,2,4,7,8,9,10,11], Lagna: [1,2,4,6,8,10,11]
    },
    Jupiter: {
      Sun: [1,2,3,4,7,8,9,10,11], Moon: [2,5,7,9,11], Mars: [1,2,4,7,8,10,11],
      Mercury: [1,2,4,5,6,9,10,11], Jupiter: [1,2,3,4,7,8,10,11], Venus: [2,5,6,9,10,11],
      Saturn: [3,5,6,12], Lagna: [1,2,4,5,6,7,9,10,11]
    },
    Venus: {
      Sun: [8,11,12], Moon: [1,2,3,4,5,8,9,11,12], Mars: [3,5,6,9,11,12],
      Mercury: [3,5,6,9,11], Jupiter: [5,8,9,10,11], Venus: [1,2,3,4,5,8,9,10,11],
      Saturn: [3,4,5,8,9,10,11], Lagna: [1,2,3,4,5,8,9,11]
    },
    Saturn: {
      Sun: [1,2,4,7,8,10,11], Moon: [3,6,11], Mars: [3,5,6,10,11,12],
      Mercury: [6,8,9,10,11,12], Jupiter: [5,6,11,12], Venus: [6,11,12],
      Saturn: [3,5,6,11], Lagna: [1,3,4,6,10,11]
    },
    Lagna: {
      Sun: [3,4,6,10,11,12], Moon: [3,6,10,11,12], Mars: [1,3,6,10,11],
      Mercury: [1,2,4,6,8,10,11], Jupiter: [1,2,4,5,6,7,9,10,11],
      Venus: [1,2,3,4,5,8,9], Saturn: [1,3,4,6,10,11], Lagna: [3,6,10,11]
    }
  };

  const sarva = Array(12).fill(0);
  const chart = {};
  targetNames.forEach(target => {
    const row = Array(12).fill(0);
    const rules = RULES[target];
    sourceOrder.forEach(sourceName => {
      const sourceRasi = planetMap[sourceName];
      if (sourceRasi === undefined) return;
      rules[sourceName].forEach(h => {
        const idx = (sourceRasi + h - 1) % 12;
        row[idx]++;
      });
    });
    chart[target] = row;
    for (let i = 0; i < 12; i++) sarva[i] += row[i];
  });
  chart.Sarva = sarva;
  {
    const row = Array(12).fill(0);
    const rules = RULES["Lagna"];
    sourceOrder.forEach(sourceName => {
      const sourceRasi = sourceName === "Lagna" ? aSI : planetMap[sourceName];
      if (sourceRasi === undefined) return;
      rules[sourceName].forEach(h => {
        const idx = (sourceRasi + h - 1) % 12;
        row[idx]++;
      });
    });
    chart["Lagna"] = row;
  }
  return { chart };
}

function computeReligionCheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);
  const aSC = C.LORDS_ORDER[C.RASI_DOMINIONS[aSI]];
  const l5C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 4) % 12]];
  const l9C = C.LORDS_ORDER[C.RASI_DOMINIONS[(aSI + 8) % 12]];
  const ascStar = getStellarData(ascLong).starLord;
  const aLP = planets.find(p => p.name === C.STAR_TO_PLANET[aSC]);
  const ascLordStar = aLP ? getStellarData(aLP.absoluteLong).starLord : "";
  const l5P = planets.find(p => p.name === C.STAR_TO_PLANET[l5C]);
  const lord5Star = l5P ? getStellarData(l5P.absoluteLong).starLord : "";
  const l9P = planets.find(p => p.name === C.STAR_TO_PLANET[l9C]);
  const lord9Star = l9P ? getStellarData(l9P.absoluteLong).starLord : "";
  const items = [
    { label: "Asc Star", starLord: ascStar },
    { label: "Asc Lord Star", starLord: ascLordStar },
    { label: "5th Lord Star", starLord: lord5Star },
    { label: "9th Lord Star", starLord: lord9Star }
  ];
  const rahuCount = items.filter(i => i.starLord === "Rah").length;
  const ketuCount = items.filter(i => i.starLord === "Ket").length;
  let classification;
  if (rahuCount >= 3) classification = "North";
  else if (ketuCount >= 3) classification = "West";
  else classification = "South";
  return { classification, items, rahuCount, ketuCount };
}

function computeDNACheck(planets, cusps, ascLong) {
  const aSI = Math.floor(ascLong / 30);

  const ascNak = getStellarData(ascLong);
  const ascNakKarma = C.DNA_NAK_KARMA[ascNak.index];

  const rasiLordCode = C.LORDS_ORDER[C.RASI_DOMINIONS[aSI]];
  const rasiLordPlanet = planets.find(p => p.name === C.STAR_TO_PLANET[rasiLordCode]);

  let signLordKarma = null;
  let signLordNakName = null;
  let signLordName = null;
  if (rasiLordPlanet) {
    const slNak = getStellarData(rasiLordPlanet.absoluteLong);
    signLordKarma = C.DNA_NAK_KARMA[slNak.index];
    signLordNakName = slNak.nak.n;
    signLordName = rasiLordPlanet.name;
  }

  const rasiKarmas = C.DNA_RASI_KARMA[aSI] || [];

  const moonPlanet = planets.find(p => p.id === "moon");
  let moonStarKarma = null;
  let moonStarNakName = null;
  if (moonPlanet) {
    const mNak = getStellarData(moonPlanet.absoluteLong);
    moonStarKarma = C.DNA_NAK_KARMA[mNak.index];
    moonStarNakName = mNak.nak.n;
  }

  const ascPlanetKarma = {
    Sun: "Guru", Moon: "Guru", Mars: "Guru", Mercury: "Sani",
    Jupiter: "Rahu", Venus: "Moon", Saturn: "Mars", Rahu: "Moon", Ketu: "Surya"
  };

  const counts = {};
  Object.keys(C.DNA_KARMA_COLORS).forEach(k => counts[k] = 0);

  const entities = [];

  entities.push({
    label: "Asc Nakshatra",
    detail: ascNak.nak.n,
    karmas: [ascNakKarma]
  });
  counts[ascNakKarma]++;

  entities.push({
    label: "Sign Lord Star",
    detail: signLordKarma ? signLordName + " → " + signLordNakName : "—",
    karmas: signLordKarma ? [signLordKarma] : []
  });
  if (signLordKarma) counts[signLordKarma]++;

  entities.push({
    label: "Ascendant Rasi",
    detail: C.ZODIAC_NAMES[aSI].n,
    karmas: rasiKarmas
  });
  rasiKarmas.forEach(k => counts[k]++);

  entities.push({
    label: "Moon Star",
    detail: moonStarKarma ? moonStarNakName : "—",
    karmas: moonStarKarma ? [moonStarKarma] : []
  });
  if (moonStarKarma) counts[moonStarKarma]++;

  const planetsInAsc = planets.filter(p => p.id !== "mandi" && Math.floor(p.absoluteLong / 30) === aSI);
  if (planetsInAsc.length > 0) {
    planetsInAsc.forEach(p => {
      const k = ascPlanetKarma[p.name];
      if (k) {
        entities.push({ label: "Planet in Asc", detail: p.name, karmas: [k] });
        counts[k]++;
      }
    });
  } else {
    entities.push({ label: "Planet in Asc", detail: "—", karmas: [] });
  }

  let maxCount = 0, dominant = null, tie = false;
  Object.entries(counts).forEach(([k, v]) => {
    if (v > maxCount) { maxCount = v; dominant = k; tie = false; }
    else if (v === maxCount && v > 0) tie = true;
  });

  // ── 7th House DNA Matching ──
  const seventh = (ascLong + 180) % 360;
  const sSI = Math.floor(seventh / 30);

  const s7Nak = getStellarData(seventh);
  const s7NakKarma = C.DNA_NAK_KARMA[s7Nak.index];

  const s7LordCode = C.LORDS_ORDER[C.RASI_DOMINIONS[sSI]];
  const s7LordPlanet = planets.find(p => p.name === C.STAR_TO_PLANET[s7LordCode]);

  let s7LordKarma = null, s7LordNakName = null, s7LordName = null;
  if (s7LordPlanet) {
    const slNak = getStellarData(s7LordPlanet.absoluteLong);
    s7LordKarma = C.DNA_NAK_KARMA[slNak.index];
    s7LordNakName = slNak.nak.n;
    s7LordName = s7LordPlanet.name;
  }

  const s7RasiKarmas = C.DNA_RASI_KARMA[sSI] || [];

  const seventhCounts = {};
  Object.keys(C.DNA_KARMA_COLORS).forEach(k => seventhCounts[k] = 0);

  const seventhEntities = [];

  seventhEntities.push({
    label: "7th Place",
    detail: s7Nak.nak.n,
    karmas: [s7NakKarma]
  });
  seventhCounts[s7NakKarma]++;

  seventhEntities.push({
    label: "7th Lord Star",
    detail: s7LordKarma ? s7LordName + " → " + s7LordNakName : "—",
    karmas: s7LordKarma ? [s7LordKarma] : []
  });
  if (s7LordKarma) seventhCounts[s7LordKarma]++;

  seventhEntities.push({
    label: "7th Rasi",
    detail: C.ZODIAC_NAMES[sSI].n,
    karmas: s7RasiKarmas
  });
  s7RasiKarmas.forEach(k => seventhCounts[k]++);

  const planetsIn7th = planets.filter(p => p.id !== "mandi" && Math.floor(p.absoluteLong / 30) === sSI);
  if (planetsIn7th.length > 0) {
    planetsIn7th.forEach(p => {
      const k = ascPlanetKarma[p.name];
      if (k) {
        seventhEntities.push({ label: "7th Planet", detail: p.name, karmas: [k] });
        seventhCounts[k]++;
      }
    });
  } else {
    seventhEntities.push({ label: "7th Planet", detail: "—", karmas: [] });
  }

  seventhEntities.push({
    label: "7th Asc Point",
    detail: s7Nak.nak.n,
    karmas: [s7NakKarma]
  });
  seventhCounts[s7NakKarma]++;

  let s7MaxCount = 0, s7Dominant = null, s7Tie = false;
  Object.entries(seventhCounts).forEach(([k, v]) => {
    if (v > s7MaxCount) { s7MaxCount = v; s7Dominant = k; s7Tie = false; }
    else if (v === s7MaxCount && v > 0) s7Tie = true;
  });

  return {
    entities,
    counts,
    dominant: tie ? null : dominant,
    dominantLabel: dominant ? C.DNA_KARMA_LABELS[dominant] + " karma" : "Tie",
    isTie: tie,
    seventhEntities,
    seventhCounts,
    seventhDominant: s7Tie ? null : s7Dominant,
    seventhDominantLabel: s7Dominant ? C.DNA_KARMA_LABELS[s7Dominant] + " karma" : "Tie",
    seventhIsTie: s7Tie
  };
}
