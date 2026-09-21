import { competencies, profile as profileDefaults } from "@/content/profile";
import { getEditableProfile } from "@/lib/profile-store";
import { getFeaturedWrites, getShowcaseWrites } from "@/lib/writes";
import { liveDesks } from "@/content/live-desks";
import { HubHero } from "@/components/hub/HubHero";
import { GravityScene } from "@/components/hub/GravityScene";
import { CraftScene } from "@/components/hub/CraftScene";
import { ProofReel } from "@/components/hub/ProofReel";
import { LiveQuestions } from "@/components/hub/LiveQuestions";
import { SignalList } from "@/components/hub/SignalList";
import { StoryClose } from "@/components/hub/StoryClose";
import { StoryScene } from "@/components/story/StoryScene";
import { StoryProgress } from "@/components/story/StoryProgress";

const HUB_CHAPTERS = [
  { id: "story-open", label: "Open" },
  { id: "story-gravity", label: "Gravity" },
  { id: "story-craft", label: "Craft" },
  { id: "selected-work", label: "Proof" },
  { id: "story-live", label: "Live" },
  { id: "story-signals", label: "Signals" },
  { id: "story-close", label: "Close" },
];

export default function HomePage() {
  const profile = getEditableProfile();
  const showcaseWrites = getShowcaseWrites(5);
  const featuredWrites = getFeaturedWrites(4);
  const desks = liveDesks.filter((d) => d.status === "live");

  return (
    <div>
      <StoryProgress chapters={HUB_CHAPTERS} />

      <StoryScene id="story-open" viewport>
        <HubHero
          name={profile.name}
          pillars={profile.pillars}
          tagline={profile.tagline}
          contactCta={profileDefaults.contactCta}
          socials={profile.socials}
          avatarUrl={profile.avatarUrl}
        />
      </StoryScene>

      <StoryScene id="story-gravity">
        <GravityScene whyOrbit={profileDefaults.whyOrbit} />
      </StoryScene>

      <StoryScene id="story-craft">
        <CraftScene competencies={competencies} />
      </StoryScene>

      <StoryScene id="selected-work">
        <ProofReel writes={showcaseWrites} />
      </StoryScene>

      <StoryScene id="story-live">
        <LiveQuestions desks={desks} />
      </StoryScene>

      <StoryScene id="story-signals">
        <SignalList writes={featuredWrites} />
      </StoryScene>

      <StoryScene id="story-close" width="copy" className="pb-28 sm:pb-32">
        <StoryClose
          summary={profile.summary}
          contactCta={profileDefaults.contactCta}
        />
      </StoryScene>
    </div>
  );
}
