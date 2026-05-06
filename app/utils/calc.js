export function calculateSplit(distance, fuel, toll, passengers) {
  const d = Number(distance);
  const totalCost = Number(fuel) + Number(toll);

  if (!d || d <= 0 || totalCost <= 0 || !passengers.length) return {};

  const costPerKm = totalCost / d;

  const points = new Set();
  passengers.forEach((p) => {
    points.add(Number(p.start));
    points.add(Number(p.end));
  });

  const sorted = Array.from(points).sort((a, b) => a - b);

  // Accumulate by index to avoid duplicate-name collisions
  const amounts = new Array(passengers.length).fill(0);

  for (let i = 0; i < sorted.length - 1; i++) {
    const segStart = sorted[i];
    const segEnd = sorted[i + 1];
    const segDist = segEnd - segStart;

    const activeIdx = passengers.reduce((acc, p, idx) => {
      if (Number(p.start) <= segStart && Number(p.end) >= segEnd) acc.push(idx);
      return acc;
    }, []);

    if (!activeIdx.length) continue;

    const share = (segDist * costPerKm) / activeIdx.length;
    activeIdx.forEach((idx) => { amounts[idx] += share; });
  }

  // Build display map — duplicate names get a "(2)" suffix
  const result = {};
  const seen = {};
  passengers.forEach((p, i) => {
    const base = p.name?.trim() || `Passenger ${i + 1}`;
    seen[base] = (seen[base] || 0) + 1;
    const key = seen[base] > 1 ? `${base} (${seen[base]})` : base;
    result[key] = (result[key] || 0) + amounts[i];
  });

  return result;
}
