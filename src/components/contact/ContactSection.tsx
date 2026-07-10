import { cv } from "@/content/cv";
import { getEditableProfile, getResolvedSocials } from "@/lib/profile-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSidebar } from "@/components/contact/ContactSidebar";

export function ContactSection() {
  const profile = getEditableProfile();
  const email = profile.email || cv.email;
  const location = profile.location || cv.location;
  const socials = getResolvedSocials();

  return (
    <section aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="sr-only">
        Contact form
      </h2>
      <Reveal>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_320px]">
          <GlassCard className="p-6 sm:p-8">
            <ContactForm fallbackEmail={email} />
          </GlassCard>
          <ContactSidebar email={email} location={location} socials={socials} />
        </div>
      </Reveal>
    </section>
  );
}
