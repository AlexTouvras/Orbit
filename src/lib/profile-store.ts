import "server-only";
import fs from "node:fs";
import path from "node:path";
import { persistDataJson } from "@/lib/data-persist";
import {
  profile as defaults,
  socials as defaultSocials,
  socialIconFor,
  type IconComponent,
} from "@/content/profile";

export interface EditableSocial {
  label: string;
  href: string;
}

export interface EditableProfile {
  name: string;
  handle: string;
  githubUsername: string;
  role: string;
  location: string;
  tagline: string;
  pillars: string;
  availability: string;
  yearsExperience: string;
  summary: string;
  email: string;
  resumeUrl: string;
  socials: EditableSocial[];
}

export interface ResolvedSocial extends EditableSocial {
  icon: IconComponent;
}

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILE_PATH = path.join(DATA_DIR, "profile.json");

/** The baseline profile from content/profile.ts, in editable (JSON-safe) shape. */
export function getDefaultProfile(): EditableProfile {
  return {
    name: defaults.name,
    handle: defaults.handle,
    githubUsername: defaults.githubUsername,
    role: defaults.role,
    location: defaults.location,
    tagline: defaults.tagline,
    pillars: defaults.pillars,
    availability: defaults.availability,
    yearsExperience: defaults.yearsExperience,
    summary: defaults.summary,
    email: defaults.email,
    resumeUrl: defaults.resumeUrl,
    socials: defaultSocials.map((s) => ({ label: s.label, href: s.href })),
  };
}

function readOverrides(): Partial<EditableProfile> | null {
  try {
    const raw = fs.readFileSync(PROFILE_PATH, "utf8");
    return JSON.parse(raw) as Partial<EditableProfile>;
  } catch {
    return null;
  }
}

/** Defaults merged with any Studio-saved overrides from data/profile.json. */
export function getEditableProfile(): EditableProfile {
  const base = getDefaultProfile();
  const overrides = readOverrides();
  if (!overrides) return base;
  return {
    ...base,
    ...overrides,
    socials:
      Array.isArray(overrides.socials) && overrides.socials.length > 0
        ? overrides.socials
        : base.socials,
  };
}

/** Socials with their icon component resolved, for rendering. */
export function getResolvedSocials(): ResolvedSocial[] {
  return getEditableProfile().socials.map((s) => ({
    ...s,
    icon: socialIconFor(s.label),
  }));
}

/** Persist Studio edits to data/profile.json (or GitHub on Vercel). */
export async function writeProfileOverrides(
  profile: EditableProfile,
): Promise<{ viaGithub: boolean }> {
  return persistDataJson(
    "data/profile.json",
    profile,
    "chore(studio): update profile",
  );
}
