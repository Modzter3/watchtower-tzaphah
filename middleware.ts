import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function passthrough(_request: NextRequest, _event: NextFetchEvent) {
  void _request;
  void _event;
  return NextResponse.next();
}

/**
 * Cron jobs send `Authorization: Bearer <CRON_SECRET>`. Clerk middleware would try to parse
 * that as a Clerk session JWT and can throw → 500 with no JSON body. Skip Clerk for cron API.
 */
export default hasClerk
  ? clerkMiddleware(async (_auth, req) => {
      if (req.nextUrl.pathname.startsWith("/api/cron/")) {
        return NextResponse.next();
      }
    })
  : passthrough;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/cron (cron jobs - MUST BE EXCLUDED FOR AUTH)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/cron).*)",
  ],
};
