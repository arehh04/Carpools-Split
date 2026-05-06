"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ShareBar({ url }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-10">
      <button
        onClick={copy}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-sm font-semibold transition-all"
        suppressHydrationWarning
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Link Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Share Trip
          </>
        )}
      </button>
    </div>
  );
}
