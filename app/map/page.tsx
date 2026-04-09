"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CovenantOverlay } from "@/components/map/CovenantOverlay";
import type { ArticleWithRelations } from "@/lib/types/article";

const PropheticMap = dynamic(
  () =>
    import("@/components/map/PropheticMap").then((m) => ({
      default: m.PropheticMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70vh,520px)] min-h-[420px] animate-pulse rounded-lg bg-background-elevated" />
    ),
  },
);

export default function MapPage() {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);

  useEffect(() => {
    fetch("/api/articles?limit=200")
      .then((r) => r.json())
      .then((d: { articles?: ArticleWithRelations[] }) =>
        setArticles(d.articles ?? []),
      )
      .catch(() => setArticles([]));
  }, []);

  return (
    <div className="mx-auto max-w-[1920px] space-y-6 p-6 pb-24">
      <div>
        <h1 className="font-cinzel-deco text-2xl text-accent-gold">Prophetic Map</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Markers use coordinates from the AI pipeline (invalid values are dropped). If the map
          is empty, run <code className="font-mono text-xs">process-queue</code> so articles reach
          status <code className="font-mono text-xs">COMPLETE</code> with geolocation filled.
        </p>
      </div>
      <PropheticMap articles={articles} />
      <CovenantOverlay />
    </div>
  );
}
