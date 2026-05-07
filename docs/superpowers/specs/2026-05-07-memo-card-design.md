# Memo Card — Design Spec
Date: 2026-05-07
Feature: B — Summary / Cute Memo Card

---

## Overview

Extend the Result section with two outputs:
1. A **receipt footer** (inline, dark cyberpunk) that always appears once amounts are computed.
2. A **memo card bottom sheet** (light/pastel, cute) that slides up when the user taps "SHARE MEMO".

Both show the full trip breakdown (distance, fuel, toll, per-person amounts) plus a deterministic Malay slang line.

---

## Trigger

Both outputs auto-appear as soon as `result` is non-empty (same guard already used to render the Result section). No additional user action required to see the receipt footer. The memo card requires tapping "SHARE MEMO ↑".

---

## Receipt Footer (inline, extends Result.js)

Appended below the existing per-person rows inside `Result.js`.

**Content:**
- Dashed separator: `- - - - - - - - - - - - - - -`
- Trip breakdown grid (two columns):
  - `DISTANCE  Xkm` | `FUEL  RM X.XX` (on one line)
  - `TOLL  RM X.XX` (only shown if toll > 0)
- Second dashed separator
- Date string: `DD MMM YYYY` (formatted client-side from `new Date()`)
- "SHARE MEMO ↑" button — full width, dashed border, cyberpunk style, positioned after the date line (last item in the footer)

**Visibility rules:**
- Toll row hidden if `Number(toll) === 0`
- Fuel row hidden if `Number(fuel) === 0`
- Entire footer only renders when `Object.keys(result).length > 0`

**Styling:** Inherits existing dark theme (`bg-[#0d1525]`, `font-orbitron`, `text-[#00E5FF]`). Dashes rendered as a monospace string, not a border.

---

## Memo Card Bottom Sheet (MemoSheet.js)

A new component rendered inside `Result.js`, controlled by local `memoOpen` state.

### Overlay & Animation

- Fixed full-screen backdrop: `position: fixed`, `inset: 0`, `bg-black/60`, `z-50`
- Clicking the backdrop closes the sheet
- Card panel: fixed to bottom, `max-h-[80vh]`, `overflow-y-auto`, `rounded-t-2xl`
- Slide animation: CSS `transform: translateY(100%)` → `translateY(0)`, `transition: transform 300ms ease-out`
- `Escape` key closes the sheet (desktop)

### Card Visual Style

- Background: `#FFFDF5` (warm cream)
- Rounded top corners: `rounded-t-2xl`
- Padding: `p-6`
- Font: system font stack (sans-serif) — deliberately breaks from Orbitron to signal "cute" mode

### Card Content (top to bottom)

1. **Header row:** 🚗 emoji + `CARPOOL//SPLIT` title (bold, dark)
2. **Trip meta:** `DD MMM YYYY · Xkm` (muted grey)
3. **Divider:** thin grey line
4. **Passenger rows:** name (left) + `RM X.XX` (right), one row per result entry
5. **Divider**
6. **Total row:** `TOTAL` (left, bold) + `RM X.XX` (right, bold)
7. **Divider**
8. **Slang line:** italic, muted, centred — deterministically selected (see below)
9. **Close button:** full-width, ghost style, `tap to close`

### Malay Slang Phrases

Stored as a fixed array in `MemoSheet.js`. Selection: `phrases[Math.floor(total * 7) % phrases.length]` — deterministic per trip total so the same trip always shows the same phrase.

```js
const PHRASES = [
  "Rego saeng saeng! 💸",
  "Member member je ni 😂",
  "Jangan kedekut tau! 🙈",
  "Duit minyak kena settle! ⛽",
  "Kawan baik, hutang clear! 🫂",
  "Sharing is caring bestie! 🤝",
];
```

---

## Component Architecture

```
page.js
  └─ Result.js  (result, distance, fuel, toll)   ← add distance/fuel/toll props
       ├─ [existing per-person rows]
       ├─ [receipt footer — inline JSX]
       └─ MemoSheet.js  (open, onClose, result, distance, fuel, toll)
```

### Props changes

**Result.js** — new props added:
```js
{ result, distance, fuel, toll }
```

**MemoSheet.js** — new component, props:
```js
{ open, onClose, result, distance, fuel, toll }
```

### State

`memoOpen` — local boolean state inside `Result.js`. Set `true` by "SHARE MEMO" button, `false` by backdrop click, Escape key, or close button.

---

## Edge Cases

| Situation | Behaviour |
|---|---|
| Result is empty | Receipt footer and SHARE MEMO button do not render |
| `toll === 0` | Toll row omitted from receipt footer and memo card |
| `fuel === 0` | Fuel row omitted from receipt footer and memo card |
| Long passenger name | Truncated with ellipsis (`truncate`) — layout does not break |
| 10+ passengers | Memo card body scrolls within `max-h-[80vh]` |
| Tap backdrop | Closes sheet |
| Escape key | Closes sheet (desktop) |
| No JS transitions | Sheet appears/disappears instantly — no broken state |

---

## Files Touched

| File | Change |
|---|---|
| `app/components/Result.js` | Add `distance`, `fuel`, `toll` props; add receipt footer JSX; add `memoOpen` state; render `MemoSheet` |
| `app/components/MemoSheet.js` | New file |
| `app/page.js` | Pass `distance`, `fuel`, `toll` to `<Result>` |

No new npm dependencies.

---

## Out of Scope

- Screenshot-to-image export (html2canvas) — not in this spec
- Editable slang line — not in this spec
- Route label in memo (requires lifting TripForm state) — not in this spec
- Real-time sync — separate spec (D+E)
