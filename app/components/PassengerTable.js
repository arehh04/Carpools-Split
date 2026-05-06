"use client";

import { Plus, X, User, ArrowRight } from "lucide-react";

const COLORS = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
];

export default function PassengerTable({ passengers, setPassengers }) {
  const update = (i, field, val) =>
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));

  const remove = (i) =>
    setPassengers(passengers.filter((_, idx) => idx !== i));

  const kmInput =
    "w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center text-slate-700 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300";

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm font-semibold text-slate-600">Passengers</h2>
        {passengers.length > 0 && (
          <span className="text-xs text-slate-400">{passengers.length} added</span>
        )}
      </div>

      <div className="space-y-3">
        {passengers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200/60 bg-white/30 backdrop-blur-sm p-6 text-center">
            <p className="text-sm text-slate-400">No passengers yet</p>
            <p className="text-xs text-slate-300 mt-0.5">Add someone to split the trip cost</p>
          </div>
        )}

        {passengers.map((p, i) => (
          <div
            key={i}
            className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-md shadow-indigo-50/60 p-5"
          >
            {/* ── Name row ─────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                {p.name?.trim()
                  ? p.name.trim()[0].toUpperCase()
                  : <User className="w-4 h-4" />}
              </div>
              <input
                className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm font-semibold text-slate-700 placeholder-slate-300"
                value={p.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Passenger name"
                suppressHydrationWarning
              />
              <button
                onClick={() => remove(i)}
                className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 hover:bg-red-50 flex items-center justify-center transition-colors group"
                title="Remove passenger"
                type="button"
                suppressHydrationWarning
              >
                <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400" />
              </button>
            </div>

            {/* ── Km row ───────────────────────────────────────── */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                  Boards
                </p>
                <input
                  type="number"
                  min="0"
                  className={kmInput}
                  value={p.start}
                  onChange={(e) => update(i, "start", e.target.value)}
                  suppressHydrationWarning
                />
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-300 mb-2.5 flex-shrink-0" />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                  Alights
                </p>
                <input
                  type="number"
                  min="0"
                  className={kmInput}
                  value={p.end}
                  onChange={(e) => update(i, "end", e.target.value)}
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setPassengers([...passengers, { name: "", start: 0, end: 0 }])}
        className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-dashed border-indigo-200/60 text-sm font-medium text-indigo-500 hover:bg-indigo-50/80 hover:border-indigo-300/70 transition-colors active:scale-[0.98]"
        type="button"
        suppressHydrationWarning
      >
        <Plus className="w-4 h-4" />
        Add Passenger
      </button>
    </div>
  );
}
