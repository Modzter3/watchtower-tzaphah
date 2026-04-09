import type { NormalizedArticle } from "@/lib/news/types";

interface NewsAPIArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
  content?: string | null;
}

export async function fetchFromNewsAPI(): Promise<NormalizedArticle[]> {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];

  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=50&apiKey=${key}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    articles?: NewsAPIArticle[];
  };

  return (data.articles ?? [])
    .filter((a) => a.title && a.url)
    .map((article) => ({
      source_name: article.source.name,
      headline: article.title,
      original_url: article.url,
      full_content: article.content || article.description || "",
      published_at: new Date(article.publishedAt).toISOString(),
    }));
}
