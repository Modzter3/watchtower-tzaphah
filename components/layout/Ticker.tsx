"use client";

import { useMemo } from "react";
import { useArticleData } from "@/components/providers/ArticleDataProvider";
import type { ArticleWithRelations, UrgencyLevel } from "@/lib/types/article";

const URGENCY_RANK: Record<UrgencyLevel, number> = {
  COVENANT_ALARM: 4,
  SIGNIFICANT_SIGN: 3,
  WORTHY_OF_WATCH: 2,
  MONITORING: 1,
};

function sortForTicker(a: ArticleWithRelations, b: ArticleWithRelations): number {
  const ua = a.urgency_level ? URGENCY_RANK[a.urgency_level] : 0;
  const ub = b.urgency_level ? URGENCY_RANK[b.urgency_level] : 0;
  if (ub !== ua) return ub - ua;
  return (
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function Ticker() {
  const { articles, loading, apiError } = useArticleData();

  const items = useMemo(() => {
    if (articles.length === 0) return [];
    return [...articles].sort(sortForTicker);
  }, [articles]);

  const display = useMemo(() => {
    if (loading) {
      return [
        {
          id: "loading",
          headline: "Loading watchlist…",
          source_name: "Tzaphah",
          urgency_color: "#64748b",
        } as ArticleWithRelations,
      ];
    }
    if (apiError) {
      return [
        {
          id: "err",
          headline: `Feed unavailable — ${apiError.slice(0, 80)}`,
          source_name: "Tzaphah",
          urgency_color: "#991b1b",
        } as ArticleWithRelations,
      ];
    }
    if (items.length > 0) return items;
    return [
      {
        id: "placeholder",
        headline:
          "Awaiting intelligence — run fetch-news, then process-queue, or connect Supabase.",
        source_name: "Tzaphah",
        urgency_color: "#c9a84c",
      } as ArticleWithRelations,
    ];
  }, [loading, apiError, items]);

  const doubled = [...display, ...display];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-10 overflow-hidden border-t border-accent-gold/40 bg-background-base/80 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      <div className="flex h-full items-center">
        <div className="flex h-full items-center gap-3 border-r border-accent-gold/30 bg-background-elevated/40 px-6">
          <div className="relative">
            <span className="font-cinzel text-[10px] font-black tracking-[0.3em] text-accent-gold text-glow-gold">
              LIVE_INTEL
            </span>
            <div className="absolute -top-1 -right-2 h-1 w-1 bg-red-500 rounded-full animate-ping" />
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-12 whitespace-nowrap px-6 hover:[animation-play-state:paused]">
            {doubled.map((article, i) => (
              <div key={`${article.id}-${i}`} className="group/item flex items-center gap-3 cursor-default">
                <div 
                  className="h-2 w-2 shrink-0 rounded-full shadow-[0_0_10px_currentColor]"
                  style={{
                    backgroundColor: article.urgency_color ?? "#64748b",
                    color: article.urgency_color ?? "#64748b",
                  }}
                />
                <span className="text-[11px] font-bold tracking-tight text-text-primary/90 group-hover/item:text-accent-gold transition-colors">
                  {article.headline.toUpperCase()}
                </span>
                <span className="font-mono text-[9px] font-black tracking-widest text-text-secondary/40 uppercase">
                  [{article.source_name}]
                </span>
                <span className="text-accent-gold/20 font-black">//</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:flex h-full items-center gap-4 border-l border-accent-gold/20 px-6 bg-background-elevated/20">
          <span className="font-mono text-[9px] tracking-widest text-accent-gold/60 uppercase animate-pulse">
            System_Operational
          </span>
        </div>
      </div>
    </div>
  );
}
