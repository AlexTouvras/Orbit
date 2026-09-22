import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";

interface ContactHeroProps {
  email: string;
  avatarUrl?: string;
}

export function ContactHero({ email, avatarUrl }: ContactHeroProps) {
  return (
    <MissionHero
      signature={<OrbitSignature variant="violet" duration="95s" />}
      badge={
        <Badge tone="violet" className="mb-8">
          <Mail className="mr-1.5 h-3.5 w-3.5" />
          Get in touch
        </Badge>
      }
      avatarUrl={avatarUrl}
      title="Contact"
      headline={{ line: "Send the decision", accent: "you can't automate." }}
      description="A role in delivery, data, or AI automation. Or a system that produces results nobody has checked."
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
