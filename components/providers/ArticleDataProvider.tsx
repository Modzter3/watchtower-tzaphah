"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ArticleWithRelations } from "@/lib/types/article";

type ArticleDataContextValue = {
  articles: ArticleWithRelations[];
  loading: boolean;
  apiError: string | null;
  refresh: () => void;
};

const ArticleDataContext = createContext<ArticleDataContextValue | null>(null);

async function loadArticles(): Promise<{
  articles: ArticleWithRelations[];
  apiError: string | null;
}> {
  const r = await fetch("/api/articles?limit=100");
  const d = (await r.json()) as {
    articles?: ArticleWithRelations[];
    message?: string;
    error?: string;
  };
  if (!r.ok) {
    return {
      articles: [],
      apiError: d.message ?? d.error ?? `HTTP ${r.status}`,
    };
  }
  return { articles: d.articles ?? [], apiError: null };
}

export function ArticleDataProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const runLoad = useCallback(() => {
    loadArticles()
      .then(({ articles: next, apiError: err }) => {
        setArticles(next);
        setApiError(err);
      })
      .catch(() => {
        setArticles([]);
        setApiError("Network error");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadArticles()
      .then(({ articles: data, apiError: err }) => {
        if (!cancelled) {
          setArticles(data);
          setApiError(err);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticles([]);
          setApiError("Network error");
        }
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
      .channel("articles-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => {
          runLoad();
        },
      )
      .subscribe();

    return () => {
      client?.removeChannel(channel);
    };
  }, [runLoad]);

  const refresh = useCallback(() => {
    setLoading(true);
    runLoad();
  }, [runLoad]);

  const value = useMemo(
    () => ({ articles, loading, apiError, refresh }),
    [articles, loading, apiError, refresh],
  );

  return (
    <ArticleDataContext.Provider value={value}>
      {children}
    </ArticleDataContext.Provider>
  );
}

export function useArticleData(): ArticleDataContextValue {
  const ctx = useContext(ArticleDataContext);
  if (!ctx) {
    throw new Error("useArticleData must be used within ArticleDataProvider");
  }
  return ctx;
}
