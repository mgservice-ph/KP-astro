# KP Astrology — South Indian Chart

> A standalone HTML application that computes KP (Krishnamurti Paddhati) birth charts using real ephemeris from the astronomy-engine library. Single-file, no build step, works offline.

---

## Verified Chart: June 14, 2026 — Bengaluru

**Birth Data:** 14 Jun 2026, 12:49:31 IST (07:19:31 UT)
**Location:** Bengaluru, Karnataka, India (12.97°N, 77.59°E)

### Computed Values

| Item | Value |
|---|---|
| KP Ayanamsa | 23.98° (precession-corrected) |
| Ascendant (Lagna) | 6°06' Virgo |
| Moon Nakshatra | Rohini (lord Moon) |
| Balance MD | Moon — 4y 3m 21d remaining |
| Current (Jun 2026) | Moon-Moon Antardasha |

### Planet Positions (Sidereal, KP Ayanamsa)

| Graha | Longitude | Sign | House |
|---|---|---|---|
| Sun | 29°17' | Taurus | 9 |
| Moon | 17°35' | Taurus | 9 |
| Mercury | 23°42' | Gemini | 10 |
| Venus | 7°01' | Cancer | 11 |
| Mars | 25°33' | Aries | 8 |
| Jupiter | 2°41' | Cancer | 11 |
| Saturn | 19°16' | Pisces | 7 |
| Rahu | 9°29' | Aquarius | 6 |
| Ketu | 9°29' | Leo | 12 |

---

## Bugs Found & Fixed

### Bug 1 — `time.ut` is J2000-offset, not full JD

`Astronomy.MakeTime().ut` returns days since J2000 epoch (JD − 2451545), not the full Julian Day. Every formula using `jd` — ayanamsa, obliquity, Rahu/Ketu nodes — was computing with a value 2451545 days too small.

**Fix:** `const jd = time.ut + 2451545.0`

### Bug 2 — Ascendant Formula Off by 180°

The standard ascendant formula `atan2(-cos(RAMC), sin(ε)·tan(φ) + cos(ε)·sin(RAMC))` returns the ecliptic longitude of the eastern horizon, but the raw `atan2` output is in the range [−π, π]. Adding 360° (our original code) gave the wrong quadrant — the ascendant was flipped to the opposite sign for all latitudes/times.

**Fix:** `asc = (asc * 180 / Math.PI + 180 + 360) % 360`

### Bug 3 — Fixed Ayanamsa (Precession Ignored)

The ayanamsa was returned as a constant (22°55' for KP). This made sidereal positions ~1° off for current dates, potentially pushing planets across Nakshatra boundaries — causing wrong Moon Nakshatra and wrong Dasha start lord.

**Fix:** `baseVal + rate × (year − 1950)` where `rate = 50.2388475″/year`

### Bug 4 — `GeoVector` Missing 3rd Parameter

`Astronomy.GeoVector(body, date, aberration)` requires exactly 3 arguments. The third boolean (`c`) is not optional — the library's `VerifyBoolean(c)` throws if undefined.

**Fix:** Pass `true` as the third argument: `GeoVector(body, dt, true)`

### Bug 5 — Dasha Date Arithmetic (Month Rounding)

`addYr()` used `setMonth` with `Math.round((fraction × 12))`, which introduces cumulative rounding errors across multi-year Dasha periods.

**Fix:** `new Date(cur.getTime() + mdDurYears × 365 × 86400000)` — exact day-level arithmetic

---

## Design Improvements Applied

Following the **Alignment & Design Theory** rules from Style-Presets-Guide.md:

### Typography & Hierarchy
- **Heading scale:** h1 enlarged from 1.35rem → 1.75rem (dramatic contrast with body text)
- **Section headings** (.pb h3) increased from 0.8rem → 0.9rem with Playfair Display weight 700
- **Table text** minimum increased from 0.58rem → 0.62rem (readability floor)
- **Body line-height** increased from 1.5 → 1.6 for comfortable reading
- **Max line width:** container reduced from 1360px → 1280px

### White Space & Spacing
- **Body padding:** increased from 16px → 24px 32px
- **Form padding:** increased from 16px 20px → 20px 24px
- **Section gaps:** increased from 16px → 20px–24px consistently
- **Table cell padding:** increased from 4px 5px → 6px 8px
- **Footer margin-top:** increased from 24px → 32px

### Alignment & Grid
- **Form gap:** 12px → 16px for balanced 12-column-compatible rhythm
- **Chart box padding:** 18px → 20px
- **Dasha grid gap:** 10px → 12px with padding 10px → 14px
- **Chart row gap:** 16px → 24px

### Color & Consistency
- **Focus ring:** shadow spread 2px → 3px for clearer visual feedback
- **Button padding:** 7px 22px → 9px 28px for better touch target
- **Border-radius:** all interactive elements set to 3px (consistent)
- **Accent usage:** accent color reserved for CTAs, active states, and key data (60-30-10 rule)

### Mobile-First
- Mobile breakpoints maintained at 720px, 700px, 500px
- Form collapses to single column on narrow screens
- All touch targets exceed 44px minimum

---

## File

`kp-south-indian.html` — single-file, 461 lines. Open in any browser, click **Generate Chart**.
