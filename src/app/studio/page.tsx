import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, FolderGit2, Library, Map, ArrowRight } from "lucide-react";
import { calendarStatus, readCalendarBusy } from "@/lib/appointments/calendar";
import { formatWhen } from "@/lib/appointments/slots";
import { loadAppointments } from "@/lib/appointments/store";
import { isStudioAccessible } from "@/lib/auth";
import { getEditableProfile } from "@/lib/profile-store";
import { getPublishedProjects } from "@/lib/projects-local";
import { AppointmentWindowEditor } from "@/components/studio/AppointmentWindowEditor";
import { ProfileEditor } from "@/components/studio/ProfileEditor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { LogoutButton } from "@/components/studio/LogoutButton";

export default async function StudioPage() {
  if (!(await isStudioAccessible())) redirect("/studio/login");

  const profile = getEditableProfile();
  const publishedCount = getPublishedProjects().length;
  const appointments = await loadAppointments();
  const nowMs = new Date().getTime();
  const calendar = appointments.ok
    ? await readCalendarBusy(appointments.store.window, new Date(nowMs))
    : { connected: false as const };
  const upcoming =
    appointments.ok
      ? appointments.store.bookings
          .filter((booking) => Date.parse(booking.start) >= nowMs - 60 * 60 * 1000)
          .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
          .map((booking) => {
            const when = formatWhen(booking.start, appointments.store.window);
            return {
              id: booking.id,
              label: `${when.date}, ${when.range}`,
              name: booking.name,
              email: booking.email,
              note: booking.note,
            };
          })
      : [];

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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/studio/week" className="block">
          <GlassCard hover className="flex h-full items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <CalendarDays className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">Week log</p>
              <p className="text-sm text-slate-400">
                Fitness, meals, Ravens, newsletter, CareerOps
              </p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-500" />
          </GlassCard>
        </Link>
        <Link href="/studio/roadmap" className="block">
          <GlassCard hover className="flex h-full items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Map className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">Roadmap</p>
              <p className="text-sm text-slate-400">
                Trajectory + NOW for the identity HUD
              </p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-500" />
          </GlassCard>
        </Link>
        <Link href="/studio/directives" className="block">
          <GlassCard hover className="flex h-full items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Library className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">Directives</p>
              <p className="text-sm text-slate-400">
                Rules, skills, and automation prompts
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

      <div className="mt-10 space-y-10">
        {appointments.ok ? (
          <AppointmentWindowEditor
            initialWindow={appointments.store.window}
            upcoming={upcoming}
            calendarNote={calendarStatus(calendar)}
          />
        ) : (
          <p className="text-sm text-red-400">
            The appointment window could not be loaded.
          </p>
        )}
        <ProfileEditor initial={profile} />
      </div>
    </div>
  );
}
