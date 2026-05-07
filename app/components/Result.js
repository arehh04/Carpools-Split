"use client";

import { useState, useMemo, useCallback } from "react";
import MemoSheet from "./MemoSheet";

const NEONS = ["#00E5FF", "#FF007A", "#9B5DE5", "#00FF9F", "#F8E71C", "#00BFFF"];

export default function Result({ result, distance, fuel, toll }) {
  const [memoOpen, setMemoOpen] = useState(false);
  const receiptDate = useMemo(
    () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
    []
  );
  const handleMemoClose = useCallback(() => setMemoOpen(false), []);
  const entries = Object.entries(result);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (!entries.length) return null;

  return (
    <div className="mb-6">
      {/* Total card */}
      <div className="relative glass rounded-2xl p-6 mb-4">

        <p className="font-orbitron text-[9px] text-[#00E5FF]/50 tracking-[0.3em] uppercase mb-2">
          // Total Expenditure
        </p>
        <p
          className="font-orbitron text-4xl font-black text-[#00E5FF]"
          style={{ textShadow: "0 0 20px rgba(0,229,255,0.6), 0 0 40px rgba(0,229,255,0.2)" }}
        >
          RM {total.toFixed(2)}
        </p>
        <p className="text-[10px] text-[#00E5FF]/30 mt-2 tracking-widest">
          {entries.length} CREW MEMBER{entries.length !== 1 ? "S" : ""} · COST MATRIX COMPUTED
        </p>
      </div>

      {/* Per-person rows */}
      <div className="space-y-2.5">
        {entries.map(([name, val], i) => {
          const neon = NEONS[i % NEONS.length];
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          const initial = name[0]?.toUpperCase() ?? "?";

          return (
            <div
              key={name}
              className="relative glass rounded-xl px-4 py-4"
              style={{ borderLeft: `2px solid ${neon}` }}
            >

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
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
                    {initial}
                  </div>
                  <span className="text-sm font-bold text-slate-300 tracking-wide">{name}</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span
                    className="font-orbitron text-lg font-black tabular-nums"
                    style={{ color: neon, textShadow: `0 0 10px ${neon}80` }}
                  >
                    RM {val.toFixed(2)}
                  </span>
                  <span
                    className="text-[10px] font-bold tabular-nums"
                    style={{ color: `${neon}60` }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-0.5 bg-[#1a2545] overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: neon,
                    boxShadow: `0 0 6px ${neon}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Receipt footer */}
      <div className="mt-4 px-1">
        <p aria-hidden="true" className="font-orbitron text-[9px] text-[#00E5FF]/15 tracking-widest text-center mb-3 select-none">
          {"- ".repeat(20)}
        </p>

        <div className="flex justify-between font-orbitron text-[10px] text-[#00E5FF]/35 tracking-wider mb-1">
          <span>DISTANCE&nbsp;&nbsp;{Number(distance) || 0}km</span>
          {Number(fuel) > 0 && (
            <span>FUEL&nbsp;&nbsp;RM {Number(fuel).toFixed(2)}</span>
          )}
        </div>

        {Number(toll) > 0 && (
          <div className="font-orbitron text-[10px] text-[#00E5FF]/35 tracking-wider mb-3">
            TOLL&nbsp;&nbsp;RM {Number(toll).toFixed(2)}
          </div>
        )}

        <p aria-hidden="true" className="font-orbitron text-[9px] text-[#00E5FF]/15 tracking-widest text-center mb-3 select-none">
          {"- ".repeat(20)}
        </p>

        <p className="font-orbitron text-[9px] text-[#00E5FF]/20 tracking-widest text-center mb-3">
          {receiptDate}
        </p>

        <button
          type="button"
          onClick={() => setMemoOpen(true)}
          className="w-full font-orbitron text-[10px] font-bold tracking-widest py-3 border border-dashed border-[#00E5FF]/25 rounded-lg text-[#00E5FF]/40 hover:text-[#00E5FF]/70 hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/10 hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(0,229,255,0.45)] active:scale-[0.97] transition-all duration-200"
        >
          SHARE MEMO ↑
        </button>
      </div>

      <MemoSheet
        open={memoOpen}
        onClose={handleMemoClose}
        result={result}
        distance={distance}
        fuel={fuel}
        toll={toll}
      />
    </div>
  );
}
