import { ImageResponse } from "next/og";
import { getEditableProfile } from "@/lib/profile-store";
import { getWriteBySlug } from "@/lib/writes";
import { OG_SIZE, renderWriteOgCard } from "@/lib/seo/og-card";

export const runtime = "nodejs";
export const alt = "Orbit Write";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Auto-generated for every Write from frontmatter — no per-post image file needed. */
export default async function WriteOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const write = getWriteBySlug(slug);
  const profile = getEditableProfile();

  return new ImageResponse(
    renderWriteOgCard({
      title: write?.title ?? "Orbit Write",
      category: write?.category ?? "Learning",
      name: profile.name,
    }),
    { ...OG_SIZE },
  );
}
