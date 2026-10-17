import type { Metadata } from "next";
import { HandbookLibrary } from "@/components/handbooks/HandbookLibrary";
import { pageOpenGraph } from "@/lib/seo/share";

export const metadata: Metadata = {
  title: "Handbooks",
  description:
    "Books on how the work is done. Each one extends a field card. Stories stay the proof.",
  alternates: { canonical: "/handbooks" },
  openGraph: pageOpenGraph("/handbooks"),
};

export default function HandbooksPage() {
  return <HandbookLibrary />;
}
