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
  { ssr: false, loading: () => <div className="h-[480px] animate-pulse rounded-lg bg-background-elevated" /> },
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
          Articles with latitude and longitude from the analysis pipeline appear as markers.
          Urgency colors echo the feed.
        </p>
      </div>
      <PropheticMap articles={articles} />
      <CovenantOverlay />
    </div>
  );
}
