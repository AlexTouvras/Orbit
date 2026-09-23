import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isStudioAccessible } from "@/lib/auth";
import { getStudioRoadmap } from "@/lib/studio-roadmap";
import { RoadmapEditor } from "@/components/studio/RoadmapEditor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LogoutButton } from "@/components/studio/LogoutButton";

export const metadata: Metadata = {
  title: "Studio · Roadmap",
  robots: { index: false, follow: false },
};

export default async function StudioRoadmapPage() {
  if (!(await isStudioAccessible())) redirect("/studio/login");

  const roadmap = getStudioRoadmap();

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/studio"
            className="focus-ring mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm text-slate-400 hover:text-neon-cyan"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Studio
          </Link>
          <SectionHeading
            eyebrow="Studio"
            title="Roadmap"
            description="WHERE you are going. NOW on /card is focusNow only — milestones stay private."
          />
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10">
        <RoadmapEditor initial={roadmap} />
      </div>
    </div>
  );
}
