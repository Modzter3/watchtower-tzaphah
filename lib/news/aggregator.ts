import { fetchFromNewsAPI } from "@/lib/news/newsapi";
import { fetchFromGNews } from "@/lib/news/gnews";
import { fetchFromGuardian } from "@/lib/news/guardian";
import type { NormalizedArticle } from "@/lib/news/types";

export async function fetchAllNews(): Promise<NormalizedArticle[]> {
  const results = await Promise.allSettled([
    fetchFromNewsAPI(),
    fetchFromGNews(),
    fetchFromGuardian(),
  ]);

  const articles = results
    .filter(
      (r): r is PromiseFulfilledResult<NormalizedArticle[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);

  const seen = new Set<string>();
  const unique: NormalizedArticle[] = [];
  for (const a of articles) {
    const k = a.original_url;
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(a);
  }
  return unique;
}
