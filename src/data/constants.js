export const ZODIAC_NAMES = [
  { s: "♈", n: "Mesha" }, { s: "♉", n: "Rishabha" }, { s: "♊", n: "Mithuna" }, { s: "♋", n: "Kataka" },
  { s: "♌", n: "Simha" }, { s: "♍", n: "Kanya" }, { s: "♎", n: "Tula" }, { s: "♏", n: "Vrishchika" },
  { s: "♐", n: "Dhanus" }, { s: "♑", n: "Makara" }, { s: "♒", n: "Kumbha" }, { s: "♓", n: "Meena" }
];

export const PLANET_DEFS = [
  { id: "sun", n: "Sun" }, { id: "moon", n: "Moon" }, { id: "mars", n: "Mars" },
  { id: "mercury", n: "Mercury" }, { id: "jupiter", n: "Jupiter" },
  { id: "venus", n: "Venus" }, { id: "saturn", n: "Saturn" },
  { id: "rahu", n: "Rahu" }, { id: "ketu", n: "Ketu" }
];

export const LORDS_ORDER = ["Ket", "Ven", "Sun", "Moo", "Mar", "Rah", "Jup", "Sat", "Mer"];
export const LORD_TAMIL = { Ket: "Ketu", Ven: "Sukkiran", Sun: "Suryan", Moo: "Chandran", Mar: "Sevvaai", Rah: "Rahu", Jup: "Guru", Sat: "Sani", Mer: "Budhan" };
export const STAR_TO_PLANET = { Ket: "Ketu", Ven: "Venus", Sun: "Sun", Moo: "Moon", Mar: "Mars", Rah: "Rahu", Jup: "Jupiter", Sat: "Saturn", Mer: "Mercury" };
export const PLANET_TO_LORD_MAP = { Sun: "Sun", Moon: "Moo", Mars: "Mar", Mercury: "Mer", Jupiter: "Jup", Venus: "Ven", Saturn: "Sat", Rahu: "Rah", Ketu: "Ket", Mandi: "Mand" };
export const RASI_DOMINIONS = [4, 1, 8, 3, 2, 8, 1, 4, 6, 7, 7, 6];
export const PAVAGRAHAS = ["Mar", "Sun", "Rah", "Ket", "Sat"];
export const PAVAGRAHA_TARGETS = ["Asc Lord", "Asc Star Lord", "Asc Lord Starlord", "Moon", "Moon Star Lord", "5th Lord", "5th Lord Star Ld", "7th Lord", "7th Lord Star Ld", "Venus", "Venus Star Ld", "2nd Lord", "2nd Lord Star Ld", "11th Lord", "11th Lord Star Ld"];
export const PATHAGAM_TARGETS = ["7th Lord", "7th Lord Star Ld", "Venus", "Venus Star Ld", "11th Lord", "11th Lord Star Ld"];
export const MARRIAGE_PATHAGAM_2ND = ["2nd Lord", "2nd Lord Star Ld"];
export const KENDRAATHIPATHIYA_PLANETS = ["Mercury", "Venus", "Jupiter", "Moon"];

export const ENEMY_MAP = {
  Sun: ["Sat", "Ven", "Rah"], Moo: ["Sat", "Ven", "Rah", "Ket"], Mar: ["Rah", "Sat", "Mer"],
  Rah: ["Mar", "Sun", "Moo"], Jup: ["Ven", "Moo", "Mer", "Ket"], Sat: ["Sun", "Mar", "Moo", "Ket"],
  Mer: ["Jup", "Moo", "Mar"], Ket: ["Sat", "Moo", "Ven"], Ven: ["Sun", "Jup", "Moo", "Ket"]
};

export const NAKSHATRAS = [
  { n: "Ashwini", s: 0, l: "Ket" }, { n: "Bharani", s: 13.3333, l: "Ven" }, { n: "Krittika", s: 26.6667, l: "Sun" },
  { n: "Rohini", s: 40, l: "Moo" }, { n: "Mrigashira", s: 53.3333, l: "Mar" }, { n: "Ardra", s: 66.6667, l: "Rah" },
  { n: "Punarvasu", s: 80, l: "Jup" }, { n: "Pushya", s: 93.3333, l: "Sat" }, { n: "Ashlesha", s: 106.6667, l: "Mer" },
  { n: "Magha", s: 120, l: "Ket" }, { n: "Purva Phalguni", s: 133.3333, l: "Ven" }, { n: "Uttara Phalguni", s: 146.6667, l: "Sun" },
  { n: "Hasta", s: 160, l: "Moo" }, { n: "Chitra", s: 173.3333, l: "Mar" }, { n: "Swati", s: 186.6667, l: "Rah" },
  { n: "Vishakha", s: 200, l: "Jup" }, { n: "Anuradha", s: 213.3333, l: "Sat" }, { n: "Jyeshtha", s: 226.6667, l: "Mer" },
  { n: "Mula", s: 240, l: "Ket" }, { n: "Purva Ashadha", s: 253.3333, l: "Ven" }, { n: "Uttara Ashadha", s: 266.6667, l: "Sun" },
  { n: "Shravana", s: 280, l: "Moo" }, { n: "Dhanishta", s: 293.3333, l: "Mar" }, { n: "Shatabhisha", s: 306.6667, l: "Rah" },
  { n: "Purva Bhadrapada", s: 320, l: "Jup" }, { n: "Uttara Bhadrapada", s: 333.3333, l: "Sat" }, { n: "Revati", s: 346.6667, l: "Mer" }
];

export const PLANET_COLORS = { Sun: "#FF6B00", Moon: "#999999", Mars: "#FF3333", Mercury: "#33CC33", Jupiter: "#E5A600", Venus: "#C93A6B", Saturn: "#6666CC", Rahu: "#9933FF", Ketu: "#CC6600", Mandi: "#8B2252" };
export const DASHA_YEARS_MAP = { Ket: 7, Ven: 20, Sun: 6, Moo: 10, Mar: 7, Rah: 18, Jup: 16, Sat: 19, Mer: 17 };
export const LORD_TO_ID = { Ket: "ketu", Ven: "venus", Sun: "sun", Moo: "moon", Mar: "mars", Rah: "rahu", Jup: "jupiter", Sat: "saturn", Mer: "mercury" };
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
export const GRID_COORDS = [[11, 0, 1, 2], [10, -1, -1, 3], [9, -1, -1, 4], [8, 7, 6, 5]];
export const BASELINE_AYANAMSAS = { kp: 23.74, lahiri: 23.93, raman: 22.76 };
export const TAMIL_SIGNS = ["Mesham", "Rishabham", "Mithunam", "Kadakam", "Simmam", "Kanni", "Thulam", "Viruchigam", "Dhanusu", "Magaram", "Kumbam", "Meenam"];

export const SIGN_DIGNITY = [
  { ucham: "Sun", neecham: "Sat", aatshi: ["Mar"], pagai: [], natpu: ["Jup"], samam: ["Ven", "Mer", "Moo"] },
  { ucham: "Moo", neecham: "", aatshi: ["Ven"], pagai: ["Jup", "Sun"], natpu: ["Sat", "Mer"], samam: ["Mar"] },
  { ucham: "", neecham: "", aatshi: ["Mer"], pagai: ["Jup", "Mar"], natpu: ["Ven", "Sat", "Moo"], samam: ["Sun"] },
  { ucham: "Jup", neecham: "Mar", aatshi: ["Moo"], pagai: ["Mer", "Ven", "Sat"], natpu: ["Sun"], samam: [] },
  { ucham: "", neecham: "", aatshi: ["Sun"], pagai: ["Ven", "Sat"], natpu: ["Moo", "Mar", "Mer", "Jup"], samam: [] },
  { ucham: "Mer", neecham: "Ven", aatshi: ["Mer"], pagai: ["Jup", "Mar"], natpu: ["Moo", "Sat"], samam: ["Sun"] },
  { ucham: "Sat", neecham: "Sun", aatshi: ["Ven"], pagai: ["Jup"], natpu: ["Mer"], samam: ["Moo", "Mar"] },
  { ucham: "", neecham: "Moo", aatshi: ["Mar"], pagai: ["Sat"], natpu: ["Sun", "Jup"], samam: ["Mer", "Ven"] },
  { ucham: "", neecham: "", aatshi: ["Jup"], pagai: [], natpu: ["Sun", "Mar"], samam: ["Moo", "Mer", "Ven", "Sat"] },
  { ucham: "Mar", neecham: "Jup", aatshi: ["Sat"], pagai: ["Sun"], natpu: ["Ven"], samam: ["Mer", "Moo"] },
  { ucham: "", neecham: "", aatshi: ["Sat"], pagai: ["Sun"], natpu: ["Ven"], samam: ["Moo", "Mer", "Mar", "Jup"] },
  { ucham: "Ven", neecham: "Mer", aatshi: ["Jup"], pagai: [], natpu: ["Sun", "Mar"], samam: ["Moo", "Ven", "Sat"] }
];

export const ENGINE_BODIES = {
  sun: Astronomy.Body.Sun, moon: Astronomy.Body.Moon, mars: Astronomy.Body.Mars,
  mercury: Astronomy.Body.Mercury, jupiter: Astronomy.Body.Jupiter,
  venus: Astronomy.Body.Venus, saturn: Astronomy.Body.Saturn
};

export const VAARA_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const VAARA_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export const THITHI_BASE = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"];
export const PAKSHA = ["Shukla", "Krishna"];
export const YOGA_NAMES = ["Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
export const KARANA_NAMES = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kinstughna"];

export const THITHI_SOONYA = [
  { signs: [9, 6], grahas: ["Saturn", "Venus"] }, { signs: [8, 11], grahas: ["Jupiter"] }, { signs: [9, 4], grahas: ["Saturn", "Sun"] },
  { signs: [10, 1], grahas: ["Saturn", "Venus"] }, { signs: [2, 5], grahas: ["Mercury"] }, { signs: [0, 4], grahas: ["Mars", "Sun"] },
  { signs: [8, 3], grahas: ["Jupiter", "Moon"] }, { signs: [2, 5], grahas: ["Mercury"] }, { signs: [4, 7], grahas: ["Sun", "Mars"] },
  { signs: [4, 7], grahas: ["Sun", "Mars"] }, { signs: [8, 11], grahas: ["Jupiter"] }, { signs: [9, 6], grahas: ["Saturn", "Venus"] },
  { signs: [1, 4], grahas: ["Venus", "Sun"] }, { signs: [2, 5, 8, 11], grahas: ["Mercury", "Jupiter"] }, { signs: [], grahas: [] }
];

export const EDGE_RULES = [
  { sign: 11, start: 29, end: 30, label: "Meenam End" }, { sign: 0, start: 0, end: 1, label: "Mesha Start" },
  { sign: 3, start: 29, end: 30, label: "Kataka End" }, { sign: 4, start: 0, end: 1, label: "Simha Start" },
  { sign: 7, start: 29, end: 30, label: "Vrishchika End" }, { sign: 8, start: 0, end: 1, label: "Dhanus Start" }
];

export const MIRUTHIVI_PAGAI = [
  { nak: 1, pada: 2 }, { nak: 1, pada: 4 }, { nak: 4, pada: 4 }, { nak: 5, pada: 2 }, { nak: 8, pada: 3 },
  { nak: 10, pada: 2 }, { nak: 9, pada: 2 }, { nak: 11, pada: 3 }, { nak: 14, pada: 4 }, { nak: 15, pada: 2 },
  { nak: 18, pada: 2 }, { nak: 18, pada: 4 }, { nak: 19, pada: 2 }, { nak: 21, pada: 3 }, { nak: 23, pada: 3 },
  { nak: 25, pada: 3 }, { nak: 26, pada: 4 }
];

export const PUSHKAR_NAVAMSAM = [
  { lord: "Venus", entries: [{ nak: 1, pada: 3 }, { nak: 10, pada: 3 }, { nak: 19, pada: 3 }] },
  { lord: "Sun", entries: [{ nak: 2, pada: 1 }, { nak: 2, pada: 4 }, { nak: 11, pada: 1 }, { nak: 11, pada: 4 }, { nak: 20, pada: 1 }, { nak: 20, pada: 4 }] },
  { lord: "Moon", entries: [{ nak: 3, pada: 2 }, { nak: 12, pada: 2 }, { nak: 21, pada: 2 }] },
  { lord: "Rahu", entries: [{ nak: 5, pada: 4 }, { nak: 14, pada: 4 }, { nak: 23, pada: 4 }] },
  { lord: "Jupiter", entries: [{ nak: 6, pada: 2 }, { nak: 6, pada: 4 }, { nak: 15, pada: 2 }, { nak: 15, pada: 4 }, { nak: 24, pada: 2 }, { nak: 24, pada: 4 }] },
  { lord: "Saturn", entries: [{ nak: 7, pada: 2 }, { nak: 16, pada: 2 }, { nak: 25, pada: 3 }] }
];

export const DAYTIME_SATURN_PART = [7, 6, 5, 4, 3, 2, 1];
export const NIGHTTIME_SATURN_PART = [3, 2, 1, 7, 6, 5, 4];
