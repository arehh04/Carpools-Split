# Carpool Dashboard — UI Direction

## Design Philosophy

The app should feel like a modern fintech tool — not a school project.

Reference feel: Apple Wallet simplicity + Splitwise usability.

A user should understand what the app does in under 5 seconds without any explanation.

---

## Visual Language

### Background
Soft gradient across the full page:
```
bg-gradient-to-br from-indigo-50 via-white to-purple-50
```

### Cards
- `rounded-3xl` (large rounding — iOS feel)
- `bg-white/60` with `backdrop-blur-sm` (glassmorphism)
- `border border-white/80` (soft white border)
- `shadow-sm` (no harsh shadows)

### Typography
- Section labels: `text-xs font-semibold uppercase tracking-wider text-slate-400`
- Body: `text-sm text-slate-700`
- Primary numbers: `text-base font-bold` or larger

### Inputs
- `bg-white/80 border border-slate-200 rounded-xl`
- Focus: `focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400`
- Unit labels (km, RM) as absolute-positioned overlays — not separate elements

### Buttons
- Primary action: `bg-slate-800 rounded-2xl` (Share Trip)
- Destructive: icon-only, `text-slate-300 hover:text-red-400`
- Add action: dashed border, `border-indigo-200 text-indigo-500`

---

## Layout

- `max-w-[480px] mx-auto` — centered column, mobile-first
- `py-8 px-4` page padding
- Desktop = same layout, just centered
- No sidebars, no multi-column, no wide dashboard

---

## Component Structure

```
Header          — Car icon + "Carpool Split" + subtitle
TripForm        — Route URL input → Distance / Fuel / Toll (3-col grid)
PassengerTable  — Stacked avatar cards (NOT a table)
Result          — Gradient total card + colored per-person cards
ShareBar        — Full-width dark copy button
```

---

## Color System

Passenger avatars and result cards cycle through:
- Violet → Blue → Emerald → Amber → Rose → Cyan

The indigo/purple gradient is reserved for the brand and total cost card.

---

## UX Rules

- NO click-to-calculate — all results update live
- NO modals
- NO tables for passengers
- Empty state shown when no passengers added
- Distance field highlights indigo when auto-filled from map link
- Spinner shown while route is being resolved

---

## What NOT To Do

- Full-width enterprise dashboard layouts
- Heavy animations or page transitions
- Cluttered information density
- Dark mode (not in scope for MVP)
