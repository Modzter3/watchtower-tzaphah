"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";
import type { ArticleWithRelations } from "@/lib/types/article";

function categoryLabel(slug: string): string {
  const c = PROPHETIC_CATEGORIES.find((x) => x.slug === slug);
  return c?.name ?? slug;
}

interface ArticleCardProps {
  article: ArticleWithRelations;
  onClick: () => void;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer rounded-lg border-l-4 bg-background-surface p-6 transition-colors hover:bg-background-elevated"
      style={{ borderLeftColor: article.urgency_color ?? "#64748b" }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-text-secondary">
          {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
        </span>
        <div className="flex flex-wrap gap-2">
          {(article.categories ?? []).slice(0, 4).map((cat) => (
            <span
              key={cat}
              className="rounded bg-background-base px-2 py-1 text-xs text-text-secondary"
            >
              {categoryLabel(cat)}
            </span>
          ))}
        </div>
      </div>

      <h3 className="mb-3 text-xl font-semibold text-text-primary">{article.headline}</h3>

      {article.prophetic_summary ? (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <span aria-hidden>🔥</span>
            <span className="text-sm font-semibold text-accent-gold">
              PROPHETIC SIGNIFICANCE
            </span>
          </div>
          <p className="text-sm italic text-text-secondary">{article.prophetic_summary}</p>
        </div>
      ) : null}

      {(article.scripture_references?.length ?? 0) > 0 ? (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <span aria-hidden>📜</span>
            <span className="text-sm font-semibold text-accent-gold">
              SCRIPTURE CONNECTIONS
            </span>
          </div>
          {article.scripture_references!.slice(0, 2).map((ref) => (
            <div key={ref.id} className="mb-2 ml-4">
              <p className="text-xs text-accent-gold">{ref.reference}</p>
              <p className="font-crimson text-sm italic text-text-scripture">
                &ldquo;{ref.verse_text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
        <span>{article.source_name}</span>
        <span className="font-mono">{article.analysis_status}</span>
        {article.urgency_level ? (
          <span className="font-mono">{article.urgency_level}</span>
        ) : null}
      </div>
    </motion.div>
  );
}
