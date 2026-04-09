import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveArticleUrgencyColor } from "@/lib/utils/tzaphah";
import type { ArticleWithRelations, UrgencyLevel } from "@/lib/types/article";
import type { CategorySlug } from "@/lib/constants/categories";

export async function fetchArticlesEnriched(
  supabase: SupabaseClient,
  options: {
    limit?: number;
    urgency?: UrgencyLevel[];
    offset?: number;
  } = {},
): Promise<ArticleWithRelations[]> {
  const limit = options.limit ?? 30;
  const offset = options.offset ?? 0;

  let q = supabase
    .from("articles")
    .select("*")
    .eq("is_duplicate", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.urgency?.length) {
    q = q.in("urgency_level", options.urgency);
  }

  const { data: rows, error } = await q;
  if (error) {
    throw new Error(error.message);
  }
  if (!rows?.length) return [];

  const ids = rows.map((r) => r.id as string);

  const { data: cats } = await supabase
    .from("article_categories")
    .select("article_id, category_slug")
    .in("article_id", ids);

  const { data: refs } = await supabase
    .from("scripture_references")
    .select("*")
    .in("article_id", ids);

  const catByArticle = new Map<string, CategorySlug[]>();
  for (const c of cats ?? []) {
    const aid = c.article_id as string;
    const list = catByArticle.get(aid) ?? [];
    list.push(c.category_slug as CategorySlug);
    catByArticle.set(aid, list);
  }

  const refByArticle = new Map<string, typeof refs>();
  for (const r of refs ?? []) {
    const aid = r.article_id as string;
    const list = refByArticle.get(aid) ?? [];
    list.push(r);
    refByArticle.set(aid, list);
  }

  return rows.map((row) => {
    const urgency = row.urgency_level as UrgencyLevel | null;
    return {
      ...(row as ArticleWithRelations),
      categories: catByArticle.get(row.id as string) ?? [],
      scripture_references: refByArticle.get(row.id as string) ?? [],
      urgency_color: resolveArticleUrgencyColor(
        urgency,
        row.analysis_status as string,
      ),
    };
  });
}

export async function fetchArticleById(
  supabase: SupabaseClient,
  id: string,
): Promise<ArticleWithRelations | null> {
  const { data: row, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return null;

  const { data: cats } = await supabase
    .from("article_categories")
    .select("category_slug")
    .eq("article_id", id);

  const { data: refs } = await supabase
    .from("scripture_references")
    .select("*")
    .eq("article_id", id);

  const urgency = row.urgency_level as UrgencyLevel | null;
  return {
    ...(row as ArticleWithRelations),
    categories: (cats ?? []).map((c) => c.category_slug as CategorySlug),
    scripture_references: refs ?? [],
    urgency_color: resolveArticleUrgencyColor(
      urgency,
      row.analysis_status as string,
    ),
  };
}
