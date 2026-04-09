"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";
import type { ArticleWithRelations } from "@/lib/types/article";

export function CategoryDonut() {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);

  useEffect(() => {
    fetch("/api/articles?limit=100")
      .then((r) => r.json())
      .then((d: { articles?: ArticleWithRelations[] }) =>
        setArticles(d.articles ?? []),
      )
      .catch(() => setArticles([]));
  }, []);

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of articles) {
      for (const slug of a.categories ?? []) {
        counts[slug] = (counts[slug] ?? 0) + 1;
      }
    }
    return PROPHETIC_CATEGORIES.map((c) => ({
      name: c.name,
      value: counts[c.slug] ?? 0,
      color: c.color,
    })).filter((d) => d.value > 0);
  }, [articles]);

  const chartData = data.length > 0 ? data : [{ name: "No data", value: 1, color: "#334155" }];

  return (
    <section className="rounded-lg border border-accent-gold/20 bg-background-surface p-4">
      <h2 className="mb-2 font-cinzel text-sm tracking-widest text-accent-gold">
        Category Mix
      </h2>
      <div className="h-56 w-full min-h-56 min-w-[240px]">
        <ResponsiveContainer width="100%" height={224}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#161625",
                border: "1px solid #c9a84c",
                borderRadius: 8,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
