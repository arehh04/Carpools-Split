"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, AlertCircle, Loader2, CheckCircle2, ArrowRight, X } from "lucide-react";
import { parseRouteLink, isMapLink } from "../utils/parseRoute";
import { resolveRouteDistance, resolveRouteWithToll } from "../utils/resolveDistance";

const S = { IDLE: "idle", RESOLVING: "resolving", DONE: "done", NO_DATA: "no_data", ERROR: "error" };

export default function TripForm({ distance, setDistance, fuel, setFuel, toll, setToll }) {
  const [routeUrl, setRouteUrl]     = useState("");
  const [routeLabel, setRouteLabel] = useState(null);
  const [status, setStatus]         = useState(S.IDLE);

  // Tracks whether the current distance/toll were auto-filled by a successful detection.
  // Avoids resetting values the user typed manually.
  const autoFilledRef = useRef(false);

  function clearRoute() {
    if (autoFilledRef.current) {
      setDistance(0);
      setToll(0);
      autoFilledRef.current = false;
    }
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

        // Short links: resolve redirect server-side first
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

        // Waze / Google embedded coords — skip geocoding
        if (info?.type === "waze-coords" && info.coords) {
          const { km, estimatedToll } = await resolveRouteWithToll(info.coords.from, info.coords.to);
          if (cancelled) return;
          autoFilledRef.current = true;
          if (info.label) setRouteLabel(info.label);
          setDistance(km);
          if (estimatedToll > 0) setToll(estimatedToll);
          setStatus(S.DONE);
          return;
        }

        // Named origin + destination — geocode then route
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

  // Split "Origin → Destination" label into parts for the preview pill
  const routeParts    = routeLabel ? routeLabel.split(" → ") : [];
  const hasRouteParts = routeParts.length === 2;

  const base = "w-full bg-white/60 border border-white/70 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200/60 focus:border-indigo-300/80 focus:bg-white/90 placeholder-slate-400";
  const distanceHighlight = status === S.DONE ? "border-indigo-300 bg-indigo-50/60" : "";

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-indigo-100/40 p-6 mb-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-indigo-100/80 border border-indigo-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <h2 className="text-sm font-semibold text-slate-700">Trip Details</h2>
      </div>

      <div className="mb-4">
        {/* URL input with inline clear button */}
        <div className="relative">
          <input
            type="url"
            className={`${base} px-3 py-2.5 ${routeUrl ? "pr-8" : ""}`}
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
              suppressHydrationWarning
            >
              <X className="w-2.5 h-2.5 text-slate-500" />
            </button>
          )}
        </div>

        {/* ── Resolving ─────────────────────────────────────────────── */}
        {status === S.RESOLVING && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2 flex items-center gap-2 rounded-2xl bg-white/70 border border-slate-200/60 px-3.5 py-2.5"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-slate-500">Detecting route and distance…</p>
          </div>
        )}

        {/* ── Success — route preview pill ──────────────────────────── */}
        {status === S.DONE && (
          <div className="mt-2 rounded-2xl bg-indigo-50/90 border border-indigo-200/50 px-3.5 py-2.5">
            {hasRouteParts ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="text-xs font-medium text-indigo-700 truncate min-w-0">
                  {routeParts[0]}
                </span>
                <ArrowRight className="w-3 h-3 text-indigo-300 flex-shrink-0" />
                <span className="text-xs font-medium text-indigo-900 truncate flex-1 min-w-0">
                  {routeParts[1]}
                </span>
                <span className="text-xs font-semibold text-indigo-500 flex-shrink-0 pl-1">
                  {distance} km
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="text-xs font-medium text-indigo-700">
                  {routeLabel ?? "Route detected"}
                </span>
                <span className="text-xs text-indigo-400 ml-auto">{distance} km · auto-filled</span>
              </div>
            )}
          </div>
        )}

        {/* ── No data — instruct user to enter manually ─────────────── */}
        {status === S.NO_DATA && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2 flex items-start gap-2 rounded-2xl bg-amber-50/90 border border-amber-200/50 px-3.5 py-2.5"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Map link detected — no route data available. Enter the distance shown in your maps app below.
            </p>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {status === S.ERROR && (
          <div
            role="alert"
            className="mt-2 flex items-start gap-2 rounded-2xl bg-red-50/90 border border-red-200/50 px-3.5 py-2.5"
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">
              Couldn&apos;t detect the route — check your connection or enter the distance manually below.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Distance</span>
          <div className="relative">
            <input
              type="number"
              min="0"
              className={`${base} px-3 py-2.5 pr-7 ${distanceHighlight}`}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              suppressHydrationWarning
            />
            {status === S.DONE ? (
              <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-400 pointer-events-none" />
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">km</span>
            )}
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Fuel</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">RM</span>
            <input
              type="number"
              min="0"
              className={`${base} px-3 py-2.5 pl-7`}
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              suppressHydrationWarning
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Toll</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">RM</span>
            <input
              type="number"
              min="0"
              className={`${base} px-3 py-2.5 pl-7`}
              value={toll}
              onChange={(e) => setToll(e.target.value)}
              suppressHydrationWarning
            />
          </div>
        </label>
      </div>
    </div>
  );
}
