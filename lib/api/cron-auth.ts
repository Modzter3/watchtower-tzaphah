import type { NextRequest } from "next/server";

export function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  // Check both Bearer header and ?secret= query param
  return authHeader === `Bearer ${secret}` || querySecret === secret;
}
