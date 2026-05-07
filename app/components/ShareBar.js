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
        className="w-full flex items-center justify-center gap-2.5 py-4 font-orbitron text-xs font-bold tracking-widest uppercase transition-all active:scale-95"
        style={{
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          border: copied ? "2px solid #00FF9F" : "2px solid #00E5FF",
          color: copied ? "#00FF9F" : "#00E5FF",
          backgroundColor: copied ? "rgba(0,255,159,0.08)" : "rgba(0,229,255,0.05)",
          boxShadow: copied
            ? "0 0 20px rgba(0,255,159,0.3), inset 0 0 20px rgba(0,255,159,0.05)"
            : "0 0 12px rgba(0,229,255,0.15), inset 0 0 12px rgba(0,229,255,0.03)",
          textShadow: copied ? "0 0 10px #00FF9F" : "0 0 10px #00E5FF",
        }}
        suppressHydrationWarning
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            LINK TRANSMITTED
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            TRANSMIT LINK
          </>
        )}
      </button>
    </div>
  );
}
