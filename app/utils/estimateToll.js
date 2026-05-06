/**
 * MVP toll estimator for Malaysian highways.
 *
 * Hybrid model:
 *   DISTANCE_BASED — interstate open-system highways, fare scales with km
 *   FIXED_TOLL     — urban plaza-based expressways, flat per route regardless of km used
 *   FLAT_RATES     — known fixed structures (bridges), flat per route
 *
 * Returns a rounded estimate — not an exact fare.
 * UI must label this "Estimated Toll", not "Exact Toll".
 */

// ── Interstate distance-based (RM/km) ─────────────────────────────────────
// Open-system toll roads where fare scales with distance travelled.
// Calibrated from published PLUS/LPT schedules (Class 1 passenger car).
const DISTANCE_BASED = {
  E1: 0.240, // PLUS NSE North (KL–Penang)
  E2: 0.230, // PLUS NSE South (KL–JB)
  E3: 0.240, // PLUS NSE Central
  E5: 0.240, // PLUS (Bukit Kayu Hitam border segment)
  E8: 0.240, // LPT / Karak Highway
  E9: 0.140, // LPT2 (East Coast)
};

// ── Urban plaza-based expressways (RM flat, once per route) ───────────────
// Charged per plaza, not per km. Applying a per-km rate to short urban
// stretches produces absurdly low estimates. A fixed rate per detection
// better matches what Malaysian drivers actually pay.
const FIXED_TOLL = {
  E6:  2.00, // ELITE
  E7:  2.00, // KESAS
  E10: 4.00, // LDP  (Lebuhraya Damansara–Puchong, multiple plazas)
  E11: 4.00, // NKVE (New Klang Valley Expressway)
  E13: 3.00, // Guthrie / LATAR
  E15: 2.50, // MEX  (Maju Expressway / Putrajaya)
  E20: 3.00, // DUKE
  E22: 3.00, // DUKE 2
  E23: 3.00, // SUKE
  E33: 3.00, // LEKAS
  E35: 2.50, // Guthrie Corridor Expressway (OSM tags as E35, not E13)
  E37: 4.00, // SKVE / Linkedua (Johor corridor)
};

// ── Known flat structures (RM flat, once per route) ───────────────────────
const FLAT_RATES = {
  E28: 8.50, // First Penang Bridge  (Jambatan Pulau Pinang)
  E36: 8.50, // Second Penang Bridge (Sultan Abdul Halim Muadzam Shah)
};

function parseRefs(refString) {
  if (!refString || refString === "undefined") return [];
  return refString.split(";").map((r) => r.trim().toUpperCase()).filter(Boolean);
}

/**
 * Estimate toll cost from OSRM route steps.
 * @param {Array} steps - routes[0].legs[0].steps from OSRM response
 * @returns {number} Estimated toll in RM, rounded to nearest 0.50
 */
export function estimateTollFromSteps(steps) {
  if (!Array.isArray(steps) || !steps.length) return 0;

  let total = 0;
  const seenFixed = new Set(); // prevents double-counting multi-step refs

  for (const step of steps) {
    const refs  = parseRefs(step.ref);
    const distKm = (step.distance || 0) / 1000;

    for (const ref of refs) {
      if (ref in FLAT_RATES) {
        if (!seenFixed.has(ref)) {
          total += FLAT_RATES[ref];
          seenFixed.add(ref);
        }
        break;
      }
      if (ref in FIXED_TOLL) {
        if (!seenFixed.has(ref)) {
          total += FIXED_TOLL[ref];
          seenFixed.add(ref);
        }
        break;
      }
      if (ref in DISTANCE_BASED) {
        total += distKm * DISTANCE_BASED[ref];
        break; // avoid double-counting multi-ref steps
      }
    }
  }

  // Round to nearest 0.50 — signals estimate, not exact fare
  return Math.round(total * 2) / 2;
}
