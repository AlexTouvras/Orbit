import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";

interface ContactHeroProps {
  email: string;
}

export function ContactHero({ email }: ContactHeroProps) {
  return (
    <MissionHero
      signature={<OrbitSignature variant="violet" duration="95s" />}
      badge={
        <Badge tone="violet" className="mb-8">
          <Mail className="mr-1.5 h-3.5 w-3.5" />
          Get in touch
        </Badge>
      }
      title="Let's talk"
      subtitle="Delivery, data, and AI automation"
      description="Whether it's a role, a project, or a broken pipeline — send a message and I'll get back to you."
      meta={
        <a
          href={`mailto:${email}`}
          className="focus-ring text-sm font-medium text-slate-400 transition-colors hover:text-neon-cyan"
        >
          Or email directly →
        </a>
      }
    />
  );
}
