"use client";

import { useEffect, useState } from "react";
import type { ArticleWithRelations } from "@/lib/types/article";

export function Ticker() {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);

  useEffect(() => {
    fetch("/api/articles?limit=20&urgency=COVENANT_ALARM,SIGNIFICANT_SIGN")
      .then((res) => res.json())
      .then((data: { articles?: ArticleWithRelations[] }) =>
        setArticles(data.articles ?? []),
      )
      .catch(() => setArticles([]));
  }, []);

  const items =
    articles.length > 0
      ? articles
      : [
          {
            id: "placeholder",
            headline: "Awaiting intelligence — run fetch-news cron or connect Supabase.",
            source_name: "Tzaphah",
            urgency_color: "#c9a84c",
          } as ArticleWithRelations,
        ];

  const doubled = [...items, ...items];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-12 overflow-hidden border-t-2 border-accent-gold bg-background-surface">
      <div className="flex h-full items-center">
        <div className="flex h-full items-center gap-2 border-r border-accent-gold bg-background-base px-4">
          <span className="font-cinzel text-xs tracking-widest text-accent-gold">
            TZAPHAH LIVE
          </span>
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
            aria-hidden
          />
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap px-4 hover:[animation-play-state:paused]">
            {doubled.map((article, i) => (
              <div key={`${article.id}-${i}`} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: article.urgency_color ?? "#64748b",
                  }}
                />
                <span className="text-sm text-text-primary">{article.headline}</span>
                <span className="text-xs text-text-secondary">
                  — {article.source_name}
                </span>
                <span className="text-text-secondary">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
