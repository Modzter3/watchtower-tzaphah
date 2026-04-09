import { classifyArticle } from "@/lib/ai/classify";
import { persistPropheticAnalysis } from "@/lib/ai/apply-analysis";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function processArticleClassification(
  articleId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseAdminClient();

  const { data: article, error: fetchErr } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .single();

  if (fetchErr || !article) {
    return { ok: false, error: "Article not found" };
  }

  // Fetch active tracker items to provide context to the AI
  const { data: trackerItems } = await supabase
    .from("prophecy_tracker")
    .select("id, title")
    .in("status", ["IN_PROGRESS", "WATCHING", "PENDING"]);

  try {
    const analysis = await classifyArticle(
      article.headline as string,
      (article.full_content as string) || "",
      trackerItems ?? [],
    );
    await persistPropheticAnalysis(supabase, articleId, analysis, {
      headline: article.headline as string,
      bodySnippet: (article.full_content as string) || "",
    });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Classification failed";
    await supabase
      .from("articles")
      .update({
        analysis_status: "FAILED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);
    return { ok: false, error: message };
  }
}
