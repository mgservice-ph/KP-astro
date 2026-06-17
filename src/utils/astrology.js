import * as C from "../data/constants";

export function formatArcMinutes(deg) {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}'`;
}

export function getStellarData(longitude) {
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
  const relativePos = (longitude - matchingNak.s + 360) % 360;
  const pada = Math.min(Math.floor(relativePos / (13.33333 / 4)), 3) + 1;
  const baseLordIndex = C.LORDS_ORDER.indexOf(matchingNak.l);
  const subLordIndex = (baseLordIndex + Math.min(Math.floor(relativePos / (13.33333 / 9)), 8)) % 9;
  return {
    nak: matchingNak, index: nakIndex, pada, starLord: matchingNak.l,
    starLordTamil: C.LORD_TAMIL[matchingNak.l] || matchingNak.l,
    subLord: C.LORDS_ORDER[subLordIndex]
  };
}

export function calculateNavamshaSign(longitude) {
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

export function getBhavaIndex(pLong, computedCusps) {
  for (let i = 1; i <= 12; i++) {
    const currentCusp = computedCusps[i];
    const nextCusp = computedCusps[i === 12 ? 1 : i + 1];
    if (nextCusp > currentCusp) {
      if (pLong >= currentCusp && pLong < nextCusp) return i;
    } else {
      if (pLong >= currentCusp || pLong < nextCusp) return i;
    }
  }
  return 1;
}

export function computeVaara(jd) {
  return C.VAARA_NAMES[Math.floor(jd + 1.5) % 7];
}

export function computeThithi(sunLong, moonLong) {
  const diff = ((moonLong - sunLong) % 360 + 360) % 360;
  const index = Math.floor(diff / 12);
  const paksha = index < 15 ? 0 : 1;
  const baseIndex = index % 15;
  const displayName = baseIndex === 14
    ? (paksha === 0 ? "Valarpirai Pournami" : "Theypirai Amavasai")
    : `${C.PAKSHA[paksha]} ${C.THITHI_BASE[baseIndex]}`;
  return { index, name: displayName, paksha };
}

export function computeYoga(sunLong, moonLong) {
  const sum = (sunLong + moonLong) % 360;
  const index = Math.floor(sum / 13.333333333333334) % 27;
  return { index, name: C.YOGA_NAMES[index] };
}

export function computeKarana(sunLong, moonLong) {
  const diff = ((moonLong - sunLong) % 360 + 360) % 360;
  const halfTithi = Math.floor(diff / 6);
  let name;
  if (halfTithi === 0) name = C.KARANA_NAMES[10];
  else if (halfTithi >= 1 && halfTithi <= 56) name = C.KARANA_NAMES[(halfTithi - 1) % 7];
  else if (halfTithi === 57) name = C.KARANA_NAMES[7];
  else if (halfTithi === 58) name = C.KARANA_NAMES[8];
  else name = C.KARANA_NAMES[9];
  return { index: halfTithi, name };
}

export function computeThithiSoonya(tithiIndex) {
  const modIndex = tithiIndex % 15;
  return C.THITHI_SOONYA[modIndex];
}

export function calculateMandi(birthDate, lat, lng, ayanamsaOffset) {
  const observer = new Astronomy.Observer(lat, lng, 0);
  const utcMidnight = new Date(Date.UTC(
    birthDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate(), 0, 0, 0
  ));
  const nextUtcMidnight = new Date(utcMidnight.getTime() + 86400000);

  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, utcMidnight, 2);
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, utcMidnight, 2);
  const nextRise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, nextUtcMidnight, 2);

  let sunriseDate, sunsetDate, nextSunriseDate;
  if (rise && set) {
    sunriseDate = rise.date || rise;
    sunsetDate = set.date || set;
    nextSunriseDate = nextRise ? (nextRise.date || nextRise) : new Date(sunriseDate.getTime() + 86400000);
  } else {
    sunriseDate = new Date(birthDate);
    sunriseDate.setHours(6, 0, 0, 0);
    sunsetDate = new Date(birthDate);
    sunsetDate.setHours(18, 0, 0, 0);
    nextSunriseDate = new Date(sunriseDate.getTime() + 86400000);
  }

  const dayDuration = sunsetDate.getTime() - sunriseDate.getTime();
  const nightDuration = nextSunriseDate.getTime() - sunsetDate.getTime();
  const isDaytime = birthDate.getTime() >= sunriseDate.getTime() && birthDate.getTime() < sunsetDate.getTime();
  const jd = Astronomy.MakeTime(birthDate).ut + 2451545.0;
  const dayOfWeek = ((Math.floor(jd + 1.5) % 7) + 7) % 7;
  const mandiPart = isDaytime ? C.DAYTIME_SATURN_PART[dayOfWeek] : C.NIGHTTIME_SATURN_PART[dayOfWeek];
  const periodStart = isDaytime ? sunriseDate : sunsetDate;
  const periodDuration = isDaytime ? dayDuration : nightDuration;
  const partDuration = periodDuration / 8;
  const mandiTime = new Date(periodStart.getTime() + (mandiPart - 1) * partDuration);

  return computeAscendantAtTime(mandiTime, lat, lng, ayanamsaOffset);
}

export function calculateMandiEx(birthDate, lat, lng, ayanamsaOffset, mode, offsetType) {
  const observer = new Astronomy.Observer(lat, lng, 0);
  const utcMidnight = new Date(Date.UTC(
    birthDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate(), 0, 0, 0
  ));
  const nextUtcMidnight = new Date(utcMidnight.getTime() + 86400000);

  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, utcMidnight, 2);
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, utcMidnight, 2);
  const nextRise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, nextUtcMidnight, 2);

  let sunriseDate, sunsetDate, nextSunriseDate;
  if (rise && set) {
    sunriseDate = rise.date || rise;
    sunsetDate = set.date || set;
    nextSunriseDate = nextRise ? (nextRise.date || nextRise) : new Date(sunriseDate.getTime() + 86400000);
  } else {
    sunriseDate = new Date(birthDate);
    sunriseDate.setHours(6, 0, 0, 0);
    sunsetDate = new Date(birthDate);
    sunsetDate.setHours(18, 0, 0, 0);
    nextSunriseDate = new Date(sunriseDate.getTime() + 86400000);
  }

  const dayDuration = sunsetDate.getTime() - sunriseDate.getTime();
  const nightDuration = nextSunriseDate.getTime() - sunsetDate.getTime();
  const isDaytime = birthDate.getTime() >= sunriseDate.getTime() && birthDate.getTime() < sunsetDate.getTime();
  const jd = Astronomy.MakeTime(birthDate).ut + 2451545.0;
  const dayOfWeek = ((Math.floor(jd + 1.5) % 7) + 7) % 7;

  const useEighth = mode === "eighth";
  const mandiPart = useEighth
    ? (isDaytime ? C.DAYTIME_EIGHTH_PART[dayOfWeek] : C.NIGHTTIME_EIGHTH_PART[dayOfWeek])
    : (isDaytime ? C.DAYTIME_SATURN_PART[dayOfWeek] : C.NIGHTTIME_SATURN_PART[dayOfWeek]);
  const periodStart = isDaytime ? sunriseDate : sunsetDate;
  const periodDuration = isDaytime ? dayDuration : nightDuration;
  const partDuration = periodDuration / 8;

  let offsetMs;
  if (offsetType === "middle") offsetMs = partDuration / 2;
  else if (offsetType === "end") offsetMs = partDuration;
  else offsetMs = 0;

  const mandiTime = new Date(periodStart.getTime() + (mandiPart - 1) * partDuration + offsetMs);

  return computeAscendantAtTime(mandiTime, lat, lng, ayanamsaOffset);
}

export function computeAscendantAtTime(targetDate, lat, lng, ayanamsaOffset) {
  const astroTime = Astronomy.MakeTime(targetDate);
  const jd = astroTime.ut + 2451545.0;
  const obliquityRad = (23.439291 - 0.0130042 * ((jd - 2451545.0) / 36525)) * Math.PI / 180;
  const siderealHours = Astronomy.SiderealTime(targetDate);
  const localSiderealDeg = ((siderealHours * 15 + lng) % 360 + 360) % 360;
  const latRad = lat * Math.PI / 180;
  const lmstRad = localSiderealDeg * Math.PI / 180;
  let ascValue = Math.atan2(-Math.cos(lmstRad),
    Math.sin(obliquityRad) * Math.tan(latRad) + Math.cos(obliquityRad) * Math.sin(lmstRad)) * 180 / Math.PI;
  ascValue = (ascValue + 180 + 360) % 360;
  return ((ascValue - ayanamsaOffset) % 360 + 360) % 360;
}

export function computePlacidusSystem(ascSid, mcSid, latitude) {
  const cusps = new Array(13).fill(0);
  cusps[1] = ascSid;
  cusps[10] = mcSid;
  const h10_to_h1 = (ascSid - mcSid + 360) % 360;
  const semiDiurnal = h10_to_h1 / 3;
  const semiNocturnal = (180 - h10_to_h1) / 3;
  cusps[11] = (mcSid + semiDiurnal) % 360;
  cusps[12] = (mcSid + 2 * semiDiurnal) % 360;
  cusps[2] = (ascSid + semiNocturnal) % 360;
  cusps[3] = (ascSid + 2 * semiNocturnal) % 360;
  cusps[7] = (cusps[1] + 180) % 360;
  cusps[8] = (cusps[2] + 180) % 360;
  cusps[9] = (cusps[3] + 180) % 360;
  cusps[4] = (cusps[10] + 180) % 360;
  cusps[5] = (cusps[11] + 180) % 360;
  cusps[6] = (cusps[12] + 180) % 360;
  return cusps;
}

export function checkDignityForEntity(planetName, signIdx) {
  const pLord = C.PLANET_TO_LORD_MAP[planetName];
  const isRahuKetu = planetName === "Rahu" || planetName === "Ketu";
  const sD = isRahuKetu
    ? { aatshi: [], ucham: "", neecham: "", pagai: ["Mar", "Sun", "Moo"], natpu: ["Sat", "Mer", "Ven", "Jup"], samam: [] }
    : C.SIGN_DIGNITY[signIdx];
  return {
    isUcham: sD.ucham === pLord, isNeecham: sD.neecham === pLord,
    isAatchi: sD.aatshi.includes(pLord), isPagai: sD.pagai.includes(pLord),
    isNatpu: sD.natpu.includes(pLord), isSamam: sD.samam.includes(pLord),
    ucham: sD.ucham, neecham: sD.neecham,
    aatchi: sD.aatshi.join(","), pagai: sD.pagai.join(","),
    natpu: sD.natpu.join(","), samam: sD.samam.join(",")
  };
}

export function checkEdgeIssue(signIdx, signDeg) {
  for (const r of C.EDGE_RULES) {
    if (signIdx === r.sign && signDeg >= r.start && signDeg <= r.end) {
      return { hasIssue: true, label: `${r.label} (${signDeg.toFixed(1)}°)` };
    }
  }
  return { hasIssue: false, label: "" };
}

export function checkMiruthiviPagai(nakIdx, pada) {
  for (const m of C.MIRUTHIVI_PAGAI) {
    if (m.nak === nakIdx && m.pada === pada) {
      return { isAffected: true, label: `${C.NAKSHATRAS[nakIdx].n} Pada ${pada}` };
    }
  }
  return { isAffected: false, label: "" };
}

export function checkVarkothaam(longitude) {
  const d9Sign = calculateNavamshaSign(longitude);
  const d1Sign = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return { isMatch: d1Sign === d9Sign, d1Sign, d9Sign };
}

export function checkPushkarNavamsam(nakIdx, pada) {
  for (const pn of C.PUSHKAR_NAVAMSAM) {
    for (const e of pn.entries) {
      if (e.nak === nakIdx && e.pada === pada) {
        return { isPushkar: true, lord: pn.lord };
      }
    }
  }
  return { isPushkar: false, lord: "" };
}

export function getLordPlanet(lordCode, computedPlanets) {
  const name = C.STAR_TO_PLANET[lordCode];
  return computedPlanets.find(p => p.name === name);
}

export function checkGuruAspect(entityBhava, entityLabel, computedPlanets, computedCusps) {
  const jupiter = computedPlanets.find(p => p.id === "jupiter");
  if (!jupiter) return { hasAspect: false, reason: "" };
  const jupBhava = getBhavaIndex(jupiter.absoluteLong, computedCusps);
  const aspectHouses = [
    ((jupBhava + 3) % 12) + 1, ((jupBhava + 5) % 12) + 1, ((jupBhava + 7) % 12) + 1
  ];
  if (aspectHouses.includes(entityBhava)) {
    return { hasAspect: true, reason: `Jupiter from H${jupBhava} aspects H${entityBhava}` };
  }
  if ((entityLabel && entityLabel.includes("Lagna")) || (entityLabel && entityLabel.includes("Asc"))) {
    if (aspectHouses.includes(1)) {
      return { hasAspect: true, reason: `Jupiter from H${jupBhava} aspects Lagna H1` };
    }
  }
  if (entityLabel && entityLabel.includes("Moon")) {
    const moonData = computedPlanets.find(p => p.id === "moon");
    if (moonData) {
      const moonBhava = getBhavaIndex(moonData.absoluteLong, computedCusps);
      if (aspectHouses.includes(moonBhava)) {
        return { hasAspect: true, reason: `Jupiter from H${jupBhava} aspects Moon H${moonBhava}` };
      }
    }
  }
  return { hasAspect: false, reason: "" };
}

export function checkPavagraha68Rule(entity, computedPlanets, computedCusps) {
  const entityCode = C.PLANET_TO_LORD_MAP[entity.planetName];
  const bhava6 = ((entity.bhavaIdx + 4) % 12) + 1;
  const bhava8 = ((entity.bhavaIdx + 6) % 12) + 1;
  const targetBhavas = [bhava6, bhava8];
  const planetsIn68 = computedPlanets.filter(p => targetBhavas.includes(getBhavaIndex(p.absoluteLong, computedCusps)));
  const hasPavagrahaIn68 = planetsIn68.some(p => C.PAVAGRAHAS.includes(C.PLANET_TO_LORD_MAP[p.name]));
  let enemyStarLordFound = false;
  if (entityCode) {
    const enemyCodes = C.ENEMY_MAP[entityCode] || [];
    for (const p of planetsIn68) {
      const st = getStellarData(p.absoluteLong);
      if (enemyCodes.includes(st.starLord)) {
        enemyStarLordFound = true;
        break;
      }
    }
  }
  return { hasPavagrahaIn68, enemyStarLordFound };
}

export function checkPathagamDusthanaRule(entity, computedCusps, computedPlanets) {
  const ascSignIdx = Math.floor(entity.ascendantAbsoluteLong / 30);
  const sara = [0, 3, 6, 9], ishtra = [1, 4, 7, 10];
  let pathagamHouse;
  if (sara.includes(ascSignIdx)) pathagamHouse = 11;
  else if (ishtra.includes(ascSignIdx)) pathagamHouse = 9;
  else pathagamHouse = 7;

  const pathagamCusp = computedCusps[pathagamHouse];
  const pathagamSignIdx = Math.floor(pathagamCusp / 30);
  const pathagamSignLordCode = C.LORDS_ORDER[C.RASI_DOMINIONS[pathagamSignIdx]];
  const pathagamLordPlanet = getLordPlanet(pathagamSignLordCode, computedPlanets);
  const pathagamLordStarCode = pathagamLordPlanet ? getStellarData(pathagamLordPlanet.absoluteLong).starLord : "";
  const pathagamLordStarPlanet = getLordPlanet(pathagamLordStarCode, computedPlanets);

  const entityPlanet = computedPlanets.find(p => p.name === entity.planetName);
  const entityStarLordPlanet = getLordPlanet(entity.starLord, computedPlanets);
  const entityBhava = entity.bhavaIdx;
  const entitySignIdx = entity.signIdx;

  const reasons = [];
  if ([6, 8, 12].includes(entityBhava)) reasons.push(`Planet in dusthana H${entityBhava}`);
  if (entityStarLordPlanet) {
    const slBhava = getBhavaIndex(entityStarLordPlanet.absoluteLong, computedCusps);
    if ([6, 8, 12].includes(slBhava)) reasons.push(`Star lord planet in dusthana H${slBhava}`);
  }
  if (entitySignIdx === pathagamSignIdx) reasons.push("Planet in Pathagam sign");
  if (entityStarLordPlanet) {
    const slSignIdx = Math.floor(entityStarLordPlanet.absoluteLong / 30);
    if (slSignIdx === pathagamSignIdx) reasons.push("Star lord planet in Pathagam sign");
  }
  if (pathagamLordPlanet) {
    const psLordSignIdx = Math.floor(pathagamLordPlanet.absoluteLong / 30);
    if (psLordSignIdx === entitySignIdx) reasons.push("Conjoined with Pathagam sign lord");
  }
  if (pathagamLordStarPlanet) {
    const psLordStarSignIdx = Math.floor(pathagamLordStarPlanet.absoluteLong / 30);
    if (psLordStarSignIdx === entitySignIdx) reasons.push("Conjoined with Pathagam sign lord's star lord");
  }

  return { hasIssue: reasons.length > 0, reasons };
}

export function buildEntity(label, lordCode, computedPlanets, computedCusps, ascendantAbsoluteLong) {
  const planet = getLordPlanet(lordCode, computedPlanets);
  if (!planet) return null;
  const long = planet.absoluteLong;
  const signIdx = planet.signIndex;
  const signDeg = planet.signDeg;
  const bhavaIdx = getBhavaIndex(long, computedCusps);
  const st = getStellarData(long);
  const dig = checkDignityForEntity(planet.name, signIdx);
  const sunLong = computedPlanets.find(p => p.id === "sun")?.absoluteLong || 0;
  const diff = Math.min(Math.abs((long - sunLong + 360) % 360), 360 - Math.abs((long - sunLong + 360) % 360));
  const COMBUST_ORBS_LOCAL = { venus: 9, mercury: 13, mars: 17, jupiter: 11, saturn: 15 };
  const isCombust = COMBUST_ORBS_LOCAL[planet.id] && diff <= COMBUST_ORBS_LOCAL[planet.id] && planet.id !== "sun";
  return {
    label, planetName: planet.name, planetId: planet.id,
    planetColor: C.PLANET_COLORS[planet.name],
    absoluteLong: long, signIdx, signDeg, bhavaIdx,
    nakIdx: st.index, pada: st.pada, starLord: st.starLord, subLord: st.subLord, nakName: st.nak.n,
    dignity: dig, isCombust, isGrahana: planet.isGrahana || false, isTrikona: planet.isTrikona || false,
    isRetro: planet.isRetro || false
  };
}

export function buildEntityFromPlanet(label, planet, computedCusps, computedPlanets) {
  if (!planet) return null;
  const long = planet.absoluteLong;
  const signIdx = planet.signIndex;
  const signDeg = planet.signDeg;
  const bhavaIdx = getBhavaIndex(long, computedCusps);
  const st = getStellarData(long);
  const dig = checkDignityForEntity(planet.name, signIdx);
  const sunLong = (computedPlanets || []).find(p => p.id === "sun")?.absoluteLong || 0;
  const diff = Math.min(Math.abs((long - sunLong + 360) % 360), 360 - Math.abs((long - sunLong + 360) % 360));
  const COMBUST_ORBS_LOCAL = { venus: 9, mercury: 13, mars: 17, jupiter: 11, saturn: 15 };
  const isCombust = COMBUST_ORBS_LOCAL[planet.id] && diff <= COMBUST_ORBS_LOCAL[planet.id] && planet.id !== "sun";
  return {
    label, planetName: planet.name, planetId: planet.id,
    planetColor: C.PLANET_COLORS[planet.name],
    absoluteLong: long, signIdx, signDeg, bhavaIdx,
    nakIdx: st.index, pada: st.pada, starLord: st.starLord, subLord: st.subLord, nakName: st.nak.n,
    dignity: dig, isCombust, isGrahana: planet.isGrahana || false, isTrikona: planet.isTrikona || false,
    isRetro: planet.isRetro || false
  };
}

export function checkHouseCategory(bhava) {
  return {
    isKendra: [1, 4, 7, 10].includes(bhava),
    isTrikona: [1, 5, 9].includes(bhava),
    isDusthana: [6, 8, 12].includes(bhava)
  };
}
