"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";
import type { ArticleWithRelations } from "@/lib/types/article";

function categoryMeta(slug: string) {
  const c = PROPHETIC_CATEGORIES.find((x) => x.slug === slug);
  return {
    label: c?.name ?? slug,
    color: c?.color ?? "#64748b",
  };
}

function statusBadgeClass(status: string | undefined): string {
  const s = status ?? "";
  if (s === "QUEUED" || s === "PENDING") {
    return "border-amber-400/50 bg-amber-500/20 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
  }
  if (s === "COMPLETE") {
    return "border-emerald-500/45 bg-emerald-500/15 text-emerald-100";
  }
  if (s === "FAILED") {
    return "border-red-500/50 bg-red-950/50 text-red-100";
  }
  return "border-white/15 bg-white/5 text-text-secondary";
}

interface ArticleCardProps {
  article: ArticleWithRelations;
  onClick: () => void;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const accent = article.urgency_color ?? "#64748b";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] bg-background-surface/40 backdrop-blur-md p-6 transition-all duration-300 hover:border-accent-gold/40 hover:bg-background-elevated/60"
      style={{
        borderLeftWidth: 6,
        borderLeftColor: accent,
        boxShadow: `
          inset 0 0 30px ${accent}08,
          0 10px 40px -15px rgba(0,0,0,0.6)
        `,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      {/* Light sweep effect */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
        <div className="absolute top-2 right-2 w-px h-6 bg-accent-gold" />
        <div className="absolute top-2 right-2 h-px w-6 bg-accent-gold" />
      </div>

      <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
          <span className="font-mono text-[10px] tracking-widest text-text-secondary uppercase">
            {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(article.categories ?? []).slice(0, 4).map((cat) => {
            const { label, color } = categoryMeta(cat);
            return (
              <span
                key={cat}
                className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
                style={{
                  borderColor: `${color}44`,
                  backgroundColor: `${color}15`,
                  color: color,
                  textShadow: `0 0 8px ${color}44`,
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

      <h3 className="mb-4 text-2xl font-bold leading-tight text-text-primary group-hover:text-glow-gold transition-all duration-300">
        {article.headline}
      </h3>

      {article.prophetic_summary ? (
        <div className="mb-5 relative p-4 rounded-lg bg-accent-gold/[0.03] border border-accent-gold/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold/30" />
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="font-cinzel text-xs font-bold tracking-[0.2em] text-accent-gold">
              PROPHETIC INTEL
            </span>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary line-clamp-3 italic">
            {article.prophetic_summary}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-accent-gold/30" />
          <span className="font-mono text-[10px] tracking-tighter text-text-secondary uppercase opacity-70">
            {article.source_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-sm border px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.15em] ${statusBadgeClass(article.analysis_status)}`}
          >
            {article.analysis_status ?? "—"}
          </span>
          {article.urgency_level ? (
            <span
              className="rounded-sm border px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.15em]"
              style={{
                borderColor: `${accent}66`,
                backgroundColor: `${accent}22`,
                color: "#fff",
                boxShadow: `0 0 10px ${accent}33`,
              }}
            >
              {article.urgency_level.replace(/_/g, " ")}
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
