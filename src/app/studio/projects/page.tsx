import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isStudioAccessible } from "@/lib/auth";
import { getPublishedProjects } from "@/lib/projects-local";
import { ProjectsManager } from "@/components/studio/ProjectsManager";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function StudioProjectsPage() {
  if (!(await isStudioAccessible())) redirect("/studio/login");

  const published = getPublishedProjects();

  return (
    <div>
      <Link
        href="/studio"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Studio
      </Link>

      <SectionHeading
        eyebrow="Studio"
        title="Projects"
        description="Scan the projects on your machine, then tick the ones to publish. Set a status, tags, and links for each."
      />

      <div className="mt-10">
        <ProjectsManager initialPublished={published} />
      </div>
    </div>
  );
}
