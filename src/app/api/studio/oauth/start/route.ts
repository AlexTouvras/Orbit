import { NextResponse, type NextRequest } from "next/server";
import { safeStudioPath } from "@/lib/studio-path";

export const runtime = "nodejs";

function siteOrigin(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  return req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/studio/login?error=oauth_unconfigured", req.url),
    );
  }

  const next = safeStudioPath(req.nextUrl.searchParams.get("next"));
  const state = Buffer.from(
    JSON.stringify({ next, n: crypto.randomUUID() }),
    "utf8",
  ).toString("base64url");

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set(
    "redirect_uri",
    `${siteOrigin(req)}/api/studio/oauth/callback`,
  );
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("state", state);

  const res = NextResponse.redirect(authorize);
  res.cookies.set("orbit_studio_oauth", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
