"use client";

import { Plus, X, User } from "lucide-react";

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

  const kmInput = "w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300";

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold text-slate-600">Passengers</h2>
        {passengers.length > 0 && (
          <span className="text-xs text-slate-400">{passengers.length} added</span>
        )}
      </div>

      <div className="space-y-2">
        {passengers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/30 p-6 text-center">
            <p className="text-sm text-slate-400">No passengers yet</p>
            <p className="text-xs text-slate-300 mt-0.5">Tap below to add someone</p>
          </div>
        )}

        {passengers.map((p, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-sm p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                {p.name?.trim() ? p.name.trim()[0].toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <input
                className="flex-1 bg-transparent border-0 outline-none text-sm font-medium text-slate-700 placeholder-slate-300"
                value={p.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Passenger name"
                suppressHydrationWarning
              />
              <button
                onClick={() => remove(i)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-red-50 flex items-center justify-center flex-shrink-0 transition-colors group"
                title="Remove"
                suppressHydrationWarning
              >
                <X className="w-3 h-3 text-slate-400 group-hover:text-red-400" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 pl-12">
              <input
                type="number"
                min="0"
                className={kmInput}
                value={p.start}
                onChange={(e) => update(i, "start", e.target.value)}
                suppressHydrationWarning
              />
              <span className="text-xs text-slate-300">→</span>
              <input
                type="number"
                min="0"
                className={kmInput}
                value={p.end}
                onChange={(e) => update(i, "end", e.target.value)}
                suppressHydrationWarning
              />
              <span className="text-xs text-slate-400">km</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setPassengers([...passengers, { name: "", start: 0, end: 0 }])}
        className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-indigo-200 text-sm font-medium text-indigo-500 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
        suppressHydrationWarning
      >
        <Plus className="w-4 h-4" />
        Add Passenger
      </button>
    </div>
  );
}
