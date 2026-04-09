import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews } from "@/lib/news/aggregator";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { queueArticleForClassification } from "@/lib/queue/queue";
import { isRelevant } from "@/lib/ai/classify";
import { verifyCronRequest } from "@/lib/api/cron-auth";

/** Vercel caps this to your plan max (Hobby ≈ 10–60s). Keep batch small to avoid timeouts. */
export const maxDuration = 300;

function cronErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in Vercel environment variables" },
        { status: 503 },
      );
    }

    let supabase: ReturnType<typeof createSupabaseAdminClient>;
    try {
      supabase = createSupabaseAdminClient();
    } catch (e) {
      return NextResponse.json(
        {
          error: "Supabase not configured",
          message: cronErrorMessage(e),
        },
        { status: 503 },
      );
    }

    const raw = await fetchAllNews();
    const batchCap = Math.max(
      1,
      Math.min(50, Number(process.env.CRON_FETCH_BATCH) || 25),
    );
    const skipRelevance = process.env.CRON_SKIP_RELEVANCE === "1";
    const strictRelevance = process.env.CRON_STRICT_RELEVANCE === "1";
    const articles = raw.slice(0, batchCap);

    let inserted = 0;
    let skipped = 0;
    let skippedDuplicate = 0;
    let skippedIrrelevant = 0;
    let skippedInsertFailed = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        const { data: existing } = await supabase
          .from("articles")
          .select("id")
          .eq("original_url", article.original_url)
          .maybeSingle();

        if (existing) {
          skipped++;
          skippedDuplicate++;
          continue;
        }

        let relevant = true;
        if (!skipRelevance) {
          try {
            relevant = await isRelevant(
              article.headline,
              article.full_content.slice(0, 2000),
              { strict: strictRelevance },
            );
          } catch (e) {
            console.error("isRelevant:", e);
            errors++;
            continue;
          }
        }

        if (!relevant) {
          skipped++;
          skippedIrrelevant++;
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
          skippedInsertFailed++;
          continue;
        }

        await queueArticleForClassification(newArticle.id as string);
        inserted++;
      } catch (e) {
        console.error("fetch-news article loop:", e);
        errors++;
      }
    }

    return NextResponse.json({
      inserted,
      skipped,
      skippedDuplicate,
      skippedIrrelevant,
      skippedInsertFailed,
      errors,
      batchSize: articles.length,
      totalFetched: raw.length,
      relevanceFilterOff: skipRelevance,
      relevanceStrictMode: strictRelevance,
      hint:
        skippedIrrelevant > 0 && !skipRelevance
          ? "AI marked these as not relevant. Default filter is now inclusive; redeploy latest. Optional: CRON_STRICT_RELEVANCE=1 for fewer inserts, CRON_SKIP_RELEVANCE=1 to skip the filter, or raise CRON_FETCH_BATCH to scan more headlines per run."
          : undefined,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Failed", message: cronErrorMessage(error) },
      { status: 500 },
    );
  }
}
