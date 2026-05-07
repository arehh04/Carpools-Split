# Glassmorphism UI Overhaul + Map Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat cyberpunk HUD theme with a gradient glassmorphism UI across all components, and add an on-demand Leaflet map showing the resolved route polyline with partial passenger stop markers.

**Architecture:** The glassmorphism theme is a new `.glass` CSS utility in `globals.css` plus a fixed gradient `body` background; all card panels replace `bg-[#0d1525]` with the glass class and rounded corners, corner bracket `<span>` elements are removed, and buttons gain hover scale + glow. The map uses vanilla Leaflet (dynamic import, client-only) in a new `RouteMap.js` component driven by `routeGeometry` state in `page.js`; TripForm stores resolved GeoJSON in a `useRef` and exposes a `[VIEW ROUTE ↗]` toggle that calls `setRouteGeometry` up to page.js.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS v3, Leaflet 1.9.x, OSRM GeoJSON geometry, Haversine interpolation

---

## File Map

| File | Role |
|---|---|
| `app/globals.css` | Gradient body, `.glass` utility, `@supports` fallback; remove scanlines + .hud-card |
| `app/page.js` | Remove flat bg/grid; add `routeGeometry` state; render `<RouteMap>`; pass `setRouteGeometry` to TripForm |
| `app/components/TripForm.js` | Glass card; rounded inputs; `resolvedGeometry` ref; `mapVisible` state; VIEW ROUTE button |
| `app/components/PassengerTable.js` | Glass cards; rounded km inputs; hover effects |
| `app/components/Result.js` | Glass cards; remove corner spans; SHARE MEMO hover |
| `app/components/ShareBar.js` | Hover scale + active scale |
| `app/components/RouteMap.js` | **New** — Leaflet map, polyline, divIcon markers, cleanup |
| `app/utils/resolveDistance.js` | Add `overview=full&geometries=geojson`; return `geometry` |
| `app/utils/interpolateRoute.js` | **New** — Haversine km-to-latlng interpolation |
| `app/components/MemoSheet.js` | No change required — existing backdrop works with new theme |

---

### Task 1: Install leaflet

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install**

```bash
npm install leaflet
```

- [ ] **Step 2: Verify**

Open `package.json` and confirm a `"leaflet"` entry exists in `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add leaflet dependency"
```

---

### Task 2: globals.css — glassmorphism foundation

**Files:**
- Modify: `app/globals.css`

Removes: flat `#070F34` body background, `body::after` scanlines, `.hud-card` pseudo-element corner rules, `:root` CSS variable block (all values are inlined in components).
Adds: gradient body background, `.glass` utility class, `@supports` fallback.

- [ ] **Step 1: Replace entire globals.css**

Write this as the full content of `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-space-mono, monospace);
  color: #94a3b8;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  background-attachment: fixed;
  -webkit-text-size-adjust: 100%;
}

.font-orbitron {
  font-family: var(--font-orbitron, sans-serif);
  letter-spacing: 0.08em;
}

/* Remove number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgba(15, 12, 41, 0.85); }
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
npx next dev --webpack
```

Open `http://localhost:3000`. Background should be a deep purple-to-blue gradient. No scanlines visible.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: glassmorphism foundation — gradient body, .glass utility, remove scanlines"
```

---

### Task 3: page.js — remove background, glass hint div

**Files:**
- Modify: `app/page.js`

- [ ] **Step 1: Remove bg-[#070F34] and inline grid styles from main**

In `app/page.js`, find:
```jsx
    <main
      className="min-h-screen py-10 px-5 bg-[#070F34]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
```
Replace with:
```jsx
    <main className="min-h-screen py-10 px-5">
```

- [ ] **Step 2: Update hint div — remove corner spans, add glass class**

In `app/page.js`, find:
```jsx
          <div className="relative mb-5 border border-[#00E5FF]/15 bg-[#0d1525]/60 px-4 py-5 text-center">
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00E5FF]/25" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00E5FF]/25" />
            <p className="font-orbitron text-[10px] text-[#00E5FF]/40 tracking-widest">
```
Replace with:
```jsx
          <div className="glass rounded-xl mb-5 px-4 py-5 text-center">
            <p className="font-orbitron text-[10px] text-[#00E5FF]/40 tracking-widest">
```

- [ ] **Step 3: Verify**

Open `http://localhost:3000`. The gradient background should show through the whole page. Add a passenger without entering fuel — the hint card should appear as a frosted glass panel.

- [ ] **Step 4: Commit**

```bash
git add app/page.js
git commit -m "feat: page.js glassmorphism — remove flat bg/grid, glass hint card"
```

---

### Task 4: TripForm.js — glassmorphism styling

**Files:**
- Modify: `app/components/TripForm.js`

- [ ] **Step 1: Replace container — glass card, remove two corner spans**

In `app/components/TripForm.js`, find:
```jsx
    <div className="hud-card relative border border-[#00E5FF]/20 bg-[#0d1525] p-6 mb-4">
      {/* Extra corner brackets (top-right, bottom-left) */}
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00E5FF]" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00E5FF]" />
```
Replace with:
```jsx
    <div className="glass rounded-2xl p-6 mb-4">
```

- [ ] **Step 2: Update inputBase constant**

In `app/components/TripForm.js`, find:
```js
const inputBase =
  "w-full bg-[#050d1e] border border-[#00E5FF]/20 text-sm text-slate-300 transition-all " +
  "focus:outline-none focus:border-[#00E5FF]/60 focus:shadow-[0_0_8px_rgba(0,229,255,0.2)] placeholder-[#00E5FF]/20";
```
Replace with:
```js
const inputBase =
  "w-full bg-white/5 border border-white/15 rounded-lg text-sm text-slate-300 transition-all " +
  "focus:outline-none focus:border-[#00E5FF]/60 focus:shadow-[0_0_8px_rgba(0,229,255,0.2)] placeholder-slate-600";
```

- [ ] **Step 3: Update clear X button background**

In `app/components/TripForm.js`, find:
```jsx
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#1a2545] hover:bg-[#FF007A]/20 flex items-center justify-center transition-colors"
```
Replace with:
```jsx
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 hover:bg-[#FF007A]/20 flex items-center justify-center transition-colors"
```

- [ ] **Step 4: Add rounded-lg to S.RESOLVING banner**

In `app/components/TripForm.js`, find:
```jsx
            className="mt-2 flex items-center gap-2 border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-3.5 py-2.5"
```
Replace with:
```jsx
            className="mt-2 flex items-center gap-2 border border-[#00E5FF]/20 bg-[#00E5FF]/5 rounded-lg px-3.5 py-2.5"
```

- [ ] **Step 5: Add rounded-lg to S.DONE banner**

In `app/components/TripForm.js`, find:
```jsx
          <div className="mt-2 border border-[#00FF9F]/30 bg-[#00FF9F]/5 px-3.5 py-2.5">
```
Replace with:
```jsx
          <div className="mt-2 border border-[#00FF9F]/30 bg-[#00FF9F]/5 rounded-lg px-3.5 py-2.5">
```

- [ ] **Step 6: Add rounded-lg to S.NO_DATA banner**

In `app/components/TripForm.js`, find:
```jsx
            className="mt-2 flex items-start gap-2 border border-[#F8E71C]/30 bg-[#F8E71C]/5 px-3.5 py-2.5"
```
Replace with:
```jsx
            className="mt-2 flex items-start gap-2 border border-[#F8E71C]/30 bg-[#F8E71C]/5 rounded-lg px-3.5 py-2.5"
```

- [ ] **Step 7: Add rounded-lg to S.ERROR banner**

In `app/components/TripForm.js`, find:
```jsx
            className="mt-2 flex items-start gap-2 border border-[#FF007A]/30 bg-[#FF007A]/5 px-3.5 py-2.5"
```
Replace with:
```jsx
            className="mt-2 flex items-start gap-2 border border-[#FF007A]/30 bg-[#FF007A]/5 rounded-lg px-3.5 py-2.5"
```

- [ ] **Step 8: Verify**

Open `http://localhost:3000`. The trip parameters card is a frosted glass panel with rounded corners. URL input, distance, fuel, toll fields have glass backgrounds. Status banners have rounded corners.

- [ ] **Step 9: Commit**

```bash
git add app/components/TripForm.js
git commit -m "feat: TripForm glassmorphism — glass card, rounded inputs, remove corner brackets"
```

---

### Task 5: PassengerTable.js — glassmorphism styling

**Files:**
- Modify: `app/components/PassengerTable.js`

- [ ] **Step 1: Update Register Driver button**

In `app/components/PassengerTable.js`, find:
```jsx
            className="w-full flex items-center gap-3 px-4 py-3.5 border border-dashed border-[#00E5FF]/30 bg-[#0d1525] hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/5 transition-all group"
```
Replace with:
```jsx
            className="w-full flex items-center gap-3 px-4 py-3.5 border border-dashed border-[#00E5FF]/30 bg-white/5 rounded-xl hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/5 hover:scale-[1.01] transition-all duration-200 group"
```

- [ ] **Step 2: Update active driver card — glass class, remove corner span**

In `app/components/PassengerTable.js`, find:
```jsx
          <div
            className="relative bg-[#0d1525] px-4 py-4"
            style={{ borderLeft: "2px solid #00E5FF", borderBottom: "1px solid rgba(0,229,255,0.13)" }}
          >
            <span className="absolute top-0 right-0 w-3 h-3" style={{ borderTop: "1px solid rgba(0,229,255,0.4)", borderRight: "1px solid rgba(0,229,255,0.4)" }} />
```
Replace with:
```jsx
          <div
            className="relative glass rounded-xl px-4 py-4"
            style={{ borderLeft: "2px solid #00E5FF" }}
          >
```

- [ ] **Step 3: Update empty passengers placeholder**

In `app/components/PassengerTable.js`, find:
```jsx
          <div className="border border-dashed border-[#00E5FF]/15 bg-[#0d1525]/60 py-6 text-center">
```
Replace with:
```jsx
          <div className="border border-dashed border-[#00E5FF]/15 bg-white/5 rounded-xl py-6 text-center">
```

- [ ] **Step 4: Update each passenger card — glass class, remove corner span**

In `app/components/PassengerTable.js`, find:
```jsx
            <div
              key={i}
              className="relative bg-[#0d1525] px-4 py-4"
              style={{ borderLeft: `2px solid ${neon}`, borderBottom: `1px solid ${neon}22` }}
            >
              <span
                className="absolute top-0 right-0 w-3 h-3"
                style={{ borderTop: `1px solid ${neon}60`, borderRight: `1px solid ${neon}60` }}
              />
```
Replace with:
```jsx
            <div
              key={i}
              className="relative glass rounded-xl px-4 py-4"
              style={{ borderLeft: `2px solid ${neon}` }}
            >
```

- [ ] **Step 5: Update BOARDS km input background**

In `app/components/PassengerTable.js`, find the style block for the BOARDS input (it has `value={p.start}`):
```jsx
                        style={{
                          color: neon,
                          padding: "8px",
                          border: `1px solid ${kmInvalid ? "#FF007A60" : `${neon}30`}`,
                          backgroundColor: "#050d1e",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = `${neon}90`)}
                        onBlur={(e) => (e.target.style.borderColor = kmInvalid ? "#FF007A60" : `${neon}30`)}
                        value={p.start}
```
Replace with:
```jsx
                        style={{
                          color: neon,
                          padding: "8px",
                          border: `1px solid ${kmInvalid ? "#FF007A60" : `${neon}30`}`,
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: "6px",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = `${neon}90`)}
                        onBlur={(e) => (e.target.style.borderColor = kmInvalid ? "#FF007A60" : `${neon}30`)}
                        value={p.start}
```

- [ ] **Step 6: Update EXITS km input background**

In `app/components/PassengerTable.js`, find the style block for the EXITS input (it has `value={p.end}`):
```jsx
                        style={{
                          color: neon,
                          padding: "8px",
                          border: `1px solid ${kmInvalid ? "#FF007A60" : `${neon}30`}`,
                          backgroundColor: "#050d1e",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = `${neon}90`)}
                        onBlur={(e) => (e.target.style.borderColor = kmInvalid ? "#FF007A60" : `${neon}30`)}
                        value={p.end}
```
Replace with:
```jsx
                        style={{
                          color: neon,
                          padding: "8px",
                          border: `1px solid ${kmInvalid ? "#FF007A60" : `${neon}30`}`,
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: "6px",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = `${neon}90`)}
                        onBlur={(e) => (e.target.style.borderColor = kmInvalid ? "#FF007A60" : `${neon}30`)}
                        value={p.end}
```

- [ ] **Step 7: Update + ADD PASSENGER button hover**

In `app/components/PassengerTable.js`, find:
```jsx
        className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 border border-dashed border-[#00E5FF]/20 font-orbitron text-[10px] font-bold text-[#00E5FF]/35 hover:text-[#00E5FF]/70 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/5 active:scale-[0.98] transition-all tracking-widest"
```
Replace with:
```jsx
        className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 border border-dashed border-[#00E5FF]/20 rounded-xl font-orbitron text-[10px] font-bold text-[#00E5FF]/35 hover:text-[#00E5FF]/70 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] active:scale-[0.97] transition-all duration-200 tracking-widest"
```

- [ ] **Step 8: Verify**

Open `http://localhost:3000`. Add a driver and 2 passengers (one partial). All crew cards should be frosted glass with rounded corners and neon left borders. Partial km inputs should have glass backgrounds. Hover + ADD PASSENGER — it scales and glows subtly.

- [ ] **Step 9: Commit**

```bash
git add app/components/PassengerTable.js
git commit -m "feat: PassengerTable glassmorphism — glass cards, rounded km inputs, hover effects"
```

---

### Task 6: Result.js — glassmorphism styling

**Files:**
- Modify: `app/components/Result.js`

- [ ] **Step 1: Update total card — glass class, remove 4 corner spans**

In `app/components/Result.js`, find:
```jsx
      <div
        className="relative border border-[#00E5FF]/30 bg-[#0d1525] p-6 mb-4"
        style={{ boxShadow: "0 0 30px rgba(0,229,255,0.08), inset 0 0 30px rgba(0,229,255,0.03)" }}
      >
        {/* Corner brackets */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00E5FF]" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00E5FF]" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00E5FF]" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00E5FF]" />
```
Replace with:
```jsx
      <div className="relative glass rounded-2xl p-6 mb-4">
```

- [ ] **Step 2: Update per-person rows — glass class, remove corner span**

In `app/components/Result.js`, find:
```jsx
            <div
              key={name}
              className="relative bg-[#0d1525] px-4 py-4"
              style={{ borderLeft: `2px solid ${neon}`, borderBottom: `1px solid ${neon}22` }}
            >
              <span
                className="absolute top-0 right-0 w-3 h-3"
                style={{ borderTop: `1px solid ${neon}60`, borderRight: `1px solid ${neon}60` }}
              />
```
Replace with:
```jsx
            <div
              key={name}
              className="relative glass rounded-xl px-4 py-4"
              style={{ borderLeft: `2px solid ${neon}` }}
            >
```

- [ ] **Step 3: Update SHARE MEMO button hover**

In `app/components/Result.js`, find:
```jsx
          className="w-full font-orbitron text-[10px] font-bold tracking-widest py-3 border border-dashed border-[#00E5FF]/25 text-[#00E5FF]/40 hover:text-[#00E5FF]/70 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/5 active:scale-[0.98] transition-all"
```
Replace with:
```jsx
          className="w-full font-orbitron text-[10px] font-bold tracking-widest py-3 border border-dashed border-[#00E5FF]/25 rounded-lg text-[#00E5FF]/40 hover:text-[#00E5FF]/70 hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/10 hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(0,229,255,0.45)] active:scale-[0.97] transition-all duration-200"
```

- [ ] **Step 4: Verify**

Enter trip data with 2 passengers. Total cost card and per-person rows are frosted glass with rounded corners. Hover SHARE MEMO — it scales and glows.

- [ ] **Step 5: Commit**

```bash
git add app/components/Result.js
git commit -m "feat: Result glassmorphism — glass cards, hover on SHARE MEMO, remove corner brackets"
```

---

### Task 7: ShareBar.js — hover scale

**Files:**
- Modify: `app/components/ShareBar.js`

- [ ] **Step 1: Add hover and active scale to button**

In `app/components/ShareBar.js`, find:
```jsx
        className="w-full flex items-center justify-center gap-2.5 py-4 font-orbitron text-xs font-bold tracking-widest uppercase transition-all active:scale-95"
```
Replace with:
```jsx
        className="w-full flex items-center justify-center gap-2.5 py-4 font-orbitron text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
```

- [ ] **Step 2: Verify**

Hover TRANSMIT LINK — it scales up slightly. Click it — it presses down, then copies the link and shows LINK TRANSMITTED state.

- [ ] **Step 3: Commit**

```bash
git add app/components/ShareBar.js
git commit -m "feat: ShareBar hover:scale-[1.03] active:scale-[0.97]"
```

---

### Task 8: interpolateRoute.js — Haversine utility

**Files:**
- Create: `app/utils/interpolateRoute.js`

- [ ] **Step 1: Create the file**

Create `app/utils/interpolateRoute.js` with this content:

```js
function haversineKm([lon1, lat1], [lon2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns [lat, lon] at targetKm along a GeoJSON coordinate array.
 * coordinates: [[lon, lat], ...] — GeoJSON order (lon first)
 * Clamps to route start/end if targetKm is out of [0, totalKm].
 */
export function interpolateOnRoute(coordinates, totalKm, targetKm) {
  const clamped = Math.max(0, Math.min(targetKm, totalKm));

  if (clamped === 0 || coordinates.length === 0) {
    const [lon, lat] = coordinates[0];
    return [lat, lon];
  }

  if (clamped >= totalKm) {
    const [lon, lat] = coordinates[coordinates.length - 1];
    return [lat, lon];
  }

  let cumulative = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const segKm = haversineKm(coordinates[i], coordinates[i + 1]);
    if (cumulative + segKm >= clamped) {
      const t = segKm > 0 ? (clamped - cumulative) / segKm : 0;
      const [lon1, lat1] = coordinates[i];
      const [lon2, lat2] = coordinates[i + 1];
      return [lat1 + t * (lat2 - lat1), lon1 + t * (lon2 - lon1)];
    }
    cumulative += segKm;
  }

  const [lon, lat] = coordinates[coordinates.length - 1];
  return [lat, lon];
}
```

- [ ] **Step 2: Commit**

```bash
git add app/utils/interpolateRoute.js
git commit -m "feat: interpolateOnRoute — Haversine km-to-latlng along GeoJSON polyline"
```

---

### Task 9: resolveDistance.js — return OSRM geometry

**Files:**
- Modify: `app/utils/resolveDistance.js`

- [ ] **Step 1: Update OSRM URL — add overview=full&geometries=geojson**

In `app/utils/resolveDistance.js`, find:
```js
  const url = `${OSRM}/${from.lon},${from.lat};${to.lon},${to.lat}?steps=true&overview=false`;
```
Replace with:
```js
  const url = `${OSRM}/${from.lon},${from.lat};${to.lon},${to.lat}?steps=true&overview=full&geometries=geojson`;
```

- [ ] **Step 2: Return geometry alongside km and estimatedToll**

In `app/utils/resolveDistance.js`, find:
```js
  return { km, estimatedToll };
```
Replace with:
```js
  return { km, estimatedToll, geometry: route.geometry ?? null };
```

- [ ] **Step 3: Verify**

With dev server running, paste a Waze link. Open DevTools → Network. Find the OSRM request URL — confirm it ends with `overview=full&geometries=geojson`. Inspect the response JSON — confirm a `geometry` field with `type: "LineString"` and a `coordinates` array of `[lon, lat]` pairs.

- [ ] **Step 4: Commit**

```bash
git add app/utils/resolveDistance.js
git commit -m "feat: resolveRouteWithToll returns GeoJSON geometry from OSRM"
```

---

### Task 10: TripForm.js — VIEW ROUTE button and geometry wiring

**Files:**
- Modify: `app/components/TripForm.js`

Depends on Tasks 4 (glassmorphism already applied) and 9 (resolveRouteWithToll returns geometry).

- [ ] **Step 1: Add setRouteGeometry prop, mapVisible state, resolvedGeometry ref**

In `app/components/TripForm.js`, find:
```js
export default function TripForm({ distance, setDistance, fuel, setFuel, toll, setToll }) {
  const [routeUrl, setRouteUrl]       = useState("");
  const [routeLabel, setRouteLabel]   = useState(null);
  const [status, setStatus]           = useState(S.IDLE);
  const [tollIsEstimated, setTollIsEstimated] = useState(false);

  const autoFilledRef = useRef(false);
```
Replace with:
```js
export default function TripForm({ distance, setDistance, fuel, setFuel, toll, setToll, setRouteGeometry }) {
  const [routeUrl, setRouteUrl]       = useState("");
  const [routeLabel, setRouteLabel]   = useState(null);
  const [status, setStatus]           = useState(S.IDLE);
  const [tollIsEstimated, setTollIsEstimated] = useState(false);
  const [mapVisible, setMapVisible]   = useState(false);

  const autoFilledRef    = useRef(false);
  const resolvedGeometry = useRef(null);
```

- [ ] **Step 2: Update clearRoute() to reset map state**

In `app/components/TripForm.js`, find:
```js
  function clearRoute() {
    if (autoFilledRef.current) {
      setDistance(0);
      setToll(0);
      autoFilledRef.current = false;
    }
    setTollIsEstimated(false);
    setRouteUrl("");
    setRouteLabel(null);
    setStatus(S.IDLE);
  }
```
Replace with:
```js
  function clearRoute() {
    if (autoFilledRef.current) {
      setDistance(0);
      setToll(0);
      autoFilledRef.current = false;
    }
    setTollIsEstimated(false);
    setMapVisible(false);
    setRouteUrl("");
    setRouteLabel(null);
    setStatus(S.IDLE);
    resolvedGeometry.current = null;
    setRouteGeometry(null);
  }
```

- [ ] **Step 3: Capture geometry in the waze-coords branch**

In `app/components/TripForm.js`, find:
```js
        if (info?.type === "waze-coords" && info.coords) {
          const { km, estimatedToll } = await resolveRouteWithToll(info.coords.from, info.coords.to);
          if (cancelled) return;
          autoFilledRef.current = true;
          if (info.label) setRouteLabel(info.label);
          setDistance(km);
          if (estimatedToll > 0) {
            setToll(estimatedToll);
            setTollIsEstimated(true);
          }
          setStatus(S.DONE);
          return;
        }
```
Replace with:
```js
        if (info?.type === "waze-coords" && info.coords) {
          const { km, estimatedToll, geometry } = await resolveRouteWithToll(info.coords.from, info.coords.to);
          if (cancelled) return;
          autoFilledRef.current = true;
          if (info.label) setRouteLabel(info.label);
          setDistance(km);
          if (estimatedToll > 0) {
            setToll(estimatedToll);
            setTollIsEstimated(true);
          }
          if (geometry?.coordinates) {
            resolvedGeometry.current = { coordinates: geometry.coordinates, totalKm: km };
          }
          setStatus(S.DONE);
          return;
        }
```

- [ ] **Step 4: Add VIEW ROUTE button after the S.DONE banner**

In `app/components/TripForm.js`, find:
```jsx
        {/* No data */}
        {status === S.NO_DATA && (
```
Replace with:
```jsx
        {status === S.DONE && resolvedGeometry.current?.coordinates && (
          <button
            type="button"
            onClick={() => {
              if (mapVisible) {
                setMapVisible(false);
                setRouteGeometry(null);
              } else {
                setMapVisible(true);
                setRouteGeometry({
                  coordinates: resolvedGeometry.current.coordinates,
                  totalKm: resolvedGeometry.current.totalKm,
                });
              }
            }}
            className="mt-2 w-full font-orbitron text-[9px] font-bold tracking-widest py-2 border border-[#00E5FF]/25 rounded-lg text-[#00E5FF]/50 hover:text-[#00E5FF] hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/5 active:scale-[0.97] transition-all duration-200"
          >
            {mapVisible ? "[ HIDE ROUTE ]" : "[ VIEW ROUTE ↗ ]"}
          </button>
        )}

        {/* No data */}
        {status === S.NO_DATA && (
```

- [ ] **Step 5: Verify**

Paste a Waze link. After it resolves:
1. Green S.DONE banner appears
2. `[ VIEW ROUTE ↗ ]` button appears below it
3. Clicking it toggles label to `[ HIDE ROUTE ]` (no crash — page.js RouteMap wiring comes in Task 12)
4. Clearing the URL removes the button and resets state

- [ ] **Step 6: Commit**

```bash
git add app/components/TripForm.js
git commit -m "feat: TripForm VIEW ROUTE — geometry ref, mapVisible state, clearRoute reset"
```

---

### Task 11: RouteMap.js — Leaflet map component

**Files:**
- Create: `app/components/RouteMap.js`

Depends on Tasks 1 (leaflet installed) and 8 (interpolateOnRoute).

- [ ] **Step 1: Create RouteMap.js**

Create `app/components/RouteMap.js` with this content:

```jsx
"use client";

import { useEffect, useRef } from "react";
import { interpolateOnRoute } from "../utils/interpolateRoute";

export default function RouteMap({ routeGeometry, passengers }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!routeGeometry?.coordinates || !containerRef.current) return;

    let cancelled = false;

    async function init() {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const L = (await import("leaflet")).default;
      if (cancelled) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const coords = routeGeometry.coordinates;
      const latlngs = coords.map(([lon, lat]) => [lat, lon]);

      const polyline = L.polyline(latlngs, { color: "#00E5FF", weight: 3, opacity: 0.8 }).addTo(map);
      map.fitBounds(polyline.getBounds(), { padding: [24, 24] });

      const makeIcon = (label, bgColor) =>
        L.divIcon({
          className: "",
          html: `<div style="background:${bgColor};color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${label}</div>`,
          iconAnchor: [0, 10],
        });

      L.marker(latlngs[0], { icon: makeIcon("Start", "#00C853") }).addTo(map);
      L.marker(latlngs[latlngs.length - 1], { icon: makeIcon("End", "#D50000") }).addTo(map);

      const totalKm = routeGeometry.totalKm;
      const partials = (passengers ?? []).filter(
        (p) => p.mode === "partial" && (Number(p.start) > 0 || Number(p.end) > 0)
      );

      partials.forEach((p, idx) => {
        const name = p.name?.trim() || `P${idx + 1}`;
        const latOffset = idx * 0.0001;

        if (Number(p.start) > 0) {
          const pos = interpolateOnRoute(coords, totalKm, Number(p.start));
          L.marker([pos[0] + latOffset, pos[1]], {
            icon: makeIcon(`↑ ${name}`, "#00E5FF"),
          }).addTo(map);
        }

        if (Number(p.end) > 0) {
          const pos = interpolateOnRoute(coords, totalKm, Number(p.end));
          L.marker([pos[0] + latOffset, pos[1]], {
            icon: makeIcon(`↓ ${name}`, "#9B5DE5"),
          }).addTo(map);
        }
      });
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [routeGeometry, passengers]);

  return (
    <div
      className="glass rounded-xl overflow-hidden ring-1 ring-[#00E5FF]/20 mb-4 transition-opacity duration-300"
      style={{ height: "240px" }}
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/RouteMap.js
git commit -m "feat: RouteMap — Leaflet polyline + partial passenger markers on CartoDB Dark Matter"
```

---

### Task 12: page.js — routeGeometry state and RouteMap render

**Files:**
- Modify: `app/page.js`

Depends on Tasks 10 (TripForm VIEW ROUTE button) and 11 (RouteMap component).

- [ ] **Step 1: Add RouteMap import**

In `app/page.js`, find:
```js
import ShareBar from "./components/ShareBar";
```
Replace with:
```js
import ShareBar from "./components/ShareBar";
import RouteMap from "./components/RouteMap";
```

- [ ] **Step 2: Add routeGeometry state**

In `app/page.js`, find:
```js
  const [result, setResult] = useState({});
```
Replace with:
```js
  const [result, setResult] = useState({});
  const [routeGeometry, setRouteGeometry] = useState(null);
```

- [ ] **Step 3: Pass setRouteGeometry to TripForm**

In `app/page.js`, find:
```jsx
        <TripForm
          distance={distance}
          setDistance={setDistance}
          fuel={fuel}
          setFuel={setFuel}
          toll={toll}
          setToll={setToll}
        />
```
Replace with:
```jsx
        <TripForm
          distance={distance}
          setDistance={setDistance}
          fuel={fuel}
          setFuel={setFuel}
          toll={toll}
          setToll={setToll}
          setRouteGeometry={setRouteGeometry}
        />
```

- [ ] **Step 4: Render RouteMap conditionally between TripForm and PassengerTable**

In `app/page.js`, find:
```jsx
        <PassengerTable
```
Replace with:
```jsx
        {routeGeometry && (
          <RouteMap
            routeGeometry={routeGeometry}
            passengers={passengers}
            distance={distance}
          />
        )}

        <PassengerTable
```

- [ ] **Step 5: Full integration test**

With dev server running at `http://localhost:3000`:
1. Paste a Waze link with coordinates. Wait for S.DONE (green banner + distance filled).
2. Tap `[ VIEW ROUTE ↗ ]` — a 240px glass map appears below TripForm with a cyan polyline, green "Start" marker, red "End" marker.
3. Add a partial passenger with start km > 0 — tap VIEW ROUTE again (map re-renders) — a cyan ↑ marker appears at the board point.
4. Add a second partial passenger with different km values — both sets of markers appear, offset slightly to avoid overlap.
5. Tap `[ HIDE ROUTE ]` — map disappears.
6. Clear the URL input — map disappears and button disappears.
7. Type distance manually into the Dist field — no VIEW ROUTE button (geometry is null for manual entry).

- [ ] **Step 6: Commit**

```bash
git add app/page.js
git commit -m "feat: page.js RouteMap wiring — routeGeometry state, conditional render"
```

---

## Self-Review

**Spec coverage:**
- ✅ Gradient body background (Task 2)
- ✅ `.glass` utility + `@supports` fallback (Task 2)
- ✅ Remove `bg-[#070F34]` and grid backgroundImage from page.js (Task 3)
- ✅ Glass card — TripForm (Task 4); remove `.hud-card` and 2 corner spans (Task 4)
- ✅ Glass card — PassengerTable driver + passenger rows (Task 5); remove corner spans (Task 5)
- ✅ Glass card — Result total + per-person (Task 6); remove 4+1 corner spans (Task 6)
- ✅ Button hover system — scale, glow, duration-200 (Tasks 4–7)
- ✅ MemoSheet — no change required; existing backdrop/sheet works with new theme
- ✅ leaflet installed (Task 1)
- ✅ OSRM `overview=full&geometries=geojson` (Task 9)
- ✅ `geometry` returned from `resolveRouteWithToll` (Task 9)
- ✅ `resolvedGeometry` useRef in TripForm (Task 10)
- ✅ `mapVisible` useState in TripForm (Task 10)
- ✅ `clearRoute()` resets map state (Task 10)
- ✅ `[ VIEW ROUTE ↗ ]` / `[ HIDE ROUTE ]` toggle (Task 10)
- ✅ `interpolateOnRoute` Haversine utility (Task 8)
- ✅ RouteMap: CartoDB Dark Matter tiles (Task 11)
- ✅ RouteMap: cyan polyline weight 3 opacity 0.8 (Task 11)
- ✅ RouteMap: Start/End divIcon markers (Task 11)
- ✅ RouteMap: partial passenger ↑/↓ markers with lat offset for overlap (Task 11)
- ✅ RouteMap: `map.remove()` cleanup (Task 11)
- ✅ RouteMap: glass card container 240px (Task 11)
- ✅ `routeGeometry` state in page.js (Task 12)
- ✅ RouteMap rendered conditionally between TripForm and PassengerTable (Task 12)

**No placeholders:** All steps contain actual code.

**Type consistency:**
- `interpolateOnRoute(coordinates, totalKm, targetKm)` → called in RouteMap as `interpolateOnRoute(coords, totalKm, Number(p.start))` ✅
- `resolveRouteWithToll` returns `{ km, estimatedToll, geometry }` → destructured in TripForm as `{ km, estimatedToll, geometry }` ✅
- `setRouteGeometry` called with `{ coordinates, totalKm }` in TripForm → matches `useState(null)` in page.js ✅
- `routeGeometry.coordinates` and `routeGeometry.totalKm` used in RouteMap → matches shape set in TripForm ✅
