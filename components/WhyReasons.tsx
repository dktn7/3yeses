import React from "react";

type Reason = { title: string; desc: string };

export default function WhyReasons({ reasons }: { reasons: Reason[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {reasons.map((r, i) => (
        <div key={i} className="p-6 bg-white/95 dark:bg-gray-900/80 rounded-2xl shadow-sm">
          <div className="h-12 w-12 rounded-full bg-[color:var(--brand-primary)]/10 flex items-center justify-center mb-4">
            <span className="text-xl font-bold text-[color:var(--brand-primary)]">{i + 1}</span>
          </div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{r.title}</h3>
          <p className="text-gray-700 dark:text-gray-300">{r.desc}</p>
        </div>
      ))}
    </div>
  );
}
