/**
 * The Download CV file is the About record.
 * Every factual field on `cv` is either painted into the PDF or named here as
 * omitted. A new field on the CV type fails this file until it is placed.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { extractText } from "unpdf";
import {
  cv,
  type Cv,
  type CvEducation,
  type CvExperience,
  type CvLanguage,
  type CvRole,
  type CvSkillGroup,
} from "../src/content/cv";
import { renderCvPdf } from "../src/lib/cv/render-pdf";

type AssertNever<T extends never> = T;

type _cvKeys = AssertNever<
  Exclude<
    keyof Cv,
    | "fullName"
    | "location"
    | "email"
    | "linkedin"
    | "summary"
    | "experience"
    | "education"
    | "skills"
    | "languages"
    | "training"
  >
>;
type _roleKeys = AssertNever<Exclude<keyof CvRole, "title" | "period" | "bullets">>;
type _experienceKeys = AssertNever<
  Exclude<keyof CvExperience, "company" | "location" | "roles" | "slug" | "logo" | "url">
>;
type _educationKeys = AssertNever<
  Exclude<
    keyof CvEducation,
    | "degree"
    | "school"
    | "period"
    | "detail"
    | "thesisUrl"
    | "thesisTitle"
    | "slug"
    | "logo"
    | "url"
  >
>;
type _skillKeys = AssertNever<Exclude<keyof CvSkillGroup, "label" | "items">>;
type _languageKeys = AssertNever<Exclude<keyof CvLanguage, "name" | "level">>;

/** About shows profile.name. `cv.summary` is not on the page. Logos are marks, not sentences. */
type _cvRecordLocked = _cvKeys &
  _roleKeys &
  _experienceKeys &
  _educationKeys &
  _skillKeys &
  _languageKeys;

function recordLines(record: Cv): string[] {
  const lines = ["Experience", "Education", "Skills", "Languages"];
  for (const exp of record.experience) {
    lines.push(exp.company);
    if (exp.location) lines.push(exp.location);
    for (const role of exp.roles) {
      lines.push(role.title, role.period, ...role.bullets);
    }
  }
  for (const ed of record.education) {
    lines.push(ed.school, ed.degree);
    if (ed.period) lines.push(ed.period);
    if (ed.detail) lines.push(ed.detail);
    if (ed.thesisTitle) lines.push(ed.thesisTitle);
    if (ed.thesisUrl) lines.push(ed.thesisUrl);
  }
  for (const group of record.skills) lines.push(group.label, ...group.items);
  for (const lang of record.languages) lines.push(lang.name, lang.level);
  if (record.training.length > 0) lines.push("Training & more", ...record.training);
  return lines;
}

function compact(value: string) {
  return value.replace(/\s+/g, "");
}

function profileDefault(source: string, key: string) {
  const match = source.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  return match?.[1] ?? "";
}

/** Same name, role, and email About uses: profile.ts, then data/profile.json. */
function headerFromProfile() {
  const source = readFileSync("src/content/profile.ts", "utf8");
  const saved = existsSync("data/profile.json")
    ? (JSON.parse(readFileSync("data/profile.json", "utf8")) as {
        name?: string;
        role?: string;
        email?: string;
      })
    : {};
  return {
    name: saved.name || profileDefault(source, "name"),
    role: saved.role || profileDefault(source, "role"),
    email: saved.email || profileDefault(source, "email") || cv.email,
    location: cv.location,
    linkedin: cv.linkedin,
  };
}

async function main() {
  const route = readFileSync("src/app/resume.pdf/route.ts", "utf8");
  assert.match(route, /name: profile\.name/);
  assert.match(route, /role: profile\.role/);
  assert.match(route, /email: profile\.email \|\| cv\.email/);
  assert.match(route, /location: cv\.location/);
  assert.match(route, /linkedin: cv\.linkedin/);
  assert.doesNotMatch(route, /resumeUrl/);
  assert.doesNotMatch(
    readFileSync("src/components/about/BackgroundSections.tsx", "utf8"),
    /resumeUrl/,
  );

  const header = headerFromProfile();

  assert.equal(
    existsSync("public/resume.pdf"),
    false,
    "public/resume.pdf would be served instead of the generated CV",
  );

  const pdf = await renderCvPdf(cv, header);
  const extracted = await extractText(new Uint8Array(pdf), { mergePages: true });
  const text = compact(extracted.text);
  const required = [
    header.name,
    header.role,
    header.email,
    header.location,
    header.linkedin,
    ...recordLines(cv),
  ];

  for (const line of required) {
    assert.ok(text.includes(compact(line)), `missing from PDF: ${line}`);
  }

  assert.equal(
    text.includes(compact("used as an advantage, not a permanent label")),
    false,
    "cv.summary is not on About and must not be a second bio in the PDF",
  );
  assert.equal(
    text.includes(compact("Credit risk and data professional")),
    false,
    "the June 2026 static PDF summary must not survive",
  );

  console.log(`cv:check ok (${pdf.length} bytes, ${required.length} lines)`);
}

main();
