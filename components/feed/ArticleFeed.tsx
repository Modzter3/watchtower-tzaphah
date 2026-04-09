"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ArticleWithRelations } from "@/lib/types/article";
import { ArticleCard } from "@/components/feed/ArticleCard";
import { ArticleDrawer } from "@/components/feed/ArticleDrawer";
import { Skeleton } from "@/components/ui/Skeleton";

function loadArticles(): Promise<ArticleWithRelations[]> {
  return fetch("/api/articles?limit=50")
    .then((r) => r.json())
    .then((d: { articles?: ArticleWithRelations[] }) => d.articles ?? []);
}

export function ArticleFeed() {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ArticleWithRelations | null>(null);

  const silentRefresh = useCallback(() => {
    loadArticles().then(setArticles).catch(() => setArticles([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadArticles()
      .then((data) => {
        if (!cancelled) setArticles(data);
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let client: ReturnType<typeof createSupabaseBrowserClient> | null = null;
    try {
      client = createSupabaseBrowserClient();
    } catch {
      return;
    }
    const channel = client
      .channel("articles-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => {
          silentRefresh();
        },
      )
      .subscribe();

    return () => {
      client?.removeChannel(channel);
    };
  }, [silentRefresh]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-accent-gold/30 bg-background-surface p-10 text-center text-text-secondary">
        <p className="font-cinzel text-accent-gold">No articles yet</p>
        <p className="mt-2 text-sm">
          Configure Supabase, run{" "}
          <code className="rounded bg-background-base px-1 font-mono text-xs">
            schema.sql
          </code>
          , set API keys, then trigger{" "}
          <code className="rounded bg-background-base px-1 font-mono text-xs">
            /api/cron/fetch-news
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} onClick={() => setSelected(a)} />
        ))}
      </div>
      <ArticleDrawer article={selected} onClose={() => setSelected(null)} />
    </>
  );
}
