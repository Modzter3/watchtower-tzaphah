import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { queueArticleForClassification } from "@/lib/queue/queue";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const bodySchema = z.object({ articleId: z.string().uuid() });

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export async function POST(request: NextRequest) {
  if (hasClerk) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: article } = await supabase
    .from("articles")
    .select("id")
    .eq("id", parsed.data.articleId)
    .maybeSingle();

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabase
    .from("articles")
    .update({
      analysis_status: "QUEUED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.articleId);

  await queueArticleForClassification(parsed.data.articleId);
  return NextResponse.json({ ok: true });
}
