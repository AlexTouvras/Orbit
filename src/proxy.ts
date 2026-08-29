import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

function studioDevOpen(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.STUDIO_DEV_OPEN?.trim() === "1"
  );
}

function isPublicStudioApi(pathname: string): boolean {
  return (
    pathname.startsWith("/api/studio/login") ||
    pathname.startsWith("/api/studio/oauth/")
  );
}

// Coarse, cookie-presence gate for UX + noindex. Full signature verification
// happens in the Studio page and API handlers (Node runtime, node:crypto).
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  const openLocal = studioDevOpen();

  // Protect Studio write APIs (login + OAuth stay open).
  if (pathname.startsWith("/api/studio") && !isPublicStudioApi(pathname)) {
    if (!hasCookie && !openLocal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Redirect unauthenticated visitors away from Studio pages (except login).
  if (pathname.startsWith("/studio") && pathname !== "/studio/login") {
    if (!hasCookie && !openLocal) {
      const url = req.nextUrl.clone();
      const dest = `${pathname}${req.nextUrl.search}`;
      url.pathname = "/studio/login";
      url.search = "";
      url.searchParams.set("next", dest);
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
