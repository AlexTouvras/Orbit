import "server-only";
import fs from "node:fs";
import path from "node:path";
import { persistDataJson } from "@/lib/data-persist";

export type RoadmapTrack = "career" | "website" | "evidence";
export type RoadmapStatus = "planned" | "active" | "evidence" | "proven";

export interface RoadmapMilestone {
  id: string;
  title: string;
  track: RoadmapTrack;
  status: RoadmapStatus;
  notes?: string;
  links?: { href: string; label: string }[];
}

export interface StudioRoadmap {
  focusNow: string;
  updatedAt: string;
  milestones: RoadmapMilestone[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const ROADMAP_PATH = path.join(DATA_DIR, "studio-roadmap.json");
const SEED_PATH = path.join(DATA_DIR, "studio-roadmap.seed.json");

/** Owner-approved default NOW (PRODUCT.md / POSITIONING). Public-safe. */
export const DEFAULT_FOCUS_NOW =
  "Building an AI & Data Systems practice at the intersection of technology delivery, analytics and automation.";

/** Foundation infrastructure milestones — not career achievements. */
export function getDefaultRoadmap(): StudioRoadmap {
  return {
    focusNow: DEFAULT_FOCUS_NOW,
    updatedAt: new Date().toISOString(),
    milestones: [
      {
        id: "product-docs",
        title: "Product docs + agent hooks live",
        track: "website",
        status: "active",
      },
      {
        id: "positioning",
        title: "Public positioning aligned (Hub + HUD + About)",
        track: "website",
        status: "active",
      },
      {
        id: "studio-roadmap-v1",
        title: "Studio roadmap v1 private",
        track: "website",
        status: "active",
      },
      {
        id: "hud-now",
        title: "HUD NOW wired from Studio (focusNow only)",
        track: "website",
        status: "active",
      },
    ],
  };
}

function readJsonFile(filePath: string): StudioRoadmap | null {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<StudioRoadmap>;
    if (typeof parsed.focusNow !== "string") return null;
    if (!Array.isArray(parsed.milestones)) return null;
    return {
      focusNow: parsed.focusNow.trim() || DEFAULT_FOCUS_NOW,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      milestones: parsed.milestones as RoadmapMilestone[],
    };
  } catch {
    return null;
  }
}

/** Live overrides, else seed, else defaults. */
export function getStudioRoadmap(): StudioRoadmap {
  return (
    readJsonFile(ROADMAP_PATH) ??
    readJsonFile(SEED_PATH) ??
    getDefaultRoadmap()
  );
}

/** Public-safe NOW for `/card`. Never returns milestone titles. */
export function getFocusNow(): string {
  const focus = getStudioRoadmap().focusNow.trim();
  return focus || DEFAULT_FOCUS_NOW;
}

export async function writeStudioRoadmap(
  roadmap: StudioRoadmap,
): Promise<{ viaGithub: boolean; warning?: string }> {
  const toWrite: StudioRoadmap = {
    ...roadmap,
    focusNow: roadmap.focusNow.trim() || DEFAULT_FOCUS_NOW,
    updatedAt: new Date().toISOString(),
  };
  return persistDataJson(
    "data/studio-roadmap.json",
    toWrite,
    "chore(studio): update roadmap",
  );
}
