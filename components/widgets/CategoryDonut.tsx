"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";
import { useArticleData } from "@/components/providers/ArticleDataProvider";
import { Skeleton } from "@/components/ui/Skeleton";

const KNOWN_CATEGORY_SLUGS = new Set(
  PROPHETIC_CATEGORIES.map((c) => c.slug),
);

const PIPELINE_STATUSES = new Set(["QUEUED", "PENDING", "FAILED"]);

type DonutSlice = { name: string; value: number; color: string };

export function CategoryDonut() {
  const { articles, loading, apiError } = useArticleData();

  const {
    chartData,
    inPipelineCount,
    completeWithoutCategories,
    categorizedCount,
    totalCount,
  } = useMemo(() => {
    const counts: Record<string, number> = {};
    let inPipeline = 0;
    let completeNoCats = 0;
    let unknownSlugHits = 0;

    for (const a of articles) {
      const status = a.analysis_status ?? "";
      const cats = a.categories ?? [];

      if (PIPELINE_STATUSES.has(status)) {
        inPipeline++;
        continue;
      }

      if (status === "COMPLETE" && cats.length === 0) {
        completeNoCats++;
        continue;
      }

      if (cats.length === 0) {
        inPipeline++;
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

    if (inPipeline > 0) {
      slices.push({
        name: "In analysis queue",
        value: inPipeline,
        color: "#52525B",
      });
    }

    if (completeNoCats > 0) {
      slices.push({
        name: "Complete — no tags",
        value: completeNoCats,
        color: "#78716C",
      });
    }

    if (unknownSlugHits > 0) {
      slices.push({
        name: "Other labels",
        value: unknownSlugHits,
        color: "#A8A29E",
      });
    }

    const categorized = Object.values(counts).reduce((s, n) => s + n, 0);
    const chartData: DonutSlice[] =
      slices.length > 0
        ? slices
        : articles.length === 0
          ? [{ name: "No articles yet", value: 1, color: "#334155" }]
          : [{ name: "Awaiting first run", value: 1, color: "#475569" }];

    return {
      chartData,
      inPipelineCount: inPipeline,
      completeWithoutCategories: completeNoCats,
      categorizedCount: categorized + unknownSlugHits,
      totalCount: articles.length,
    };
  }, [articles]);

  const showQueueBanner = inPipelineCount > 0 && totalCount > 0;
  const showDataNote =
    !showQueueBanner &&
    completeWithoutCategories > 0 &&
    totalCount > 0;

  if (loading) {
    return (
      <section className="rounded-xl border border-accent-gold/20 bg-background-surface/40 p-4">
        <h2 className="mb-2 font-cinzel text-sm tracking-widest text-accent-gold">
          Prophetic_Mix
        </h2>
        <Skeleton className="h-56 w-full rounded-lg" />
      </section>
    );
  }

  if (apiError) {
    return (
      <section className="rounded-xl border border-red-900/30 bg-background-surface/40 p-4">
        <h2 className="mb-2 font-cinzel text-sm tracking-widest text-accent-gold">
          Prophetic_Mix
        </h2>
        <p className="text-xs text-red-300/90">Could not load articles.</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-accent-gold/20 bg-background-surface/40 backdrop-blur-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:border-accent-gold/40">
      <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-accent-gold/30" />
      <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-accent-gold/30" />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-cinzel text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold text-glow-gold">
          Prophetic_Mix
        </h2>
        <div className="h-2 w-2 animate-pulse rounded-full bg-accent-gold/20" />
      </div>

      {showQueueBanner ? (
        <div className="mb-4 flex items-center gap-3 rounded border border-amber-500/10 bg-amber-500/5 p-3 shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]">
          <span className="text-xs text-amber-500">⚠️</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/90">
              {inPipelineCount} article{inPipelineCount === 1 ? "" : "s"} still in the analysis queue
            </p>
            <p className="text-[8px] font-mono uppercase text-amber-200/50">
              Run process-queue until none are QUEUED or FAILED.
            </p>
          </div>
        </div>
      ) : null}

      {showDataNote ? (
        <div className="mb-4 rounded border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[10px] text-text-secondary">
            {completeWithoutCategories} article
            {completeWithoutCategories === 1 ? " is" : "s are"} marked COMPLETE but have no category
            rows. Re-run{" "}
            <code className="font-mono text-[9px]">process-queue</code> or fix in Supabase.
          </p>
        </div>
      ) : null}

      <div className="relative h-64 w-full">
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
                fontFamily: "var(--font-mono)",
              }}
              itemStyle={{ color: "#EDE9D8" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                paddingTop: "20px",
              }}
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-accent-gold/40">
              Categorized
            </span>
            <span className="font-cinzel text-2xl font-black text-text-primary">
              {categorizedCount}
            </span>
            <span className="mt-0.5 block font-mono text-[8px] text-text-secondary/60">
              of {totalCount} loaded
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
