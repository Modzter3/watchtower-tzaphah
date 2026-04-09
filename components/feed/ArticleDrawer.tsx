"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArticleWithRelations } from "@/lib/types/article";
import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";

function categoryLabel(slug: string): string {
  const c = PROPHETIC_CATEGORIES.find((x) => x.slug === slug);
  return c?.name ?? slug;
}

interface ArticleDrawerProps {
  article: ArticleWithRelations | null;
  onClose: () => void;
}

export function ArticleDrawer({ article, onClose }: ArticleDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {article ? (
        <>
          <motion.button
            type="button"
            aria-label="Close article"
            className="fixed inset-0 z-[60] bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-lg overflow-y-auto border-l border-accent-gold/40 bg-background-surface/95 backdrop-blur-2xl p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="relative z-10">
              <button
                type="button"
                onClick={onClose}
                className="mb-8 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold hover:text-white transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> 
                Return_To_Stream
              </button>

              <div className="mb-6">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="h-px flex-1 bg-accent-gold/20" />
                    <span className="font-mono text-[9px] text-accent-gold/60 uppercase tracking-widest">Article_Intelligence</span>
                 </div>
                 <h2 className="font-cinzel text-3xl font-black leading-tight text-text-primary text-glow-gold">
                   {article.headline}
                 </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className="font-mono text-[10px] text-text-secondary">{article.source_name}</span>
                </div>
                {article.original_url ? (
                  <a
                    href={article.original_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 font-mono text-[10px] text-accent-gold hover:bg-accent-gold/20 transition-all"
                  >
                    View_Source ↗
                  </a>
                ) : null}
              </div>

              {article.prophetic_summary ? (
                <section className="mb-8 p-6 rounded-xl bg-accent-gold/[0.03] border border-accent-gold/20 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold/40" />
                  <h3 className="mb-4 font-cinzel text-xs font-black tracking-[0.2em] text-accent-gold flex items-center gap-2">
                    <span className="text-lg">🔥</span> PROPHETIC_INTEL
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary italic">
                    {article.prophetic_summary}
                  </p>
                </section>
              ) : null}

              {article.watchman_note ? (
                <section className="mb-8 p-6 rounded-xl bg-white/[0.02] border border-white/5 relative">
                  <h3 className="mb-4 font-cinzel text-xs font-black tracking-[0.2em] text-accent-gold/70">
                    WATCHMAN_NOTE
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {article.watchman_note}
                  </p>
                </section>
              ) : null}

              {(article.categories?.length ?? 0) > 0 ? (
                <section className="mb-8">
                  <h3 className="mb-4 font-cinzel text-xs font-black tracking-[0.2em] text-accent-gold/70">
                    CATEGORICAL_TAGS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.categories!.map((c) => (
                      <span key={c} className="px-3 py-1 rounded bg-accent-gold/5 border border-accent-gold/10 font-mono text-[10px] text-text-secondary uppercase">
                        {categoryLabel(c)}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {(article.scripture_references?.length ?? 0) > 0 ? (
                <section className="mb-8">
                  <h3 className="mb-6 font-cinzel text-xs font-black tracking-[0.2em] text-accent-gold flex items-center gap-2">
                    <span className="text-lg">📜</span> COVENANT_TEXT
                  </h3>
                  <div className="space-y-6">
                    {article.scripture_references!.map((ref) => (
                      <div key={ref.id} className="relative pl-6">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-accent-gold/30" />
                        <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-accent-gold" />
                        
                        <p className="font-mono text-[10px] text-accent-gold font-bold mb-2 uppercase tracking-widest">{ref.reference}</p>
                        <p className="font-crimson text-lg italic text-text-scripture leading-relaxed mb-3">
                          &ldquo;{ref.verse_text}&rdquo;
                        </p>
                        {ref.relevance_note ? (
                          <div className="p-3 rounded bg-white/5 border border-white/5 text-[11px] text-text-secondary leading-relaxed font-mono">
                             <span className="text-accent-gold/50 mr-2">ANALYSIS //</span> {ref.relevance_note}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {article.full_content ? (
                <section className="mb-8">
                  <h3 className="mb-4 font-cinzel text-xs font-black tracking-[0.2em] text-accent-gold/70 uppercase">
                    Raw_Transmission_Data
                  </h3>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] leading-relaxed text-text-secondary/60 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-accent-gold">
                    {article.full_content.slice(0, 4000)}
                  </div>
                </section>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
