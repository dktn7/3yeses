import React from "react";

type Step = { title: string; desc: string };

export default function HowFlow({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="p-6 bg-white/95 dark:bg-gray-900/80 rounded-2xl text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-[color:var(--brand-accent)]/10 flex items-center justify-center mb-4">
              <span className="font-semibold text-[color:var(--brand-accent)]">{i + 1}</span>
            </div>
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{s.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
