import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, FolderGit2, ArrowRight } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { getEditableProfile } from "@/lib/profile-store";
import { getPublishedProjects } from "@/lib/projects-local";
import { ProfileEditor } from "@/components/studio/ProfileEditor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { LogoutButton } from "@/components/studio/LogoutButton";

export default async function StudioPage() {
  if (!(await isAuthenticated())) redirect("/studio/login");

  const profile = getEditableProfile();
  const publishedCount = getPublishedProjects().length;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Studio"
          title="Edit your profile"
          description="Local saves update this machine right away. On the live site, Studio commits to GitHub and redeploys in about two minutes."
        />
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/studio/week" className="block">
          <GlassCard hover className="flex h-full items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <CalendarDays className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">Week log</p>
              <p className="text-sm text-slate-400">
                Fitness, meals, Ravens, Heimdall, newsletter, CareerOps
              </p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-500" />
          </GlassCard>
        </Link>
        <Link href="/studio/projects" className="block">
          <GlassCard hover className="flex h-full items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <FolderGit2 className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">Manage projects</p>
              <p className="text-sm text-slate-400">
                Scan local projects and pick which to publish · {publishedCount}{" "}
                published
              </p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-500" />
          </GlassCard>
        </Link>
      </div>

      <div className="mt-10">
        <ProfileEditor initial={profile} />
      </div>
    </div>
  );
}
