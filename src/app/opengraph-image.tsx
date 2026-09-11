import { ImageResponse } from "next/og";
import { getEditableProfile } from "@/lib/profile-store";
import { OG_SIZE, renderSiteOgCard } from "@/lib/seo/og-card";

export const runtime = "nodejs";
export const alt = "Orbit — personal portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  const profile = getEditableProfile();

  return new ImageResponse(
    renderSiteOgCard({
      name: profile.name,
      role: profile.role,
      pillars: profile.pillars,
    }),
    { ...OG_SIZE },
  );
}
