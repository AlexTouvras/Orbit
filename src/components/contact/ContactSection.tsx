import { cv } from "@/content/cv";
import { describeWindow, listOpenDays } from "@/lib/appointments/slots";
import { loadAppointments } from "@/lib/appointments/store";
import { getEditableProfile, getResolvedSocials } from "@/lib/profile-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { AppointmentBooker } from "@/components/contact/AppointmentBooker";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSidebar } from "@/components/contact/ContactSidebar";

export async function ContactSection() {
  const profile = getEditableProfile();
  const email = profile.email || cv.email;
  const location = profile.location || cv.location;
  const socials = getResolvedSocials();
  const loaded = await loadAppointments();
  const days = loaded.ok
    ? listOpenDays(loaded.store.window, loaded.store.bookings, new Date())
    : [];

  return (
    <section aria-labelledby="contact-heading" className="space-y-10">
      <h2 id="contact-heading" className="sr-only">
        Contact
      </h2>
      <Reveal>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_320px]">
          <GlassCard className="p-6 sm:p-8">
            <ContactForm fallbackEmail={email} />
          </GlassCard>
          <ContactSidebar email={email} location={location} socials={socials} />
        </div>
      </Reveal>
      <Reveal>
        <GlassCard className="p-6 sm:p-8">
          <AppointmentBooker
            available={loaded.ok}
            summary={loaded.ok ? describeWindow(loaded.store.window) : ""}
            days={days}
          />
        </GlassCard>
      </Reveal>
    </section>
  );
}
