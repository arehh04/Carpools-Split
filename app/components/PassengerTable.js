"use client";

import { Plus, X, User } from "lucide-react";

// Neon accent per passenger slot
const NEONS = ["#00E5FF", "#FF007A", "#9B5DE5", "#00FF9F", "#F8E71C", "#00BFFF"];

const kmInput =
  "w-0 flex-1 bg-[#050d1e] border border-[#1a2d50] text-sm text-center tabular-nums " +
  "focus:outline-none transition-all";

export default function PassengerTable({ passengers, setPassengers }) {
  const update = (i, field, val) =>
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));

  const remove = (i) =>
    setPassengers(passengers.filter((_, idx) => idx !== i));

  return (
    <div className="mb-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-orbitron text-[10px] font-bold text-[#00E5FF]/70 tracking-widest">
          // PASSENGERS
        </h2>
        {passengers.length > 0 && (
          <span className="text-[10px] text-[#00E5FF]/30 tabular-nums tracking-wider">
            {passengers.length} UNIT{passengers.length !== 1 ? "S" : ""} LOADED
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {/* Empty state */}
        {passengers.length === 0 && (
          <div className="border border-dashed border-[#00E5FF]/15 bg-[#0d1525]/60 py-8 text-center">
            <div
              className="w-10 h-10 border border-[#00E5FF]/20 flex items-center justify-center mx-auto mb-3"
              style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
            >
              <User className="w-4 h-4 text-[#00E5FF]/20" />
            </div>
            <p className="text-xs text-slate-600">NO PASSENGERS LOGGED</p>
            <p className="text-[10px] text-slate-700 mt-1 tracking-wider">INITIALIZE BELOW</p>
          </div>
        )}

        {passengers.map((p, i) => {
          const neon = NEONS[i % NEONS.length];
          const rideKm = Math.max(0, Number(p.end) - Number(p.start));
          const initial = p.name?.trim() ? p.name.trim()[0].toUpperCase() : null;

          return (
            <div
              key={i}
              className="relative bg-[#0d1525] px-4 py-4"
              style={{ borderLeft: `2px solid ${neon}`, borderBottom: `1px solid ${neon}22` }}
            >
              {/* Glowing top-right corner accent */}
              <span
                className="absolute top-0 right-0 w-3 h-3"
                style={{ borderTop: `1px solid ${neon}60`, borderRight: `1px solid ${neon}60` }}
              />

              {/* Name row */}
              <div className="flex items-center gap-3">
                {/* Avatar — cut corner box */}
                <div
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    border: `1px solid ${neon}`,
                    color: neon,
                    backgroundColor: `${neon}10`,
                    fontFamily: "var(--font-orbitron, sans-serif)",
                    textShadow: `0 0 8px ${neon}`,
                  }}
                >
                  {initial ?? <User className="w-3.5 h-3.5 opacity-60" />}
                </div>

                <input
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm font-bold text-slate-300 placeholder-[#1a2d50] leading-none tracking-wide"
                  value={p.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                  placeholder="PASSENGER NAME"
                  suppressHydrationWarning
                />

                <button
                  onClick={() => remove(i)}
                  className="flex-shrink-0 -mr-1 p-1.5 transition-colors group"
                  title="Remove"
                  type="button"
                  suppressHydrationWarning
                >
                  <X className="w-3.5 h-3.5 text-slate-700 group-hover:text-[#FF007A] transition-colors" />
                </button>
              </div>

              {/* Km journey row */}
              <div className="mt-3 flex items-end gap-2">
                <div className="flex flex-col gap-0.5 flex-1 w-0">
                  <input
                    type="number"
                    min="0"
                    aria-label="Boards at km"
                    className={kmInput}
                    style={{
                      color: neon,
                      padding: "6px 8px",
                      borderColor: `${neon}30`,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = `${neon}80`)}
                    onBlur={(e) => (e.target.style.borderColor = `${neon}30`)}
                    value={p.start}
                    onChange={(e) => update(i, "start", e.target.value)}
                    suppressHydrationWarning
                  />
                  <span className="text-[9px] text-slate-700 text-center tracking-widest uppercase">boards</span>
                </div>

                {/* Connector */}
                <div className="flex items-center gap-1 flex-shrink-0 mb-4">
                  <div className="w-3 h-px" style={{ backgroundColor: `${neon}30` }} />
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${neon}50` }} />
                  <div className="w-3 h-px" style={{ backgroundColor: `${neon}30` }} />
                </div>

                <div className="flex flex-col gap-0.5 flex-1 w-0">
                  <input
                    type="number"
                    min="0"
                    aria-label="Alights at km"
                    className={kmInput}
                    style={{
                      color: neon,
                      padding: "6px 8px",
                      borderColor: `${neon}30`,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = `${neon}80`)}
                    onBlur={(e) => (e.target.style.borderColor = `${neon}30`)}
                    value={p.end}
                    onChange={(e) => update(i, "end", e.target.value)}
                    suppressHydrationWarning
                  />
                  <span className="text-[9px] text-slate-700 text-center tracking-widest uppercase">exits</span>
                </div>

                {/* Km badge */}
                <div className="flex-shrink-0 mb-4 w-14 flex justify-end">
                  {rideKm > 0 ? (
                    <span
                      className="text-[10px] font-bold px-2 py-1.5 tabular-nums font-orbitron"
                      style={{
                        color: neon,
                        backgroundColor: `${neon}10`,
                        border: `1px solid ${neon}30`,
                        textShadow: `0 0 6px ${neon}`,
                      }}
                    >
                      {rideKm}km
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-800 font-bold">—</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <button
        onClick={() => setPassengers([...passengers, { name: "", start: 0, end: 0 }])}
        className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 border border-dashed border-[#00E5FF]/20 text-xs font-bold text-[#00E5FF]/40 hover:text-[#00E5FF] hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/5 hover:shadow-[0_0_12px_rgba(0,229,255,0.1)] active:scale-[0.98] transition-all tracking-widest font-orbitron"
        type="button"
        suppressHydrationWarning
      >
        <Plus className="w-3.5 h-3.5" />
        + ADD PASSENGER
      </button>
    </div>
  );
}
