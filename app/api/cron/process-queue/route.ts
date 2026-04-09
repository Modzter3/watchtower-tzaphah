import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUpstashRestRedis } from "@/lib/queue/redis";
import { processArticleClassification } from "@/lib/queue/process-one";
import { verifyCronRequest } from "@/lib/api/cron-auth";
import { computeTzaphahScore } from "@/lib/utils/tzaphah";
import type { UrgencyLevel } from "@/lib/types/article";

const BATCH = 8;

async function processFromRedis(): Promise<number> {
  const redis = getUpstashRestRedis();
  if (!redis) return 0;
  let done = 0;
  for (let i = 0; i < BATCH; i++) {
    const id = await redis.lpop<string>("tzaphah:classification_queue");
    if (!id) break;
    const r = await processArticleClassification(id);
    if (r.ok) done++;
  }
  return done;
}

async function processFromDatabase(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { data: queued } = await supabase
    .from("articles")
    .select("id")
    .eq("analysis_status", "QUEUED")
    .order("created_at", { ascending: true })
    .limit(BATCH);

  if (!queued?.length) return 0;
  let done = 0;
  for (const row of queued) {
    const r = await processArticleClassification(row.id as string);
    if (r.ok) done++;
  }
  return done;
}

async function refreshTzaphahIndex(): Promise<void> {
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

  await supabase.from("tzaphah_index").insert({
    score,
    article_count: articles.length,
    dominant_category: null,
    watchman_reading: null,
  });
}

export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fromRedis = await processFromRedis();
    const fromDb = fromRedis === 0 ? await processFromDatabase() : 0;
    await refreshTzaphahIndex();
    return NextResponse.json({
      processed: fromRedis + fromDb,
      source: fromRedis > 0 ? "redis" : "database",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
