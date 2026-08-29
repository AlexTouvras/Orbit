import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  isGithubLoginAllowed,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { safeStudioPath } from "@/lib/studio-path";

export const runtime = "nodejs";

function siteOrigin(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  return req.nextUrl.origin;
}

function loginRedirect(req: NextRequest, error: string) {
  return NextResponse.redirect(
    new URL(`/studio/login?error=${encodeURIComponent(error)}`, req.url),
  );
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return loginRedirect(req, "oauth_unconfigured");
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expected = req.cookies.get("orbit_studio_oauth")?.value;
  if (!code || !state || !expected || state !== expected) {
    return loginRedirect(req, "oauth_state");
  }

  let next = "/studio";
  try {
    const parsed = JSON.parse(
      Buffer.from(state, "base64url").toString("utf8"),
    ) as { next?: string };
    next = safeStudioPath(parsed.next);
  } catch {
    next = "/studio";
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${siteOrigin(req)}/api/studio/oauth/callback`,
    }),
  });
  if (!tokenRes.ok) return loginRedirect(req, "oauth_token");
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!tokenJson.access_token) return loginRedirect(req, "oauth_token");

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenJson.access_token}`,
      "User-Agent": "Orbit-Studio",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!userRes.ok) return loginRedirect(req, "oauth_user");
  const user = (await userRes.json()) as { login?: string };
  if (!user.login || !isGithubLoginAllowed(user.login)) {
    return loginRedirect(req, "oauth_denied");
  }

  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  res.cookies.set("orbit_studio_oauth", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
