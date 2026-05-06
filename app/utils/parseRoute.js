/**
 * Client-side parser for Google Maps and Waze share links.
 *
 * Returns one of:
 *   { type: "google"|"google-short"|"waze", label, origin, destination }
 *   { type: "waze-coords", label, coords: { from: {lat,lon}, to: {lat,lon} } }
 *   null  — not a recognised map link
 *
 * origin/destination are place-name strings for Nominatim geocoding.
 * coords bypass geocoding and go straight to OSRM.
 *
 * Primary path for Google direction URLs: extract embedded !1d{lon}!2d{lat} pairs
 * from the data= blob — these are present even in resolved short links and avoid
 * Nominatim entirely (critical for precise Malaysian commercial addresses).
 */

export function isMapLink(url) {
  if (!url) return false;
  return /google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|waze\.com|waze\.me/i.test(url);
}

function clean(raw) {
  try {
    return decodeURIComponent(raw).replace(/\+/g, " ").trim();
  } catch {
    return raw.replace(/\+/g, " ").trim();
  }
}

// Google Maps direction URLs embed waypoint coords as !1d{lon}!2d{lat} pairs in the
// data= path segment. Extracting these skips Nominatim geocoding entirely — crucial
// for precise addresses that Nominatim doesn't index (e.g. mall unit numbers).
function extractCoordsFromData(url) {
  const matches = [...url.matchAll(/!1d([\d.-]+)!2d([\d.-]+)/g)];
  if (matches.length < 2) return null;
  return {
    from: { lon: parseFloat(matches[0][1]),                   lat: parseFloat(matches[0][2]) },
    to:   { lon: parseFloat(matches[matches.length - 1][1]),  lat: parseFloat(matches[matches.length - 1][2]) },
  };
}

export function parseRouteLink(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // ── Pattern 1: /maps/dir/Origin/Destination/ (address-bar long URL) ──────
  // Handles empty origin (current location) by accepting zero-length first segment
  const dirPath = trimmed.match(/google\.com\/maps\/dir\/([^@?#]*)\/([^@?#/]+)/);
  if (dirPath) {
    const from = clean(dirPath[1]);
    const to   = clean(dirPath[2]);
    if (to) {
      const coords = extractCoordsFromData(trimmed);
      if (coords) {
        return { label: from ? `${from} → ${to}` : to, coords, type: "waze-coords" };
      }
      return {
        label: from ? `${from} → ${to}` : to,
        origin: from || null,
        destination: to,
        type: "google",
      };
    }
  }

  let u;
  try {
    u = new URL(trimmed);
  } catch {
    return null;
  }

  const host = u.hostname.toLowerCase();

  // ── Google Maps patterns ──────────────────────────────────────────────────
  if (host.includes("google.com")) {

    // Pattern 2: /maps/dir/?api=1&origin=...&destination=...
    if (u.pathname.includes("/maps/dir") || u.pathname.includes("/maps/directions")) {
      const origin = u.searchParams.get("origin");
      const dest   = u.searchParams.get("destination");
      if (dest) {
        const coords = extractCoordsFromData(trimmed);
        if (coords) {
          return { label: origin ? `${origin} → ${dest}` : dest, coords, type: "waze-coords" };
        }
        return {
          label: origin ? `${origin} → ${dest}` : dest,
          origin: origin || null,
          destination: dest,
          type: "google",
        };
      }
    }

    // Pattern 3: ?saddr=Origin&daddr=Destination (legacy Google Maps)
    const saddr = u.searchParams.get("saddr");
    const daddr = u.searchParams.get("daddr");
    if (daddr) {
      const coords = extractCoordsFromData(trimmed);
      if (coords) {
        return { label: saddr ? `${saddr} → ${daddr}` : daddr, coords, type: "waze-coords" };
      }
      return {
        label: saddr ? `${saddr} → ${daddr}` : daddr,
        origin: saddr || null,
        destination: daddr,
        type: "google",
      };
    }

    // Recognised Google Maps URL but no extractable route
    return { label: null, origin: null, destination: null, type: "google" };
  }

  // ── Short links — need server-side redirect resolution ────────────────────
  if (host === "maps.app.goo.gl" || host === "goo.gl") {
    return { label: null, origin: null, destination: null, type: "google-short" };
  }

  // ── Waze ──────────────────────────────────────────────────────────────────
  if (host.includes("waze.com") || host.includes("waze.me")) {

    // Pattern 4: ?from=ll.lat,lon&to=ll.lat,lon (Waze deep link with both points)
    const from = u.searchParams.get("from"); // "ll.3.1234,101.5678"
    const to   = u.searchParams.get("to");
    if (from && to) {
      const fMatch = from.match(/ll\.([\d.-]+),([\d.-]+)/);
      const tMatch = to.match(/ll\.([\d.-]+),([\d.-]+)/);
      if (fMatch && tMatch) {
        return {
          label: "Waze route",
          coords: {
            from: { lat: parseFloat(fMatch[1]), lon: parseFloat(fMatch[2]) },
            to:   { lat: parseFloat(tMatch[1]), lon: parseFloat(tMatch[2]) },
          },
          type: "waze-coords",
        };
      }
    }

    // Pattern 5: ?ll=lat,lon — single destination, can't determine distance
    return { label: null, origin: null, destination: null, type: "waze" };
  }

  return null;
}
