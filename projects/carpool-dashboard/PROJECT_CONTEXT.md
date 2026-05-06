# Carpool Dashboard — Project Context

## What It Is

A mobile-first web app that splits long-distance carpool costs fairly among passengers based on how far each person travels.

Built for Malaysian users taking highway trips (e.g. KL → Penang, KL → JB).

## Problem It Solves

When friends carpool, costs are rarely equal:
- Not everyone rides the full route
- Fuel and toll costs need to be shared proportionally
- Calculating this manually is error-prone and awkward

Carpool Split calculates each person's fair share automatically.

## Core User Flow

1. Paste a Google Maps or Waze link → distance auto-detected
2. Enter fuel cost and toll cost
3. Add passengers — name, start km, end km
4. App shows each person's share instantly
5. Copy a share link to send to the group

## Calculation Method

Segment-based fair split:

- The route is divided into segments at each passenger's boarding/alighting point
- Each segment cost is split equally among passengers present in that segment
- Result: passengers who ride longer pay more; partial-trip passengers pay less

This is more accurate than simple cost/headcount division.

## Tech Stack

- Next.js 16 App Router (webpack, not Turbopack — win32/ia32 platform)
- React 19
- Tailwind CSS v3
- lucide-react v1.14
- No backend, no database, no auth
- State shared via URL query params

## Key Files

```
app/
  page.js                    — main page, state management
  components/
    TripForm.js              — route URL input + distance/fuel/toll fields
    PassengerTable.js        — stacked passenger cards
    Result.js                — cost split display with progress bars
    ShareBar.js              — copy link button
  utils/
    calc.js                  — segment-based split calculation (core logic)
    encode.js                — URL state encoding/decoding
    parseRoute.js            — Google Maps / Waze URL parser
    resolveDistance.js       — Nominatim geocoding + OSRM routing
  api/
    resolve-url/route.js     — server-side short URL resolver (SSRF risk: needs hardening)
```

## Constraints

- No paid APIs — Nominatim + OSRM are free and public
- Must work offline for calculation (only route detection needs network)
- Must be shareable via a single URL with no login
