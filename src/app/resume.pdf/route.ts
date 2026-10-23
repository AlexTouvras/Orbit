import { cv } from "@/content/cv";
import { renderCvPdf } from "@/lib/cv/render-pdf";
import { getEditableProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

function attachmentName(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "CV"}-CV.pdf`;
}

/** About’s Download CV. Painted from `cv.ts` on each request. */
export async function GET() {
  const profile = getEditableProfile();
  const bytes = await renderCvPdf(cv, {
    name: profile.name,
    role: profile.role,
    email: profile.email || cv.email,
    location: cv.location,
    linkedin: cv.linkedin,
  });

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${attachmentName(profile.name)}"`,
      "Cache-Control": "no-store",
    },
  });
}
