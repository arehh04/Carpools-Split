/**
 * Distance resolution via free public APIs:
 *   Nominatim (OpenStreetMap) — place name → lat/lon
 *   OSRM public instance     — lat/lon pair → driving distance (metres)
 *
 * All fetches carry AbortController timeouts.
 * Geocoding is sequential to respect Nominatim's 1 req/sec policy.
 */

import { estimateTollFromSteps } from "./estimateToll.js";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OSRM      = "https://router.project-osrm.org/route/v1/driving";
const TIMEOUT   = 8000; // ms per request

function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  return fetch(url, { ...opts, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function geocode(place) {
  if (!place || !place.trim()) throw new Error("Empty place name");

  const params = new URLSearchParams({ q: place.trim(), format: "json", limit: "1" });
  const res = await fetchWithTimeout(`${NOMINATIM}?${params}`, {
    headers: { "User-Agent": "CarpoolSplit/1.0" },
  });

  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  if (!data.length) throw new Error(`Place not found: "${place}"`);

  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

async function distanceBetween(from, to) {
  const url = `${OSRM}/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const res = await fetchWithTimeout(url);

  if (!res.ok) throw new Error(`OSRM failed (${res.status})`);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error(`No driving route found (OSRM code: ${data.code})`);
  }

  return Math.round(data.routes[0].distance / 1000); // metres → km
}

/**
 * Geocode two place names, then get driving distance.
 * Sequential geocoding to avoid hitting Nominatim rate limits.
 */
export async function resolveRouteDistance(origin, destination) {
  const from = await geocode(origin);
  const to   = await geocode(destination);
  return distanceBetween(from, to);
}

/**
 * Skip geocoding entirely — use raw lat/lon coords (e.g. from Waze URLs).
 */
export async function resolveRouteFromCoords(from, to) {
  return distanceBetween(from, to);
}

/**
 * Like resolveRouteFromCoords but also returns an estimated toll.
 * Requests OSRM steps to inspect highway refs.
 * Existing callers are unaffected — this is a new export.
 *
 * @returns {{ km: number, estimatedToll: number }}
 */
export async function resolveRouteWithToll(from, to) {
  const url = `${OSRM}/${from.lon},${from.lat};${to.lon},${to.lat}?steps=true&overview=false`;
  const res = await fetchWithTimeout(url);

  if (!res.ok) throw new Error(`OSRM failed (${res.status})`);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error(`No driving route found (OSRM code: ${data.code})`);
  }

  const route = data.routes[0];
  const km = Math.round(route.distance / 1000);
  const steps = route.legs?.[0]?.steps ?? [];
  const estimatedToll = estimateTollFromSteps(steps);

  return { km, estimatedToll };
}
