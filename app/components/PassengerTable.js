"use client";

export default function PassengerTable({ passengers, setPassengers }) {
  const update = (i, field, val) => {
    setPassengers(passengers.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  };

  const remove = (i) => {
    setPassengers(passengers.filter((_, idx) => idx !== i));
  };

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
        Passengers
      </h2>

      <div className="grid grid-cols-[1fr_80px_80px_32px] gap-2 mb-1 text-xs text-gray-400 px-1">
        <span>Name</span>
        <span>Start km</span>
        <span>End km</span>
        <span />
      </div>

      {passengers.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_80px_80px_32px] gap-2 mb-2">
          <input
            className="border rounded p-1 text-sm"
            value={p.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Name"
          />
          <input
            type="number"
            min="0"
            className="border rounded p-1 text-sm"
            value={p.start}
            onChange={(e) => update(i, "start", e.target.value)}
          />
          <input
            type="number"
            min="0"
            className="border rounded p-1 text-sm"
            value={p.end}
            onChange={(e) => update(i, "end", e.target.value)}
          />
          <button
            onClick={() => remove(i)}
            className="text-red-400 hover:text-red-600 text-lg leading-none"
            title="Remove"
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={() => setPassengers([...passengers, { name: "", start: 0, end: 0 }])}
        className="mt-1 bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        + Add Passenger
      </button>
    </div>
  );
}
