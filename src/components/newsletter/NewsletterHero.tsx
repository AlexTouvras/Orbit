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
      title="Weekly digest"
      headline={{ line: "One article.", accent: "A few links." }}
      description="Tuesday mail: this week's Write, a few pieces I actually read, and one note per area that moved."
    />
  );
}
