"use client";

import { useState } from "react";

export default function ShareBar({ url }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
        Share Trip
      </h2>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          className="border rounded p-2 text-sm flex-1 text-gray-500 bg-white"
        />
        <button
          onClick={copy}
          className="bg-green-500 text-white px-4 py-2 rounded text-sm whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
