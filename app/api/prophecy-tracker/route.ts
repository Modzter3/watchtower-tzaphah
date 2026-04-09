import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("prophecy_tracker")
      .select("*")
      .order("last_updated", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ items: [] });
  }
}
