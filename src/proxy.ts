import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Coarse, cookie-presence gate for UX + noindex. Full signature verification
// happens in the Studio page and API handlers (Node runtime, node:crypto).
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  // Protect Studio write APIs (login endpoint stays open).
  if (
    pathname.startsWith("/api/studio") &&
    !pathname.startsWith("/api/studio/login")
  ) {
    if (!hasCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Redirect unauthenticated visitors away from Studio pages (except login).
  if (pathname.startsWith("/studio") && pathname !== "/studio/login") {
    if (!hasCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/studio/login";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/studio")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  matcher: ["/studio/:path*", "/api/studio/:path*"],
};
