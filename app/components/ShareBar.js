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
    <div className="mb-12">
      <button
        onClick={copy}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-slate-800 to-indigo-900 hover:from-slate-700 hover:to-indigo-800 active:scale-95 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-900/20"
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
