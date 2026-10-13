import type { Metadata } from "next";
import { HandbookLibrary } from "@/components/handbooks/HandbookLibrary";

export const metadata: Metadata = {
  title: "Handbooks",
  description:
    "How the work moves from a business problem to a measured outcome. Field cards stay the overview. Stories stay the proof.",
  alternates: { canonical: "/handbooks" },
};

export default function HandbooksPage() {
  return <HandbookLibrary />;
}
