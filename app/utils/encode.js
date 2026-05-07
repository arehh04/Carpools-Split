export function encodeTrip(data) {
  const p = data.passengers
    .map((x) => `${x.name},${x.start},${x.end}`)
    .join("|");

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
        const [name, start, end] = x.split(",");
        return { name, start: Number(start), end: Number(end) };
      });
  }

  const driverName = params.has("dr") ? decodeURIComponent(params.get("dr") ?? "") : null;

  return { distance, fuel, toll, passengers, driverName };
}
