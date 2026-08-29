import { redirect } from "next/navigation";
import { githubOAuthConfigured, isStudioAccessible } from "@/lib/auth";
import { safeStudioPath } from "@/lib/studio-path";
import { EmergencyPasswordAccess } from "@/components/studio/EmergencyPasswordAccess";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock } from "lucide-react";

const ERROR_COPY: Record<string, string> = {
  oauth_unconfigured: "GitHub sign-in is not configured on this environment.",
  oauth_state: "GitHub sign-in expired. Try again.",
  oauth_token: "GitHub could not finish sign-in. Try again.",
  oauth_user: "Could not read your GitHub account.",
  oauth_denied: "That GitHub account is not allowed into Studio.",
};

export default async function StudioLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const dest = safeStudioPath(next);
  if (await isStudioAccessible()) redirect(dest);

  const oauthReady = githubOAuthConfigured();
  const oauthHref = `/api/studio/oauth/start?next=${encodeURIComponent(dest)}`;
  const errorText = error ? ERROR_COPY[error] ?? "Sign-in failed." : null;

  return (
    <div className="mx-auto max-w-md">
      <GlassCard className="p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Lock className="h-5 w-5 text-neon-cyan" />
          </div>
          <h1 className="text-xl font-bold text-white">Studio access</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in with GitHub to manage Orbit.
          </p>
        </div>

        {errorText ? (
          <p className="mb-4 text-sm text-red-400">{errorText}</p>
        ) : null}

        {oauthReady ? (
          <a
            href={oauthHref}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon-cyan px-4 py-3 text-sm font-semibold text-void transition-transform hover:scale-[1.02]"
          >
            Continue with GitHub
          </a>
        ) : (
          <p className="text-sm text-slate-400">
            GitHub OAuth is not configured here. Use emergency password access
            below, or set <code className="text-slate-300">GITHUB_CLIENT_ID</code>{" "}
            and <code className="text-slate-300">GITHUB_CLIENT_SECRET</code>.
          </p>
        )}

        <EmergencyPasswordAccess next={dest} />
      </GlassCard>
    </div>
  );
}
