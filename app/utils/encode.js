export function encodeTrip(data) {
  const p = data.passengers
    .map((x) => `${x.name},${x.start},${x.end},${x.mode || "full"}`)
    .join("|");

  // Include mode as 4th field; old 3-field URLs decode as "partial" (they had explicit km values)
  let url = `?d=${data.distance}&f=${data.fuel}&t=${data.toll}&p=${encodeURIComponent(p)}`;
  if (data.driverName != null) url += `&dr=${encodeURIComponent(data.driverName)}`;
  return url;
}

export function decodeTrip() {
  const params = new URLSearchParams(window.location.search);

  const distance = params.get("d");
  const fuel = params.get("f");
  const toll = params.get("t");

  let passengers = [];

  if (params.get("p")) {
    passengers = decodeURIComponent(params.get("p"))
      .split("|")
      .map((x) => {
        const parts = x.split(",");
        const name  = parts[0];
        const start = Number(parts[1] ?? 0);
        const end   = Number(parts[2] ?? 0);
        const mode  = parts[3] ?? "partial"; // old 3-field URLs default to partial
        return { name, start, end, mode };
      });
  }

  const driverName = params.has("dr") ? decodeURIComponent(params.get("dr") ?? "") : null;

  return { distance, fuel, toll, passengers, driverName };
}
