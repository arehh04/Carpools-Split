"use client";

import { useEffect } from "react";

const PHRASES = [
  "Rego saeng saeng! 💸",
  "Member member je ni 😂",
  "Jangan kedekut tau! 🙈",
  "Duit minyak kena settle! ⛽",
  "Kawan baik, hutang clear! 🫂",
  "Sharing is caring bestie! 🤝",
];

export default function MemoSheet({ open, onClose, result, distance, fuel, toll }) {
  const entries = Object.entries(result);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const phrase = PHRASES[Math.floor(total * 7) % PHRASES.length];
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          backgroundColor: open ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-[#FFFDF5] p-6"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🚗</span>
          <span className="text-lg font-bold text-gray-800 tracking-tight">
            CARPOOL//SPLIT
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          {dateStr} · {Number(distance) || 0}km
        </p>

        <hr className="border-gray-200 mb-4" />

        {/* Per-person rows */}
        <div className="space-y-2 mb-4">
          {entries.map(([name, val]) => (
            <div key={name} className="flex justify-between text-sm">
              <span className="text-gray-700 truncate max-w-[60%]">{name}</span>
              <span className="font-semibold text-gray-800 tabular-nums">
                RM {val.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <hr className="border-gray-200 mb-4" />

        {/* Total */}
        <div className="flex justify-between text-sm font-bold text-gray-800 mb-4">
          <span>TOTAL</span>
          <span className="tabular-nums">RM {total.toFixed(2)}</span>
        </div>

        {/* Fuel / Toll breakdown */}
        {(Number(fuel) > 0 || Number(toll) > 0) && (
          <div className="text-xs text-gray-400 mb-4 space-y-0.5">
            {Number(fuel) > 0 && (
              <div className="flex justify-between">
                <span>Fuel</span>
                <span>RM {Number(fuel).toFixed(2)}</span>
              </div>
            )}
            {Number(toll) > 0 && (
              <div className="flex justify-between">
                <span>Toll</span>
                <span>RM {Number(toll).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <hr className="border-gray-200 mb-4" />

        {/* Slang line */}
        <p className="text-sm italic text-gray-400 text-center mb-6">{phrase}</p>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 text-sm text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          tap to close
        </button>
      </div>
    </>
  );
}
