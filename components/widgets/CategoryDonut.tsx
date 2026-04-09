"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";
import { useArticleData } from "@/components/providers/ArticleDataProvider";
import { Skeleton } from "@/components/ui/Skeleton";

const KNOWN_CATEGORY_SLUGS = new Set(
  PROPHETIC_CATEGORIES.map((c) => c.slug),
);

type DonutSlice = { name: string; value: number; color: string };

export function CategoryDonut() {
  const { articles, loading, apiError } = useArticleData();

  const { chartData, uncategorizedCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    let uncategorized = 0;
    let unknownSlugHits = 0;
    for (const a of articles) {
      const cats = a.categories ?? [];
      if (cats.length === 0) {
        uncategorized++;
        continue;
      }
      for (const slug of cats) {
        if (KNOWN_CATEGORY_SLUGS.has(slug)) {
          counts[slug] = (counts[slug] ?? 0) + 1;
        } else {
          unknownSlugHits++;
        }
      }
    }
    const slices: DonutSlice[] = PROPHETIC_CATEGORIES.map((c) => ({
      name: c.name,
      value: counts[c.slug] ?? 0,
      color: c.color,
    })).filter((d) => d.value > 0);

    if (uncategorized > 0) {
      slices.push({
        name: "Pending / uncategorized",
        value: uncategorized,
        color: "#64748B",
      });
    }
    if (unknownSlugHits > 0) {
      slices.push({
        name: "Other labels",
        value: unknownSlugHits,
        color: "#78716C",
      });
    }

    const chartData =
      slices.length > 0
        ? slices
        : articles.length === 0
          ? [{ name: "No articles yet", value: 1, color: "#334155" }]
          : [{ name: "No categories assigned", value: 1, color: "#475569" }];

    return { chartData, uncategorizedCount: uncategorized };
  }, [articles]);

  if (loading) {
    return (
      <section className="rounded-lg border border-accent-gold/20 bg-background-surface p-4">
        <h2 className="mb-2 font-cinzel text-sm tracking-widest text-accent-gold">
          Category Mix
        </h2>
        <Skeleton className="h-56 w-full rounded-lg" />
      </section>
    );
  }

  if (apiError) {
    return (
      <section className="rounded-lg border border-red-900/30 bg-background-surface p-4">
        <h2 className="mb-2 font-cinzel text-sm tracking-widest text-accent-gold">
          Category Mix
        </h2>
        <p className="text-xs text-red-300/90">Could not load article mix.</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-accent-gold/20 bg-background-surface/40 backdrop-blur-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:border-accent-gold/40">
      {/* HUD Elements */}
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-gold/30 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-gold/30 rounded-br-lg" />

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cinzel text-[10px] font-black tracking-[0.3em] text-accent-gold uppercase text-glow-gold">
          Prophetic_Mix
        </h2>
        <div className="h-2 w-2 rounded-full bg-accent-gold/20 animate-pulse" />
      </div>

      {uncategorizedCount > 0 &&
      chartData.some((d) => d.name !== "Pending / uncategorized") ? (
        <div className="mb-4 flex items-center gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/10">
          <span className="text-amber-500 animate-pulse">⚠️</span>
          <p className="text-[9px] font-mono leading-tight text-amber-200/70 uppercase">
            Data_Incomplete: Run queue for full analysis.
          </p>
        </div>
      ) : null}

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={4}
              stroke="none"
            >
              {chartData.map((entry, i) => (
                <Cell 
                  key={`${entry.name}-${i}`} 
                  fill={entry.color} 
                  className="filter drop-shadow-[0_0_8px_rgba(201,168,76,0.2)]"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(15, 15, 26, 0.9)",
                border: "1px solid rgba(201, 168, 76, 0.3)",
                borderRadius: "8px",
                backdropFilter: "blur(12px)",
                fontSize: "10px",
                fontFamily: "var(--font-mono)"
              }}
              itemStyle={{ color: "#EDE9D8" }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: 9, 
                fontFamily: "var(--font-mono)", 
                textTransform: "uppercase",
                letterSpacing: "1px",
                paddingTop: "20px"
              }} 
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="block font-mono text-[8px] tracking-[0.2em] text-accent-gold/40 uppercase">
              Total_Events
            </span>
            <span className="font-cinzel text-2xl font-black text-text-primary">
              {articles.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
