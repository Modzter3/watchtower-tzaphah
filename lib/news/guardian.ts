import type { NormalizedArticle } from "@/lib/news/types";

interface GuardianResult {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
}

export async function fetchFromGuardian(): Promise<NormalizedArticle[]> {
  const key = process.env.GUARDIAN_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    "api-key": key,
    "page-size": "50",
    "order-by": "newest",
    "show-fields": "trailText,bodyText",
  });
  const url = `https://content.guardianapis.com/search?${params}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    response?: { results?: GuardianResult[] };
  };

  const results = data.response?.results ?? [];
  return results
    .filter((r) => r.webTitle && r.webUrl)
    .map((r) => ({
      source_name: "The Guardian",
      headline: r.webTitle,
      original_url: r.webUrl,
      full_content: "",
      published_at: new Date(r.webPublicationDate).toISOString(),
    }));
}
