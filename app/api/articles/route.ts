import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchArticlesEnriched } from "@/lib/api/articles-query";
import type { UrgencyLevel } from "@/lib/types/article";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 30),
    );
    const urgencyParam = searchParams.get("urgency");
    const urgency = urgencyParam
      ? (urgencyParam.split(",").filter(Boolean) as UrgencyLevel[])
      : undefined;

    const supabase = createSupabaseAdminClient();
    const articles = await fetchArticlesEnriched(supabase, { limit, urgency });

    return NextResponse.json({ articles });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load articles", articles: [] },
      { status: 500 },
    );
  }
}
