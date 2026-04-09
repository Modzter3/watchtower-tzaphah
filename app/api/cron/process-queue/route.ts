import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUpstashRestRedis } from "@/lib/queue/redis";
import { processArticleClassification } from "@/lib/queue/process-one";
import { verifyCronRequest } from "@/lib/api/cron-auth";
import { computeTzaphahScore } from "@/lib/utils/tzaphah";
import type { UrgencyLevel } from "@/lib/types/article";

export const maxDuration = 300;

const BATCH = 6; // Increased back to 6 now that stability is higher

function cronErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function processFromRedis(): Promise<number> {
  const redis = getUpstashRestRedis();
  if (!redis) return 0;
  let done = 0;
  for (let i = 0; i < BATCH; i++) {
    try {
      const id = await redis.lpop<string>("tzaphah:classification_queue");
      if (!id) break;
      const r = await processArticleClassification(id);
      if (r.ok) done++;
    } catch (e) {
      console.error("processFromRedis:", e);
      break;
    }
  }
  return done;
}

async function processFromDatabase(): Promise<{ done: number; debug?: any }> {
  const supabase = createSupabaseAdminClient();

  // Debug: Check total counts by status
  const { data: counts, error: countErr } = await supabase
    .from("articles")
    .select("analysis_status");

  const debug: any = {
    total: counts?.length ?? 0,
    statuses: {},
    error: countErr,
  };

  if (counts) {
    for (const c of counts) {
      const s = c.analysis_status || "NULL";
      debug.statuses[s] = (debug.statuses[s] ?? 0) + 1;
    }
  }

  const { data: queued, error: fetchErr } = await supabase
    .from("articles")
    .select("id")
    .in("analysis_status", ["QUEUED", "FAILED"]) // Retry failed ones too
    .order("created_at", { ascending: true })
    .limit(BATCH);

  if (fetchErr) {
    debug.fetchError = fetchErr;
    return { done: 0, debug };
  }

  if (!queued?.length) return { done: 0, debug };

  let done = 0;
  for (const row of queued) {
    try {
      const r = await processArticleClassification(row.id as string);
      if (r.ok) {
        done++;
      } else {
        console.warn(`Classification failed for article ${row.id}: ${r.error}`);
        if (!debug.failures) debug.failures = [];
        debug.failures.push({ id: row.id, error: r.error });
      }
    } catch (e) {
      console.error(`Unexpected error processing article ${row.id}:`, e);
    }
  }
  return { done, debug };
}

async function refreshTzaphahIndex(): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("articles")
      .select("urgency_level, watch_level")
      .gte("created_at", since)
      .eq("analysis_status", "COMPLETE");

    const articles = (recent ?? []).map((a) => ({
      urgency_level: a.urgency_level as UrgencyLevel | null,
      watch_level: a.watch_level as number | null,
    }));
    const score = computeTzaphahScore(articles);

    const { error } = await supabase.from("tzaphah_index").insert({
      score,
      article_count: articles.length,
      dominant_category: null,
      watchman_reading: null,
    });
    if (error) console.error("tzaphah_index insert:", error);
  } catch (e) {
    console.error("refreshTzaphahIndex:", e);
  }
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

    try {
      createSupabaseAdminClient();
    } catch (e) {
      return NextResponse.json(
        {
          error: "Supabase not configured",
          message: cronErrorMessage(e),
        },
        { status: 503 },
      );
    }

    const fromRedis = await processFromRedis();
    const { done: fromDb, debug } = fromRedis === 0 ? await processFromDatabase() : { done: 0 };
    await refreshTzaphahIndex();
    return NextResponse.json({
      processed: fromRedis + (fromDb ?? 0),
      source: fromRedis > 0 ? "redis" : "database",
      debug,
      serverTime: new Date().toISOString(), // Ensure fresh response
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed", message: cronErrorMessage(e) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
