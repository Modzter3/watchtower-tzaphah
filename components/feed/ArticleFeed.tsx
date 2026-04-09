"use client";

import { useState } from "react";
import type { ArticleWithRelations } from "@/lib/types/article";
import { ArticleCard } from "@/components/feed/ArticleCard";
import { ArticleDrawer } from "@/components/feed/ArticleDrawer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useArticleData } from "@/components/providers/ArticleDataProvider";

export function ArticleFeed() {
  const { articles, loading, apiError } = useArticleData();
  const [selected, setSelected] = useState<ArticleWithRelations | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="rounded-lg border border-red-900/50 bg-background-surface p-10 text-center">
        <p className="font-cinzel text-red-400">Feed could not load</p>
        <p className="mt-2 font-mono text-xs text-text-secondary break-all">{apiError}</p>
        <p className="mt-4 text-sm text-text-secondary">
          Check Vercel env:{" "}
          <code className="rounded bg-background-base px-1">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-background-base px-1">
            SUPABASE_SERVICE_ROLE_KEY
          </code>
          , then redeploy.
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-accent-gold/30 bg-background-surface p-10 text-center text-text-secondary">
        <p className="font-cinzel text-accent-gold">No articles yet</p>
        <p className="mt-2 text-sm">
          If Supabase and keys are already set, the{" "}
          <code className="rounded bg-background-base px-1 font-mono text-xs">
            articles
          </code>{" "}
          table is empty. Trigger your external cron (or once manually):{" "}
          <code className="rounded bg-background-base px-1 font-mono text-xs">
            GET /api/cron/fetch-news
          </code>{" "}
          then{" "}
          <code className="rounded bg-background-base px-1 font-mono text-xs">
            GET /api/cron/process-queue
          </code>{" "}
          with{" "}
          <code className="rounded bg-background-base px-1 font-mono text-xs">
            Authorization: Bearer CRON_SECRET
          </code>
          . News + OpenAI keys must be set on the server. The AI relevance step may skip
          many headlines; check cron response for{" "}
          <code className="font-mono text-xs">inserted</code> /{" "}
          <code className="font-mono text-xs">skipped</code>.
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
