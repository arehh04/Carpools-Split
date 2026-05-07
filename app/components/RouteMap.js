"use client";

import { useEffect, useRef } from "react";
import { interpolateOnRoute } from "../utils/interpolateRoute";

export default function RouteMap({ routeGeometry, passengers }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!routeGeometry?.coordinates?.length || routeGeometry.coordinates.length < 2 || !containerRef.current) return;

    let cancelled = false;

    async function init() {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const L = (await import("leaflet")).default;
      if (cancelled) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const coords = routeGeometry.coordinates;
      const latlngs = coords.map(([lon, lat]) => [lat, lon]);

      const polyline = L.polyline(latlngs, { color: "#00E5FF", weight: 3, opacity: 0.8 }).addTo(map);
      map.fitBounds(polyline.getBounds(), { padding: [24, 24] });

      const escHtml = (s) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      const makeIcon = (label, bgColor) =>
        L.divIcon({
          className: "",
          html: `<div style="background:${bgColor};color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${escHtml(label)}</div>`,
          iconAnchor: [0, 10],
        });

      L.marker(latlngs[0], { icon: makeIcon("Start", "#00C853") }).addTo(map);
      L.marker(latlngs[latlngs.length - 1], { icon: makeIcon("End", "#D50000") }).addTo(map);

      const totalKm = routeGeometry.totalKm;
      const partials = (passengers ?? []).filter(
        (p) => p.mode === "partial" && (Number(p.start) > 0 || Number(p.end) > 0)
      );

      partials.forEach((p, idx) => {
        const name = p.name?.trim() || `P${idx + 1}`;
        const latOffset = idx * 0.0001;

        if (Number(p.start) > 0) {
          const pos = interpolateOnRoute(coords, totalKm, Number(p.start));
          L.marker([pos[0] + latOffset, pos[1]], {
            icon: makeIcon(`↑ ${name}`, "#00E5FF"),
          }).addTo(map);
        }

        if (Number(p.end) > 0) {
          const pos = interpolateOnRoute(coords, totalKm, Number(p.end));
          L.marker([pos[0] + latOffset, pos[1]], {
            icon: makeIcon(`↓ ${name}`, "#9B5DE5"),
          }).addTo(map);
        }
      });
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [routeGeometry, passengers]);

  return (
    <div
      className="glass rounded-xl overflow-hidden ring-1 ring-[#00E5FF]/20 mb-4 transition-opacity duration-300"
      style={{ height: "240px" }}
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
