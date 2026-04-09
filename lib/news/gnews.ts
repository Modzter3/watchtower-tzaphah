import type { NormalizedArticle } from "@/lib/news/types";

interface GNewsItem {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
  content?: string | null;
}

export async function fetchFromGNews(): Promise<NormalizedArticle[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) return [];

  const url = `https://gnews.io/api/v4/top-headlines?lang=en&max=50&apikey=${key}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as { articles?: GNewsItem[] };

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
