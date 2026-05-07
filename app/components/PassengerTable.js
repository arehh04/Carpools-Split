"use client";

import { Plus, X, User } from "lucide-react";

const NEONS = ["#00E5FF", "#FF007A", "#9B5DE5", "#00FF9F", "#F8E71C", "#00BFFF"];

export default function PassengerTable({ passengers, setPassengers, driverName, setDriverName, distance }) {
  const update = (i, field, val) =>
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));

  const remove = (i) =>
    setPassengers(passengers.filter((_, idx) => idx !== i));

  const hasDriver = driverName != null;
  const totalDist = Number(distance) || 0;

  // Driver occupies colour slot 0 (cyan); passengers shift +1 when driver is present
  const passengerNeon = (i) => NEONS[(hasDriver ? i + 1 : i) % NEONS.length];

  const totalUnits = (hasDriver ? 1 : 0) + passengers.length;

  return (
    <div className="mb-5">

      {/* ── Section header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-orbitron text-[10px] font-bold text-[#00E5FF]/70 tracking-widest">
          // CREW MANIFEST
        </h2>
        {totalUnits > 0 && (
          <span className="text-[10px] text-[#00E5FF]/30 tracking-wider tabular-nums">
            {totalUnits} UNIT{totalUnits !== 1 ? "S" : ""} LOADED
          </span>
        )}
      </div>

      {/* ── Driver slot ────────────────────────────────────────── */}
      <div className="mb-2.5">
        {!hasDriver ? (
          /* Inactive — tap-to-add */
          <button
            type="button"
            onClick={() => setDriverName("Driver")}
            className="w-full flex items-center gap-3 px-4 py-3.5 border border-dashed border-[#00E5FF]/30 bg-[#0d1525] hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/5 transition-all group"
          >
            <div
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[9px] font-bold font-orbitron text-[#00E5FF]/35 group-hover:text-[#00E5FF]/70 transition-all"
              style={{
                clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                border: "1px dashed rgba(0,229,255,0.35)",
                backgroundColor: "rgba(0,229,255,0.05)",
              }}
            >
              DRV
            </div>
            <div className="text-left">
              <p className="font-orbitron text-[10px] font-bold text-[#00E5FF]/30 group-hover:text-[#00E5FF]/60 tracking-widest transition-all">
                + REGISTER DRIVER
              </p>
              <p className="text-[9px] text-[#00E5FF]/25 mt-0.5 tracking-wider group-hover:text-[#00E5FF]/45 transition-all">
                Driver pays for the full route
              </p>
            </div>
          </button>
        ) : (
          /* Active driver card */
          <div
            className="relative bg-[#0d1525] px-4 py-4"
            style={{ borderLeft: "2px solid #00E5FF", borderBottom: "1px solid rgba(0,229,255,0.13)" }}
          >
            <span className="absolute top-0 right-0 w-3 h-3" style={{ borderTop: "1px solid rgba(0,229,255,0.4)", borderRight: "1px solid rgba(0,229,255,0.4)" }} />

            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[9px] font-bold font-orbitron"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  border: "1px solid #00E5FF",
                  color: "#00E5FF",
                  backgroundColor: "rgba(0,229,255,0.08)",
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
              >
                <X className="w-3.5 h-3.5 text-slate-700 group-hover:text-[#FF007A] transition-colors" />
              </button>
            </div>

            <div className="mt-2.5">
              <span
                className="font-orbitron text-[10px] font-bold tracking-widest inline-block px-3 py-1.5"
                style={{ color: "rgba(0,229,255,0.4)", border: "1px dashed rgba(0,229,255,0.15)", backgroundColor: "rgba(0,229,255,0.04)" }}
              >
                FULL ROUTE · 0 → {totalDist || "?"}km
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Passenger list ─────────────────────────────────────── */}
      <div className="space-y-2.5">

        {passengers.length === 0 && (
          <div className="border border-dashed border-[#00E5FF]/15 bg-[#0d1525]/60 py-6 text-center">
            <p className="text-xs text-slate-600">NO PASSENGERS LOGGED</p>
            <p className="text-[10px] text-slate-700 mt-0.5 tracking-wider">TAP BELOW TO ADD</p>
          </div>
        )}

        {passengers.map((p, i) => {
          const neon = passengerNeon(i);
          const isPartial = p.mode === "partial";
          const startNum = Number(p.start);
          const endNum = Number(p.end);
          const rideKm = isPartial ? Math.max(0, endNum - startNum) : totalDist;
          const kmInvalid = isPartial && endNum > 0 && startNum > 0 && endNum <= startNum;
          const initial = p.name?.trim() ? p.name.trim()[0].toUpperCase() : null;

          return (
            <div
              key={i}
              className="relative bg-[#0d1525] px-4 py-4"
              style={{ borderLeft: `2px solid ${neon}`, borderBottom: `1px solid ${neon}22` }}
            >
              <span
                className="absolute top-0 right-0 w-3 h-3"
                style={{ borderTop: `1px solid ${neon}60`, borderRight: `1px solid ${neon}60` }}
              />

              {/* Name row */}
              <div className="flex items-center gap-3">
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
                  className="flex-shrink-0 -mr-1 p-1.5 group"
                  title="Remove"
                  type="button"
                >
                  <X className="w-3.5 h-3.5 text-slate-700 group-hover:text-[#FF007A] transition-colors" />
                </button>
              </div>

              {/* ── FULL RIDE / PARTIAL toggle ───────────────── */}
              <div className="mt-3 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => update(i, "mode", "full")}
                  className="flex-1 font-orbitron text-[9px] font-bold py-2 tracking-widest border transition-all"
                  style={!isPartial
                    ? { borderColor: `${neon}`, color: neon, backgroundColor: `${neon}12`, textShadow: `0 0 8px ${neon}80`, boxShadow: `0 0 10px ${neon}20` }
                    : { borderColor: `${neon}20`, color: `${neon}40`, backgroundColor: "transparent" }
                  }
                >
                  FULL RIDE
                </button>
                <button
                  type="button"
                  onClick={() => update(i, "mode", "partial")}
                  className="flex-1 font-orbitron text-[9px] font-bold py-2 tracking-widest border transition-all"
                  style={isPartial
                    ? { borderColor: `${neon}`, color: neon, backgroundColor: `${neon}12`, textShadow: `0 0 8px ${neon}80`, boxShadow: `0 0 10px ${neon}20` }
                    : { borderColor: `${neon}20`, color: `${neon}40`, backgroundColor: "transparent" }
                  }
                >
                  PARTIAL
                </button>
              </div>

              {/* Full ride badge */}
              {!isPartial && totalDist > 0 && (
                <div className="mt-2">
                  <span
                    className="font-orbitron text-[10px] font-bold tracking-widest inline-block px-3 py-1"
                    style={{ color: `${neon}50`, border: `1px dashed ${neon}20`, backgroundColor: `${neon}0d` }}
                  >
                    FULL ROUTE · 0 → {totalDist}km
                  </span>
                </div>
              )}

              {/* Partial km inputs */}
              {isPartial && (
                <div className="mt-2.5">
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-0.5 flex-1 w-0">
                      <input
                        type="number"
                        min="0"
                        aria-label="Boards at km"
                        className="w-full text-sm text-center tabular-nums focus:outline-none transition-all"
                        style={{
                          color: neon,
                          padding: "8px",
                          border: `1px solid ${kmInvalid ? "#FF007A60" : `${neon}30`}`,
                          backgroundColor: "#050d1e",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = `${neon}90`)}
                        onBlur={(e) => (e.target.style.borderColor = kmInvalid ? "#FF007A60" : `${neon}30`)}
                        value={p.start}
                        onChange={(e) => update(i, "start", e.target.value)}
                        suppressHydrationWarning
                      />
                      <span className="text-[9px] text-slate-700 text-center tracking-widest">BOARDS km</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 mb-4">
                      <div className="w-3 h-px" style={{ backgroundColor: `${neon}30` }} />
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${neon}50` }} />
                      <div className="w-3 h-px" style={{ backgroundColor: `${neon}30` }} />
                    </div>

                    <div className="flex flex-col gap-0.5 flex-1 w-0">
                      <input
                        type="number"
                        min="0"
                        aria-label="Exits at km"
                        className="w-full text-sm text-center tabular-nums focus:outline-none transition-all"
                        style={{
                          color: neon,
                          padding: "8px",
                          border: `1px solid ${kmInvalid ? "#FF007A60" : `${neon}30`}`,
                          backgroundColor: "#050d1e",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = `${neon}90`)}
                        onBlur={(e) => (e.target.style.borderColor = kmInvalid ? "#FF007A60" : `${neon}30`)}
                        value={p.end}
                        onChange={(e) => update(i, "end", e.target.value)}
                        suppressHydrationWarning
                      />
                      <span className="text-[9px] text-slate-700 text-center tracking-widest">EXITS km</span>
                    </div>

                    <div className="flex-shrink-0 mb-4 w-14 flex justify-end">
                      {kmInvalid ? (
                        <span className="font-orbitron text-[10px] font-bold px-2 py-1.5 border border-[#FF007A]/40 text-[#FF007A]/80">
                          ERR
                        </span>
                      ) : rideKm > 0 ? (
                        <span
                          className="font-orbitron text-[10px] font-bold px-2 py-1.5 tabular-nums"
                          style={{ color: neon, backgroundColor: `${neon}10`, border: `1px solid ${neon}30`, textShadow: `0 0 6px ${neon}` }}
                        >
                          {rideKm}km
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-800 font-bold">—</span>
                      )}
                    </div>
                  </div>

                  {kmInvalid && (
                    <p className="mt-1 text-[9px] text-[#FF007A]/60 tracking-wider">
                      ⚠ EXIT KM MUST EXCEED BOARDS KM
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add passenger ──────────────────────────────────────── */}
      <button
        onClick={() => setPassengers([...passengers, { name: "", start: 0, end: 0, mode: "full" }])}
        className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 border border-dashed border-[#00E5FF]/20 font-orbitron text-[10px] font-bold text-[#00E5FF]/35 hover:text-[#00E5FF]/70 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/5 active:scale-[0.98] transition-all tracking-widest"
        type="button"
      >
        <Plus className="w-3.5 h-3.5" />
        + ADD PASSENGER
      </button>
    </div>
  );
}
