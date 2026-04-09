import type { SupabaseClient } from "@supabase/supabase-js";
import type { PropheticAnalysis } from "@/lib/ai/types";
import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";
import type { CategorySlug } from "@/lib/constants/categories";
import { inferCategorySlugsFromText } from "@/lib/utils/category-infer";

const validSlugs = new Set(
  PROPHETIC_CATEGORIES.map((c) => c.slug) as CategorySlug[],
);

const TIMELINE_FALLBACK_SLUG: Partial<
  Record<PropheticAnalysis["propheticTimelinePlacement"], CategorySlug>
> = {
  SIGNS_OF_THE_TIMES: "natural-signs",
  LATTER_DAYS_NOW: "wars-and-rumors",
  ISRAELS_RESTORATION: "israel-land",
  BEAST_SYSTEM_RISING: "beast-system",
  THE_SCATTERING_CONTINUES: "deut28-curses",
  NATIONS_IN_COMMOTION: "wars-and-rumors",
};

function normalizeCategorySlug(raw: string): CategorySlug | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (validSlugs.has(s as CategorySlug)) return s as CategorySlug;

  const found = PROPHETIC_CATEGORIES.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, " ") === raw.toLowerCase().trim(),
  );
  if (found) return found.slug;

  const compact = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  const rc = compact(raw);
  for (const c of PROPHETIC_CATEGORIES) {
    if (rc.includes(compact(c.slug)) || compact(c.slug).includes(rc)) {
      return c.slug;
    }
  }

  for (const c of PROPHETIC_CATEGORIES) {
    const parts = c.slug.split("-").filter((p) => p.length > 2);
    if (parts.length && parts.every((p) => s.includes(p))) return c.slug;
  }

  return null;
}

function clampLatLng(
  lat: number | null,
  lng: number | null,
): { lat: number | null; lng: number | null } {
  if (lat == null || lng == null) return { lat: null, lng: null };
  if (!Number.isFinite(lat) || !Number.isFinite(lng))
    return { lat: null, lng: null };
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return { lat: null, lng: null };
  return { lat, lng };
}

export async function persistPropheticAnalysis(
  supabase: SupabaseClient,
  articleId: string,
  analysis: PropheticAnalysis,
  context: { headline: string; bodySnippet?: string },
): Promise<void> {
  const geo = clampLatLng(
    analysis.geolocation.lat,
    analysis.geolocation.lng,
  );

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
      lat: geo.lat,
      lng: geo.lng,
      is_apocrypha_connected: analysis.isApocryphaConnected,
      analysis_status: "COMPLETE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  await supabase.from("article_categories").delete().eq("article_id", articleId);

  let slugs = [
    ...new Set(
      analysis.categories
        .map(normalizeCategorySlug)
        .filter((x): x is CategorySlug => x !== null),
    ),
  ];

  if (slugs.length === 0) {
    const blob = [
      context.headline,
      analysis.propheticSummary,
      analysis.urgencyReason,
      context.bodySnippet?.slice(0, 2500),
    ]
      .filter(Boolean)
      .join("\n");
    slugs = inferCategorySlugsFromText(blob, 3);
  }

  if (slugs.length === 0) {
    const fb = TIMELINE_FALLBACK_SLUG[analysis.propheticTimelinePlacement];
    if (fb) slugs = [fb];
  }

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
