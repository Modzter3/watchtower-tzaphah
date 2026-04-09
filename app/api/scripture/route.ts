import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("q") ?? "").trim();
  const q = raw.replace(/[%*,]/g, " ").slice(0, 120);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 40));

  if (!q) {
    return NextResponse.json({ verses: [] });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const pattern = `%${q}%`;
    const { data, error } = await supabase
      .from("kjv_verses")
      .select("book,chapter,verse,text")
      .or(`text.ilike.${pattern},book.ilike.${pattern}`)
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ verses: data ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ verses: [] });
  }
}
