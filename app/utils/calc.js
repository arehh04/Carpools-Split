export function calculateSplit(distance, fuel, toll, passengers) {
  const totalCost = Number(fuel) + Number(toll);
  if (!distance || totalCost === 0) return {};

  const costPerKm = totalCost / distance;

  const points = new Set();
  passengers.forEach((p) => {
    points.add(Number(p.start));
    points.add(Number(p.end));
  });

  const sorted = Array.from(points).sort((a, b) => a - b);

  let result = {};
  passengers.forEach((p) => (result[p.name] = 0));

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const dist = end - start;

    const active = passengers.filter((p) => p.start <= start && p.end >= end);

    if (!active.length) continue;

    const segmentCost = dist * costPerKm;
    const share = segmentCost / active.length;

    active.forEach((p) => (result[p.name] += share));
  }

  return result;
}
