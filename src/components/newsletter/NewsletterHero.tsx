import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";

interface NewsletterHeroProps {
  avatarUrl?: string;
}

export function NewsletterHero({ avatarUrl }: NewsletterHeroProps) {
  return (
    <MissionHero
      signature={<OrbitSignature variant="cyan" duration="90s" />}
      badge={
        <Badge tone="cyan" className="mb-8">
          <Mail className="mr-1.5 h-3.5 w-3.5" />
          Weekly digest
        </Badge>
      }
      avatarUrl={avatarUrl}
      title="Orbit weekly"
      subtitle="The week's highlights, not the whole notebook"
      description="Each Tuesday: this week's Write, a few Related articles I actually read, and one Ravens note per beat that moved."
    />
  );
}
