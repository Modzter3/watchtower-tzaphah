import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("tzaphah_index")
      .select("*")
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      index: data ?? {
        score: 0,
        computed_at: null,
        article_count: 0,
        dominant_category: null,
        watchman_reading: null,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        index: {
          score: 0,
          computed_at: null,
          article_count: 0,
          dominant_category: null,
          watchman_reading: null,
        },
      },
      { status: 200 },
    );
  }
}
