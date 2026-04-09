"use client";

import { useEffect, useState } from "react";

export function WatchmanBrief() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/tzaphah-index")
      .then((r) => r.json())
      .then((d: { index?: { score?: number } }) =>
        setScore(typeof d.index?.score === "number" ? d.index.score : 0),
      )
      .catch(() => setScore(null));
  }, []);

  return (
    <section className="rounded-lg border border-accent-gold/30 bg-background-elevated p-5">
      <h2 className="mb-2 font-cinzel-deco text-lg text-accent-gold">Watchman Brief</h2>
      <p className="text-sm leading-relaxed text-text-secondary">
        Tzaphah surfaces headlines through a Hebrew Israelite prophetic lens: covenant land
        events, signs of the times, economic control, persecution of scattered Israel, and
        the nations in commotion. Each item is analyzed with sobriety — not every story is
        a trumpet blast, but faithful report matters.
      </p>
      {score != null && (
        <p className="mt-4 font-mono text-xs text-text-secondary">
          Current index snapshot:{" "}
          <span className="text-accent-gold">{score}</span>
        </p>
      )}
    </section>
  );
}
