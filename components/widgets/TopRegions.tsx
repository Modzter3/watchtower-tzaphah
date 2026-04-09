"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArticleWithRelations, Region } from "@/lib/types/article";

const REGION_LABELS: Record<Region, string> = {
  MIDDLE_EAST: "Middle East",
  THE_MOTHERLAND: "The Motherland",
  EUROPE: "Europe",
  THE_AMERICAS: "The Americas",
  ASIA_EAST: "Asia (East)",
  GLOBAL_SYSTEMIC: "Global / Systemic",
};

export function TopRegions() {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);

  useEffect(() => {
    fetch("/api/articles?limit=100")
      .then((r) => r.json())
      .then((d: { articles?: ArticleWithRelations[] }) =>
        setArticles(d.articles ?? []),
      )
      .catch(() => setArticles([]));
  }, []);

  const ranked = useMemo(() => {
    const counts: Partial<Record<Region, number>> = {};
    for (const a of articles) {
      const r = a.region as Region | null;
      if (!r) continue;
      counts[r] = (counts[r] ?? 0) + 1;
    }
    return (Object.entries(counts) as [Region, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [articles]);

  return (
    <section className="rounded-lg border border-accent-gold/20 bg-background-surface p-4">
      <h2 className="mb-3 font-cinzel text-sm tracking-widest text-accent-gold">
        Top Regions
      </h2>
      {ranked.length === 0 ? (
        <p className="text-sm text-text-secondary">No regional tags yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {ranked.map(([region, n]) => (
            <li
              key={region}
              className="flex items-center justify-between border-b border-white/5 pb-2"
            >
              <span className="text-text-primary">{REGION_LABELS[region]}</span>
              <span className="font-mono text-accent-gold">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
