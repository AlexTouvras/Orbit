import type { Metadata } from "next";
import { HandbookLibrary } from "@/components/handbooks/HandbookLibrary";

export const metadata: Metadata = {
  title: "Handbooks",
  description:
    "Books on how the work is done. Each one extends a field card. Stories stay the proof.",
  alternates: { canonical: "/handbooks" },
};

export default function HandbooksPage() {
  return <HandbookLibrary />;
}
