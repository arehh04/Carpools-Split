export function calculateSplit(distance, fuel, toll, passengers, driverName = null) {
  const d = Number(distance);
  const totalCost = Number(fuel) + Number(toll);

  const allPassengers = driverName != null
    ? [{ name: driverName || "Driver", start: 0, end: d }, ...passengers]
    : passengers;

  if (!d || d <= 0 || totalCost <= 0 || !allPassengers.length) return {};

  const costPerKm = totalCost / d;

  const points = new Set();
  allPassengers.forEach((p) => {
    points.add(Number(p.start));
    points.add(Number(p.end));
  });

  const sorted = Array.from(points).sort((a, b) => a - b);

  // Accumulate by index to avoid duplicate-name collisions
  const amounts = new Array(allPassengers.length).fill(0);

  for (let i = 0; i < sorted.length - 1; i++) {
    const segStart = sorted[i];
    const segEnd = sorted[i + 1];
    const segDist = segEnd - segStart;

    const activeIdx = allPassengers.reduce((acc, p, idx) => {
      if (Number(p.start) <= segStart && Number(p.end) >= segEnd) acc.push(idx);
      return acc;
    }, []);

    if (!activeIdx.length) continue;

    const share = (segDist * costPerKm) / activeIdx.length;
    activeIdx.forEach((idx) => { amounts[idx] += share; });
  }

  // Build display map — skip zero-amount passengers (no km set), duplicate names get "(2)" suffix
  const result = {};
  const seen = {};
  allPassengers.forEach((p, i) => {
    if (amounts[i] <= 0) return;
    const base = p.name?.trim() || `Passenger ${i + 1}`;
    seen[base] = (seen[base] || 0) + 1;
    const key = seen[base] > 1 ? `${base} (${seen[base]})` : base;
    result[key] = (result[key] || 0) + amounts[i];
  });

  return result;
}
