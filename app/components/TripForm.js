"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, AlertCircle, Loader2, CheckCircle2, ArrowRight, X } from "lucide-react";
import { parseRouteLink, isMapLink } from "../utils/parseRoute";
import { resolveRouteDistance, resolveRouteWithToll } from "../utils/resolveDistance";

const S = { IDLE: "idle", RESOLVING: "resolving", DONE: "done", NO_DATA: "no_data", ERROR: "error" };

const inputBase =
  "w-full bg-[#050d1e] border border-[#00E5FF]/20 text-sm text-slate-300 transition-all " +
  "focus:outline-none focus:border-[#00E5FF]/60 focus:shadow-[0_0_8px_rgba(0,229,255,0.2)] placeholder-[#00E5FF]/20";

export default function TripForm({ distance, setDistance, fuel, setFuel, toll, setToll }) {
  const [routeUrl, setRouteUrl]       = useState("");
  const [routeLabel, setRouteLabel]   = useState(null);
  const [status, setStatus]           = useState(S.IDLE);
  const [tollIsEstimated, setTollIsEstimated] = useState(false);

  const autoFilledRef = useRef(false);

  function clearRoute() {
    if (autoFilledRef.current) {
      setDistance(0);
      setToll(0);
      autoFilledRef.current = false;
    }
    setTollIsEstimated(false);
    setRouteUrl("");
    setRouteLabel(null);
    setStatus(S.IDLE);
  }

  useEffect(() => {
    const trimmed = routeUrl.trim();

    if (!trimmed || !isMapLink(trimmed)) {
      if (autoFilledRef.current) {
        setDistance(0);
        setToll(0);
        autoFilledRef.current = false;
      }
      setStatus(S.IDLE);
      setRouteLabel(null);
      return;
    }

    let cancelled = false;
    autoFilledRef.current = false;
    setStatus(S.RESOLVING);
    setRouteLabel(null);

    async function run() {
      try {
        let info = parseRouteLink(trimmed);

        if (info?.type === "google-short") {
          const r    = await fetch(`/api/resolve-url?url=${encodeURIComponent(trimmed)}`);
          const body = await r.json();

          if (!r.ok || body.error || !body.finalUrl) {
            if (!cancelled) setStatus(S.ERROR);
            return;
          }

          const resolved = parseRouteLink(body.finalUrl);
          if (resolved) info = resolved;
        }

        if (cancelled) return;

        if (info?.type === "waze-coords" && info.coords) {
          const { km, estimatedToll } = await resolveRouteWithToll(info.coords.from, info.coords.to);
          if (cancelled) return;
          autoFilledRef.current = true;
          if (info.label) setRouteLabel(info.label);
          setDistance(km);
          if (estimatedToll > 0) {
            setToll(estimatedToll);
            setTollIsEstimated(true);
          }
          setStatus(S.DONE);
          return;
        }

        if (info?.destination) {
          if (!info.origin) {
            if (!cancelled) setStatus(S.NO_DATA);
            return;
          }
          if (info.label) setRouteLabel(info.label);
          const km = await resolveRouteDistance(info.origin, info.destination);
          if (cancelled) return;
          autoFilledRef.current = true;
          setDistance(km);
          setStatus(S.DONE);
          return;
        }

        if (!cancelled) setStatus(S.NO_DATA);
      } catch {
        if (!cancelled) setStatus(S.ERROR);
      }
    }

    const t = setTimeout(run, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [routeUrl, setDistance, setToll]);

  const routeParts    = routeLabel ? routeLabel.split(" → ") : [];
  const hasRouteParts = routeParts.length === 2;

  const distanceHighlight = status === S.DONE
    ? "border-[#00FF9F]/50 shadow-[0_0_8px_rgba(0,255,159,0.2)]"
    : "";

  return (
    <div className="hud-card relative border border-[#00E5FF]/20 bg-[#0d1525] p-6 mb-4">
      {/* Extra corner brackets (top-right, bottom-left) */}
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00E5FF]" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00E5FF]" />

      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <MapPin
          className="w-3.5 h-3.5 text-[#00E5FF]"
          style={{ filter: "drop-shadow(0 0 4px #00E5FF)" }}
        />
        <h2 className="font-orbitron text-[10px] font-bold text-[#00E5FF] tracking-widest">
          // TRIP PARAMETERS
        </h2>
      </div>

      {/* Route URL input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="url"
            className={`${inputBase} px-3 py-2.5 ${routeUrl ? "pr-8" : ""}`}
            placeholder="Paste Google Maps or Waze link…"
            value={routeUrl}
            onChange={(e) => setRouteUrl(e.target.value)}
            suppressHydrationWarning
          />
          {routeUrl && (
            <button
              type="button"
              onClick={clearRoute}
              title="Clear route"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#1a2545] hover:bg-[#FF007A]/20 flex items-center justify-center transition-colors"
              suppressHydrationWarning
            >
              <X className="w-2.5 h-2.5 text-slate-500 hover:text-[#FF007A]" />
            </button>
          )}
        </div>

        {/* Resolving */}
        {status === S.RESOLVING && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2 flex items-center gap-2 border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-3.5 py-2.5"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00E5FF] flex-shrink-0" />
            <p className="text-xs text-[#00E5FF]/60">Scanning route data…</p>
          </div>
        )}

        {/* Done */}
        {status === S.DONE && (
          <div className="mt-2 border border-[#00FF9F]/30 bg-[#00FF9F]/5 px-3.5 py-2.5">
            {hasRouteParts ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9F] flex-shrink-0" />
                <span className="text-xs font-medium text-[#00FF9F]/80 truncate min-w-0">
                  {routeParts[0]}
                </span>
                <ArrowRight className="w-3 h-3 text-[#00FF9F]/40 flex-shrink-0" />
                <span className="text-xs font-medium text-[#00FF9F] truncate flex-1 min-w-0">
                  {routeParts[1]}
                </span>
                <span className="text-xs font-bold text-[#00FF9F] flex-shrink-0 pl-1 font-orbitron">
                  {distance}km
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9F] flex-shrink-0" />
                <span className="text-xs text-[#00FF9F]/80">
                  {routeLabel ?? "Route detected"}
                </span>
                <span className="text-xs text-[#00FF9F]/50 ml-auto">{distance}km · synced</span>
              </div>
            )}
          </div>
        )}

        {/* No data */}
        {status === S.NO_DATA && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2 flex items-start gap-2 border border-[#F8E71C]/30 bg-[#F8E71C]/5 px-3.5 py-2.5"
          >
            <AlertCircle className="w-3.5 h-3.5 text-[#F8E71C] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#F8E71C]/70">
              Map link detected — no route data available. Enter distance manually below.
            </p>
          </div>
        )}

        {/* Error */}
        {status === S.ERROR && (
          <div
            role="alert"
            className="mt-2 flex items-start gap-2 border border-[#FF007A]/30 bg-[#FF007A]/5 px-3.5 py-2.5"
          >
            <AlertCircle className="w-3.5 h-3.5 text-[#FF007A] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#FF007A]/70">
              Signal lost — check connection or enter distance manually below.
            </p>
          </div>
        )}
      </div>

      {/* Distance / Fuel / Toll */}
      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="text-[10px] font-bold text-[#00E5FF]/50 tracking-widest block mb-1 uppercase">
            Dist
          </span>
          <div className="relative">
            <input
              type="number"
              min="0"
              className={`${inputBase} px-3 py-2.5 pr-7 text-center tabular-nums ${distanceHighlight}`}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              suppressHydrationWarning
            />
            {status === S.DONE ? (
              <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#00FF9F] pointer-events-none" />
            ) : (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#00E5FF]/30 pointer-events-none">km</span>
            )}
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold text-[#00E5FF]/50 tracking-widest block mb-1 uppercase">
            Fuel
          </span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#00E5FF]/30 pointer-events-none">RM</span>
            <input
              type="number"
              min="0"
              className={`${inputBase} px-3 py-2.5 pl-7 text-center tabular-nums`}
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              suppressHydrationWarning
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold text-[#00E5FF]/50 tracking-widest block mb-1 uppercase flex items-center gap-1">
            Toll
            {tollIsEstimated && (
              <span className="text-[8px] font-bold px-1 py-0.5 border border-[#F8E71C]/40 text-[#F8E71C]/70 tracking-widest">
                EST
              </span>
            )}
          </span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#00E5FF]/30 pointer-events-none">RM</span>
            <input
              type="number"
              min="0"
              className={`${inputBase} px-3 py-2.5 pl-7 text-center tabular-nums ${tollIsEstimated ? "border-[#F8E71C]/30" : ""}`}
              value={toll}
              onChange={(e) => { setToll(e.target.value); setTollIsEstimated(false); }}
              suppressHydrationWarning
            />
          </div>
        </label>
      </div>
    </div>
  );
}
