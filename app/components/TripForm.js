"use client";

export default function TripForm({
  distance,
  setDistance,
  fuel,
  setFuel,
  toll,
  setToll,
}) {
  return (
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
        Trip Details
      </h2>
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm text-gray-600">Distance (km)</span>
          <input
            type="number"
            min="0"
            className="mt-1 border rounded p-2 w-full"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Fuel cost (RM)</span>
          <input
            type="number"
            min="0"
            className="mt-1 border rounded p-2 w-full"
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Toll cost (RM)</span>
          <input
            type="number"
            min="0"
            className="mt-1 border rounded p-2 w-full"
            value={toll}
            onChange={(e) => setToll(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
