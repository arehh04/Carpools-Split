"use client";

import { Plus, X, User } from "lucide-react";

// Neon accent per passenger slot
const NEONS = ["#00E5FF", "#FF007A", "#9B5DE5", "#00FF9F", "#F8E71C", "#00BFFF"];

const kmInput =
  "w-0 flex-1 bg-[#050d1e] border border-[#1a2d50] text-sm text-center tabular-nums " +
  "focus:outline-none transition-all";

export default function PassengerTable({ passengers, setPassengers, driverName, setDriverName, distance }) {
  const update = (i, field, val) =>
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));

  const remove = (i) =>
    setPassengers(passengers.filter((_, idx) => idx !== i));

  const hasDriver = driverName != null;
  // Shift passenger colours by 1 when driver occupies slot 0 (cyan)
  const passengerNeon = (i) => NEONS[(hasDriver ? i + 1 : i) % NEONS.length];

  return (
    <div className="mb-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-orbitron text-[10px] font-bold text-[#00E5FF]/70 tracking-widest">
          // PASSENGERS
        </h2>
        <div className="flex items-center gap-3">
          {(hasDriver || passengers.length > 0) && (
            <span className="text-[10px] text-[#00E5FF]/30 tabular-nums tracking-wider">
              {(hasDriver ? 1 : 0) + passengers.length} UNIT{(hasDriver ? 1 : 0) + passengers.length !== 1 ? "S" : ""} LOADED
            </span>
          )}
          <button
            type="button"
            onClick={() => setDriverName(hasDriver ? null : "Driver")}
            className="font-orbitron text-[9px] font-bold tracking-widest px-2 py-1 border transition-all"
            style={hasDriver
              ? { borderColor: "#FF007A60", color: "#FF007A80", backgroundColor: "#FF007A10" }
              : { borderColor: "#00E5FF30", color: "#00E5FF50", backgroundColor: "transparent" }
            }
          >
            {hasDriver ? "- DRIVER" : "+ DRIVER"}
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Driver card */}
        {hasDriver && (
          <div
            className="relative bg-[#0d1525] px-4 py-4"
            style={{ borderLeft: "2px solid #00E5FF", borderBottom: "1px solid #00E5FF22" }}
          >
            <span className="absolute top-0 right-0 w-3 h-3" style={{ borderTop: "1px solid #00E5FF60", borderRight: "1px solid #00E5FF60" }} />
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[9px] font-bold font-orbitron"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  border: "1px solid #00E5FF",
                  color: "#00E5FF",
                  backgroundColor: "#00E5FF10",
                  textShadow: "0 0 8px #00E5FF",
                }}
              >
                DRV
              </div>
              <input
                className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm font-bold text-slate-300 placeholder-[#1a2d50] leading-none tracking-wide"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="DRIVER NAME"
                suppressHydrationWarning
              />
              <button
                onClick={() => setDriverName(null)}
                className="flex-shrink-0 -mr-1 p-1.5 group"
                title="Remove driver"
                type="button"
                suppressHydrationWarning
              >
                <X className="w-3.5 h-3.5 text-slate-700 group-hover:text-[#FF007A] transition-colors" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-[10px] font-bold font-orbitron px-3 py-1.5 tracking-widest"
                style={{ color: "#00E5FF60", border: "1px dashed #00E5FF20", backgroundColor: "#00E5FF05" }}
              >
                FULL ROUTE · 0 → {Number(distance) || "?"}km
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasDriver && passengers.length === 0 && (
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
          const neon = passengerNeon(i);
          const startNum = Number(p.start);
          const endNum = Number(p.end);
          const rideKm = Math.max(0, endNum - startNum);
          const kmInvalid = endNum > 0 && startNum > 0 && endNum <= startNum;
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

                {/* Km badge / error */}
                <div className="flex-shrink-0 mb-4 w-14 flex justify-end">
                  {kmInvalid ? (
                    <span className="text-[10px] font-bold px-2 py-1.5 border border-[#FF007A]/40 text-[#FF007A]/80"
                          title="Exit km must be greater than boards km">
                      ERR
                    </span>
                  ) : rideKm > 0 ? (
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

              {/* Inline validation hint */}
              {kmInvalid && (
                <p className="mt-1.5 text-[9px] text-[#FF007A]/60 tracking-wider">
                  ⚠ EXIT KM MUST BE GREATER THAN BOARDS KM
                </p>
              )}
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
