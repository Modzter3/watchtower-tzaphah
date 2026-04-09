import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews } from "@/lib/news/aggregator";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { queueArticleForClassification } from "@/lib/queue/queue";
import { isRelevant } from "@/lib/ai/classify";
import { verifyCronRequest } from "@/lib/api/cron-auth";

export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const articles = await fetchAllNews();

    let inserted = 0;
    let skipped = 0;

    for (const article of articles) {
      const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("original_url", article.original_url)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      const relevant = await isRelevant(
        article.headline,
        article.full_content.slice(0, 2000),
      );
      if (!relevant) {
        skipped++;
        continue;
      }

      const { data: newArticle, error } = await supabase
        .from("articles")
        .insert({
          source_name: article.source_name,
          source_url: article.source_url ?? null,
          headline: article.headline,
          original_url: article.original_url,
          full_content: article.full_content,
          published_at: article.published_at,
          analysis_status: "QUEUED",
          fetched_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error || !newArticle) {
        skipped++;
        continue;
      }

      await queueArticleForClassification(newArticle.id as string);
      inserted++;
    }

    return NextResponse.json({ inserted, skipped });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
