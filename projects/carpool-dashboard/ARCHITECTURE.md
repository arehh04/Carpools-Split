# Carpool Dashboard — Architecture

## Overview

Single-page Next.js App Router application. No backend, no database. All state lives in React and is serialized into the URL for sharing.

---

## Directory Structure

```
app/
  page.js                        — root page, owns all state
  layout.tsx                     — HTML shell, fonts, metadata
  globals.css                    — Tailwind directives + base body style
  components/
    TripForm.js                  — trip inputs + route auto-detection
    PassengerTable.js            — passenger management
    Result.js                    — cost split display
    ShareBar.js                  — share link copy button
  utils/
    calc.js                      — CORE: segment-based split algorithm
    encode.js                    — URL state serialization
    parseRoute.js                — map URL parser (client-side)
    resolveDistance.js           — geocoding + routing (client-side fetch)
  api/
    resolve-url/
      route.js                   — Next.js API route: server-side URL resolver

agents/                          — AI agent instruction files
projects/
  carpool-dashboard/             — project documentation
```

---

## State Management

All state lives in `page.js` via `useState`:

| State        | Type       | Default              |
|--------------|------------|----------------------|
| `distance`   | number     | 351                  |
| `fuel`       | number     | 50                   |
| `toll`       | number     | 14                   |
| `passengers` | Passenger[]| 3 sample passengers  |
| `result`     | object     | {} (auto-calculated) |

State flows down as props. No context, no global store.

Result is derived — recalculated in a `useEffect` whenever distance/fuel/toll/passengers change.

---

## Calculation Engine (`utils/calc.js`)

Algorithm: segment-based fair split.

```
1. Collect all unique km points (passenger start + end values)
2. Sort into ascending segments
3. For each segment:
   a. Find passengers active in that segment (start ≤ segStart AND end ≥ segEnd)
   b. Split segment cost equally among active passengers
4. Accumulate per passenger
```

Key correctness properties:
- Index-based accumulation → duplicate names safe
- All inputs coerced to Number before math
- Guards: d ≤ 0, totalCost ≤ 0, empty passengers → return {}

---

## URL State (`utils/encode.js`)

Format: `?d={distance}&f={fuel}&t={toll}&p={passengers}`

Passenger encoding: `Name,startKm,endKm` joined by `|`, then URI-encoded.

Known limitation: commas in passenger names break the parser. Not fixed yet.

---

## Route Auto-Detection Flow

```
User pastes URL
  ↓
isMapLink() → true
  ↓
parseRouteLink()
  ├─ Long URL → extract origin + destination from path/params
  │     ↓
  │   extractCoordsFromData()  ← PRIMARY PATH
  │   ├─ !1d{lon}!2d{lat} pairs found in data= blob?
  │   │     YES → return { type:"waze-coords", coords:{from,to} }
  │   │             ↓
  │   │           resolveRouteFromCoords() → OSRM directly (no geocoding)
  │   │
  │   └─ pairs absent → return { type:"google", origin, destination }
  │                       ↓
  │                     resolveRouteDistance() → Nominatim → OSRM (fallback)
  │
  └─ Short URL (goo.gl) → /api/resolve-url → follow redirect → re-parse
        (resolved URL may contain data= blob → same coord extraction above)
  ↓
setDistance(km)  — auto-fills the distance field
```

### Why coordinate extraction is the primary path

Google Maps direction URLs embed precise waypoint coordinates as `!1d{lon}!2d{lat}`
pairs in the `data=` path segment. These are accurate even for granular addresses
(mall units, block numbers) that Nominatim's OSM data does not index. Nominatim is
only used when these pairs are absent (plain text origin/destination URLs).

External services used (all free, no API key):
- **Nominatim** (`nominatim.openstreetmap.org`) — geocoding (fallback only)
- **OSRM** (`router.project-osrm.org`) — driving distance

---

## API Routes

### `GET /api/resolve-url?url={mapUrl}`

Follows HTTP redirects server-side (avoids browser CORS restrictions).
Returns `{ finalUrl: string }`.

Security note: currently accepts any URL. Should be hardened to allowlist
map hostnames only and reject private IP ranges before production.

---

## Known Technical Debt

| Issue | File | Priority |
|-------|------|----------|
| Comma in passenger name breaks URL encoding | encode.js | Medium |
| Nominatim fallback limited to OSM-indexed places (mitigated: coord extraction is now primary path) | resolveDistance.js | Low |
| Passenger names used as result keys (duplicate-safe but display only) | calc.js | Low |
