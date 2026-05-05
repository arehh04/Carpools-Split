export default function Result({ result }) {
  const entries = Object.entries(result);
  const total = entries.reduce((sum, [, val]) => sum + val, 0);

  if (!entries.length) return null;

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
        Cost Split
      </h2>
      <div className="space-y-2">
        {entries.map(([name, val]) => (
          <div key={name} className="flex justify-between text-sm">
            <span className="font-medium">{name}</span>
            <span>RM {val.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t flex justify-between text-sm font-semibold">
        <span>Total</span>
        <span>RM {total.toFixed(2)}</span>
      </div>
    </div>
  );
}
