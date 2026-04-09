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
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-lg overflow-y-auto border-l border-accent-gold/30 bg-background-surface p-6 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="mb-4 text-sm text-accent-gold hover:underline"
            >
              Close
            </button>
            <h2 className="font-cinzel text-xl text-text-primary">{article.headline}</h2>
            <p className="mt-2 text-xs text-text-secondary">{article.source_name}</p>
            {article.original_url ? (
              <a
                href={article.original_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-accent-cobalt hover:underline"
              >
                Open original source
              </a>
            ) : null}

            {article.prophetic_summary ? (
              <section className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-accent-gold">
                  Prophetic summary
                </h3>
                <p className="text-sm text-text-secondary">{article.prophetic_summary}</p>
              </section>
            ) : null}

            {article.watchman_note ? (
              <section className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-accent-gold">
                  Watchman note
                </h3>
                <p className="text-sm text-text-secondary">{article.watchman_note}</p>
              </section>
            ) : null}

            {(article.categories?.length ?? 0) > 0 ? (
              <section className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-accent-gold">Categories</h3>
                <ul className="list-inside list-disc text-sm text-text-secondary">
                  {article.categories!.map((c) => (
                    <li key={c}>{categoryLabel(c)}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(article.scripture_references?.length ?? 0) > 0 ? (
              <section className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-accent-gold">Scripture</h3>
                <div className="space-y-4">
                  {article.scripture_references!.map((ref) => (
                    <div key={ref.id} className="rounded border border-white/10 p-3">
                      <p className="text-xs text-accent-gold">{ref.reference}</p>
                      <p className="font-crimson mt-1 text-sm italic text-text-scripture">
                        &ldquo;{ref.verse_text}&rdquo;
                      </p>
                      {ref.relevance_note ? (
                        <p className="mt-2 text-xs text-text-secondary">{ref.relevance_note}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {article.full_content ? (
              <section className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-accent-gold">Excerpt</h3>
                <p className="whitespace-pre-wrap text-sm text-text-secondary">
                  {article.full_content.slice(0, 4000)}
                </p>
              </section>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
