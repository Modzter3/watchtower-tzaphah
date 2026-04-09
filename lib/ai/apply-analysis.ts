import type { SupabaseClient } from "@supabase/supabase-js";
import type { PropheticAnalysis } from "@/lib/ai/types";
import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";
import type { CategorySlug } from "@/lib/constants/categories";

const validSlugs = new Set(
  PROPHETIC_CATEGORIES.map((c) => c.slug) as CategorySlug[],
);

function normalizeCategorySlug(raw: string): CategorySlug | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (validSlugs.has(s as CategorySlug)) return s as CategorySlug;
  const found = PROPHETIC_CATEGORIES.find(
    (c) => c.name.toLowerCase() === raw.toLowerCase(),
  );
  return found ? found.slug : null;
}

export async function persistPropheticAnalysis(
  supabase: SupabaseClient,
  articleId: string,
  analysis: PropheticAnalysis,
): Promise<void> {
  await supabase
    .from("articles")
    .update({
      prophetic_summary: analysis.propheticSummary,
      urgency_level: analysis.urgencyLevel,
      urgency_reason: analysis.urgencyReason,
      watch_level: analysis.watchLevel,
      prophetic_timeline: analysis.propheticTimelinePlacement,
      watchman_note: analysis.watchmanNote,
      deut28_connection: analysis.deuteronomy28Connection,
      country: analysis.geolocation.country,
      city: analysis.geolocation.city,
      region: analysis.geolocation.region,
      lat: analysis.geolocation.lat,
      lng: analysis.geolocation.lng,
      is_apocrypha_connected: analysis.isApocryphaConnected,
      analysis_status: "COMPLETE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  await supabase.from("article_categories").delete().eq("article_id", articleId);

  const slugs = [
    ...new Set(
      analysis.categories
        .map(normalizeCategorySlug)
        .filter((x): x is CategorySlug => x !== null),
    ),
  ];

  if (slugs.length > 0) {
    await supabase.from("article_categories").insert(
      slugs.map((category_slug) => ({ article_id: articleId, category_slug })),
    );
  }

  await supabase
    .from("scripture_references")
    .delete()
    .eq("article_id", articleId);

  const allRefs = [
    ...analysis.scriptureReferences,
    ...(analysis.apocryphaReferences ?? []),
  ];

  if (allRefs.length > 0) {
    await supabase.from("scripture_references").insert(
      allRefs.map((ref) => ({
        article_id: articleId,
        reference: ref.reference,
        verse_text: ref.verseText,
        relevance_note: ref.relevanceNote,
        book: ref.book,
        chapter: ref.chapter,
        verse_start: ref.verseStart,
        verse_end: ref.verseEnd,
        is_apocrypha: ref.isApocrypha,
      })),
    );
  }
}
