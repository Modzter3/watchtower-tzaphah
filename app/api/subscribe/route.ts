import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    channel: "articles",
    hint: "Subscribe with Supabase Realtime on table public.articles (postgres_changes).",
  });
}
