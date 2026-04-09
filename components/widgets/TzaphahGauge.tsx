"use client";

import { useEffect, useState } from "react";

export function TzaphahGauge() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch("/api/tzaphah-index")
      .then((r) => r.json())
      .then((d: { index?: { score?: number } }) =>
        setScore(typeof d.index?.score === "number" ? d.index.score : 0),
      )
      .catch(() => setScore(0));
  }, []);

  const pct = Math.min(100, Math.max(0, score));

  return (
    <section className="rounded-lg border border-accent-gold/20 bg-background-surface p-4">
      <h2 className="mb-2 font-cinzel text-sm tracking-widest text-accent-gold">
        Tzaphah Index
      </h2>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-background-base">
        <div
          className="h-full rounded-full bg-accent-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-4 text-center font-mono text-3xl text-text-primary">{score}</p>
      <p className="text-center text-xs text-text-secondary">
        Weighted watch intensity (rolling window)
      </p>
    </section>
  );
}
