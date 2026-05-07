# Glassmorphism UI + Map Visualization — Design Spec
Date: 2026-05-08
Features: UI Theme Overhaul + C — Map Route Visualization

---

## Overview

Two coordinated changes:
1. **Glassmorphism theme overhaul** — replace the flat cyberpunk HUD aesthetic with a gradient glass UI across all components.
2. **Map visualization (Feature C)** — on-demand Leaflet map showing the resolved route polyline and partial passenger stop markers, rendered between TripForm and PassengerTable.

---

## Part 1 — Glassmorphism Theme

### Background

Fixed full-screen gradient (does not scroll with content):
```css
background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
background-attachment: fixed;
```
Applied to `<body>` via `globals.css`. Remove existing `bg-[#070F34]` and grid-line `backgroundImage` from `page.js`.

### Glass Card Base

All card panels (TripForm, PassengerTable rows, Result, ShareBar) replace current `bg-[#0d1525]` with:
```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.15);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

Tailwind utility class added to `globals.css`:
```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

Graceful degradation — browsers without `backdrop-filter` support fall back to:
```css
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgba(15, 12, 41, 0.85); }
}
```

### Button Hover System

All interactive buttons gain:
```
transition-all duration-200
hover:scale-[1.03] active:scale-[0.97]
hover:border-[#00E5FF]/60
hover:shadow-[0_0_20px_rgba(0,229,255,0.35)]
```

Primary CTA buttons (SHARE MEMO, TRANSMIT LINK, + ADD PASSENGER, + REGISTER DRIVER):
- On hover: subtle `bg-[#00E5FF]/10` fill added
- Glow intensifies: `hover:shadow-[0_0_24px_rgba(0,229,255,0.45)]`

Destructive/remove buttons (X icons):
- Hover: `hover:text-[#FF007A] hover:scale-110`
- No glow (destructive actions don't celebrate)

Toggle buttons (FULL RIDE / PARTIAL):
- Active state gains `shadow-[0_0_12px_rgba(neon,0.4)]` glow
- Inactive hover: `hover:border-opacity-50`

### Accent Colours

Kept unchanged — #00E5FF, #FF007A, #9B5DE5, #00FF9F, #F8E71C, #00BFFF. They read more vividly against frosted glass than against the flat dark background.

### Typography

Orbitron + Space Mono — no change.

### HUD Corner Brackets

Remove hardcoded corner bracket `<span>` elements from TripForm, Result, and PassengerTable. The glass card border + glow replaces their decorative function. The `clipPath` cut-corner geometry on avatars is kept — it's a strong identity element that works with glass.

---

## Part 2 — Map Visualization

### Trigger & Layout

A `[ VIEW ROUTE ↗ ]` button appears inside TripForm's route status banner **only when `status === S.DONE`**.

**TripForm internal state additions:**
- `resolvedGeometry` — a `useRef` (not state) that stores the geometry returned by `resolveRouteWithToll` the moment the route resolves. Does not trigger a re-render.
- `mapVisible` — a `useState(false)` boolean that drives the button label and calls up to `setRouteGeometry`.

**Button behaviour:**
- Tapping `[ VIEW ROUTE ↗ ]`: sets `mapVisible(true)` + calls `setRouteGeometry({ coordinates: resolvedGeometry.current.coordinates, totalKm: resolvedGeometry.current.totalKm })`
- Tapping `[ HIDE ROUTE ]` (same button, toggled): sets `mapVisible(false)` + calls `setRouteGeometry(null)`
- `clearRoute()` also sets `mapVisible(false)` + calls `setRouteGeometry(null)` + clears `resolvedGeometry.current`

The map panel renders from **`page.js`** between TripForm and PassengerTable. It is null when `routeGeometry` is null.

```
page.js
  ├─ TripForm        (setRouteGeometry prop added)
  ├─ RouteMap        (routeGeometry, passengers, distance) ← new
  ├─ PassengerTable
  └─ Result
```

### Map Container

- Height: `240px`, fixed
- Styled as a glass card (`.glass` class + `rounded-xl overflow-hidden`)
- Subtle cyan inner border glow: `ring-1 ring-[#00E5FF]/20`
- Appears with a fade-in transition (`opacity-0 → opacity-100, duration-300`)
- Collapsible: tapping `[ VIEW ROUTE ↗ ]` again hides the map (`setRouteGeometry(null)` + button label toggles to `[ HIDE ROUTE ]`)

### Library

**Vanilla Leaflet** — loaded via dynamic `import('leaflet')` inside a `useEffect`. No react-leaflet. SSR safe because the component is a Client Component and Leaflet is imported only on the client.

Leaflet CSS loaded via `useEffect` by injecting a `<link>` tag (avoids Next.js CSS import issues with dynamic imports).

**Tiles:** CartoDB Dark Matter
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```
Attribution: `© OpenStreetMap contributors © CARTO`
No API key required.

### Route Geometry

`resolveRouteWithToll` in `app/utils/resolveDistance.js` is updated to request geometry:
```
?steps=true&overview=full&geometries=geojson
```

New return shape:
```js
{ km: number, estimatedToll: number, geometry: { coordinates: [[lon, lat], ...] } }
```

`geometry` is stored in `page.js` as:
```js
const [routeGeometry, setRouteGeometry] = useState(null);
// null | { coordinates: [[lon, lat], ...], totalKm: number }
```

`totalKm` is the `km` value stored alongside the geometry so the interpolation utility can map km → fraction of route.

### Map Markers

**Start marker** — green circle, label "Start"
**End marker** — red circle, label "End"
**Partial passenger markers** — cyan numbered circles, one per unique (name, km) pair:
- Board point: label `↑ Name` (arrow up = boards here)
- Exit point: label `↓ Name` (arrow down = exits here)
- Only placed when `start > 0` or `end > 0` and `mode === "partial"`
- If start and end are both 0: no markers placed

All markers use Leaflet's `divIcon` with inline styles matching the glass theme. No external marker images.

### Partial Stop Interpolation

New utility: `app/utils/interpolateRoute.js`

```js
/**
 * Given a GeoJSON coordinate array [[lon,lat],...] and a target distance in km,
 * returns the interpolated [lat, lon] position along the route.
 * Clamps to start/end if targetKm is out of range.
 */
export function interpolateOnRoute(coordinates, totalKm, targetKm)
```

Algorithm:
1. Compute cumulative Haversine distances between consecutive coordinate pairs
2. Walk segments until cumulative distance ≥ targetKm
3. Lerp position within the matching segment
4. Return `[lat, lon]`

### Polyline Style

```js
L.polyline(latlngs, {
  color: '#00E5FF',
  weight: 3,
  opacity: 0.8,
})
```

---

## Data Flow Summary

```
User pastes Waze/Google link
  → TripForm resolveRouteWithToll()
  → Returns { km, estimatedToll, geometry }
  → setDistance(km), setToll(estimatedToll) [existing]
  → setRouteGeometry({ coordinates, totalKm: km }) [new]
  → page.js passes routeGeometry + passengers + distance to RouteMap
  → RouteMap renders Leaflet map with polyline + markers
```

---

## Edge Cases

| Situation | Behaviour |
|---|---|
| Distance entered manually (no link) | `routeGeometry` stays null, RouteMap not rendered, no VIEW ROUTE button |
| OSRM geometry fetch fails | `resolveRouteWithToll` catches, returns `geometry: null`. `setRouteGeometry` not called. Map not shown, distance still fills. |
| User clears route URL | `clearRoute()` calls `setRouteGeometry(null)` → map disappears |
| Partial passenger km = 0 | No marker placed |
| Partial passenger km > totalKm | Marker clamped to end of polyline |
| Two passengers with identical km | Markers offset by `[0.0001 * index, 0]` lat/lon to prevent overlap |
| Leaflet HMR re-render | `useEffect` cleanup calls `map.remove()` before re-init |
| `backdrop-filter` not supported | `.glass` fallback: solid `rgba(15,12,41,0.85)` |
| Full-ride passengers | No markers (they ride 0 → totalKm, only start/end markers represent them) |

---

## Files Touched

| File | Change |
|---|---|
| `app/globals.css` | Add `.glass` utility, gradient background on body, `@supports` fallback |
| `app/page.js` | Remove bg/grid styles, add `routeGeometry` state, pass `setRouteGeometry` to TripForm, render `<RouteMap>` |
| `app/components/TripForm.js` | Glass card style, VIEW ROUTE button, hover effects, call `setRouteGeometry` on resolve |
| `app/components/PassengerTable.js` | Glass card style, hover effects, remove corner brackets |
| `app/components/Result.js` | Glass card style, hover effects, remove corner brackets |
| `app/components/ShareBar.js` | Glass button style, hover effects |
| `app/components/MemoSheet.js` | Minor backdrop tweak (already light, minimal change) |
| `app/components/RouteMap.js` | New — Leaflet map, polyline, markers, uses interpolateOnRoute |
| `app/utils/resolveDistance.js` | `resolveRouteWithToll` returns geometry |
| `app/utils/interpolateRoute.js` | New — Haversine interpolation utility |

No new npm dependencies for glassmorphism (pure CSS/Tailwind).
One new dependency: `leaflet` (map library, ~42KB gzipped).

---

## Out of Scope

- User-interactive map (panning/zooming is fine, but no click-to-set-waypoint)
- Satellite or street-view tile options
- Directions text (turn-by-turn)
- Real-time sync (separate spec D+E)
- Screenshot/export of map
