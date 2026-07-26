import type { Metadata } from "next";
import { cv } from "@/content/cv";
import { getEditableProfile } from "@/lib/profile-store";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch about delivery, data analytics, AI automation, or what's broken in your stack.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const profile = getEditableProfile();
  const email = profile.email || cv.email;

  return (
    <div className="space-y-16 sm:space-y-20">
      <ContactHero email={email} />
      <ContactSection />
    </div>
  );
}
