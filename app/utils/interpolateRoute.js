function haversineKm([lon1, lat1], [lon2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns [lat, lon] at targetKm along a GeoJSON coordinate array.
 * coordinates: [[lon, lat], ...] — GeoJSON order (lon first)
 * Clamps to route start/end if targetKm is out of [0, totalKm].
 */
export function interpolateOnRoute(coordinates, totalKm, targetKm) {
  const clamped = Math.max(0, Math.min(targetKm, totalKm));

  if (clamped === 0 || coordinates.length === 0) {
    const [lon, lat] = coordinates[0];
    return [lat, lon];
  }

  if (clamped >= totalKm) {
    const [lon, lat] = coordinates[coordinates.length - 1];
    return [lat, lon];
  }

  let cumulative = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const segKm = haversineKm(coordinates[i], coordinates[i + 1]);
    if (cumulative + segKm >= clamped) {
      const t = segKm > 0 ? (clamped - cumulative) / segKm : 0;
      const [lon1, lat1] = coordinates[i];
      const [lon2, lat2] = coordinates[i + 1];
      return [lat1 + t * (lat2 - lat1), lon1 + t * (lon2 - lon1)];
    }
    cumulative += segKm;
  }

  const [lon, lat] = coordinates[coordinates.length - 1];
  return [lat, lon];
}
