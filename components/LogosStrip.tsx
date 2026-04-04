import React from "react";
import SwoopingTick from "@/components/SwoopingTick";

const logos = [
  "/logos/logo-2.svg",
  "/logos/logo-3.svg",
  "/logos/logo-4.svg",
];

export default function LogosStrip() {
  return (
    <div className="py-6">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="h-12 w-40 flex items-center justify-center p-2 bg-white/90 dark:bg-gray-800/70 rounded">
          <div aria-hidden className="flex items-center justify-center">
            <SwoopingTick size={36} className="text-[color:var(--brand-primary)]" />
          </div>
          <span className="sr-only">3yeses logo</span>
        </div>

        {logos.map((src, i) => (
          <div key={i} className="h-12 w-40 flex items-center justify-center p-2 bg-white/90 dark:bg-gray-800/70 rounded">
            <img src={src} alt={`Logo ${i + 2}`} className="max-h-8 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
