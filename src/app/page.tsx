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

export default function HomePage() {
  const profile = getEditableProfile();
  const showcaseWrites = getShowcaseWrites(5);
  const featuredWrites = getFeaturedWrites(4);
  const desks = liveDesks.filter((d) => d.status === "live");

  return (
    <div>
      <StoryScene id="story-open" className="pb-0">
        <HubHero
          name={profile.name}
          pillars={profile.pillars}
          headlineLine={profileDefaults.headlineLine}
          headlineAccent={profileDefaults.headlineAccent}
          tagline={profile.tagline}
          contactCta={profileDefaults.contactCta}
          socials={profile.socials}
          avatarUrl={profile.avatarUrl}
          desks={desks}
        />
      </StoryScene>

      <StoryScene id="story-gravity" className="pt-10 sm:pt-14">
        <GravityScene whyOrbit={profileDefaults.whyOrbit} />
      </StoryScene>

      <StoryScene id="story-craft">
        <CraftScene competencies={competencies} />
      </StoryScene>

      <StoryScene id="selected-work" className="lg:py-8">
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
