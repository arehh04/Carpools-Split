const COLORS = [
  { bar: "bg-violet-400", bg: "bg-violet-50", text: "text-violet-600", avatar: "bg-violet-400" },
  { bar: "bg-blue-400",   bg: "bg-blue-50",   text: "text-blue-600",   avatar: "bg-blue-400"   },
  { bar: "bg-emerald-400",bg: "bg-emerald-50", text: "text-emerald-600",avatar: "bg-emerald-400"},
  { bar: "bg-amber-400",  bg: "bg-amber-50",  text: "text-amber-600",  avatar: "bg-amber-400"  },
  { bar: "bg-rose-400",   bg: "bg-rose-50",   text: "text-rose-600",   avatar: "bg-rose-400"   },
  { bar: "bg-cyan-400",   bg: "bg-cyan-50",   text: "text-cyan-600",   avatar: "bg-cyan-400"   },
];

export default function Result({ result }) {
  const entries = Object.entries(result);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (!entries.length) return null;

  return (
    <div className="mb-4">
      {/* Total card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-5 mb-3 text-white shadow-md shadow-indigo-200">
        <p className="text-xs font-medium opacity-70 mb-1 uppercase tracking-wide">Total Trip Cost</p>
        <p className="text-4xl font-bold tracking-tight">RM {total.toFixed(2)}</p>
        <p className="text-xs opacity-60 mt-1">{entries.length} passenger{entries.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Per-person cards */}
      <div className="space-y-2">
        {entries.map(([name, val], i) => {
          const c = COLORS[i % COLORS.length];
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={name} className={`${c.bg} rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${c.avatar} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                    {name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-base font-bold ${c.text}`}>RM {val.toFixed(2)}</span>
                  <span className="text-xs text-slate-400">{pct}%</span>
                </div>
              </div>
              <div className="h-1 bg-white/70 rounded-full overflow-hidden">
                <div className={`h-full ${c.bar} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
