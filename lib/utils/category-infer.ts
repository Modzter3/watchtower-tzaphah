import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";
import type { CategorySlug } from "@/lib/constants/categories";

/** Score categories by keyword hits in free text (headline, summary, etc.). */
export function inferCategorySlugsFromText(
  text: string,
  max = 3,
): CategorySlug[] {
  if (!text.trim()) return [];
  const t = text.toLowerCase();
  const scored: { slug: CategorySlug; score: number }[] = [];

  for (const c of PROPHETIC_CATEGORIES) {
    let score = 0;
    for (const kw of c.keywords) {
      const k = kw.toLowerCase();
      if (t.includes(k)) score += Math.min(20, k.length);
    }
    if (score > 0) scored.push({ slug: c.slug, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const out = [...new Set(scored.map((x) => x.slug))];
  return out.slice(0, max) as CategorySlug[];
}
