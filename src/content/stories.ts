import { liveDesks } from "@/content/live-desks";
import { profile } from "@/content/profile";

/**
 * One beat of the reading order. Desks run all five; the Hub runs the Open for
 * the whole site. Spec: `.cursor/skills/visual-storytelling`.
 */
export type StoryBeat = {
  id: string;
  name: string;
  line: string;
};

export const storyBeats: StoryBeat[] = [
  { id: "open", name: "Open", line: "One question, in plain words." },
  { id: "cast", name: "Cast", line: "The few figures that answer it." },
  { id: "picture", name: "Picture", line: "The map, the tape, the mix." },
  { id: "move", name: "Move", line: "Press it; the same scene answers." },
  { id: "close", name: "Close", line: "Source, lag, and what it is not." },
];

/** A public surface that runs the reading order. */
export type Story = {
  id: string;
  /** The surface, in the reader's words. */
  surface: string;
  /** The line the story opens with — a question, or the Hub thesis. */
  line: string;
  cadence: string;
  /** Where the numbers come from. */
  source: string;
  href: string;
};

/** The front door. Desk stories follow from `live-desks.ts`. */
const hubOpen: Story = {
  id: "hub-open",
  surface: "Hub",
  line: `${profile.headlineLine} ${profile.headlineAccent}`,
  cadence: "The front door",
  source: "Desk questions under the thesis",
  href: "/",
};

/** Add a story here once its surface reads Open → Cast → Picture → Move → Close. */
export function getStories(): Story[] {
  const deskStories: Story[] = liveDesks
    .filter((desk) => desk.status === "live")
    .map((desk) => ({
      id: `desk-${desk.slug}`,
      surface: desk.title,
      line: desk.question,
      cadence: desk.cadence,
      source: desk.source,
      href: `/portfolio/live/${desk.slug}`,
    }));

  return [hubOpen, ...deskStories];
}
