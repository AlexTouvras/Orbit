import { readFileSync } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { Cv, CvRole } from "@/content/cv";

/**
 * IBM Plex Sans (OFL). Files live beside this module; Next traces them for
 * `/resume.pdf` via `outputFileTracingIncludes` in `next.config.mjs`.
 */
const fontsDir = path.join(process.cwd(), "src/lib/cv/fonts");
const regular = readFileSync(path.join(fontsDir, "IBMPlexSans-Regular.ttf"));
const strong = readFileSync(path.join(fontsDir, "IBMPlexSans-SemiBold.ttf"));

/** Same identity lines the About hero and contact row show. */
export interface CvPdfHeader {
  name: string;
  role: string;
  email: string;
  location: string;
  linkedin: string;
}

const INK = "#0f172a";
const MUTED = "#475569";
const RULE = "#cbd5e1";

function contentWidth(doc: PDFKit.PDFDocument) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function ensure(doc: PDFKit.PDFDocument, points: number) {
  if (doc.y + points > doc.page.maxY()) doc.addPage();
}

function section(doc: PDFKit.PDFDocument, title: string) {
  ensure(doc, 40);
  doc.moveDown(0.7);
  doc.font("Strong").fontSize(12).fillColor(INK).text(title, {
    width: contentWidth(doc),
  });
  const y = doc.y + 3;
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  doc
    .save()
    .strokeColor(RULE)
    .lineWidth(0.6)
    .moveTo(left, y)
    .lineTo(right, y)
    .stroke()
    .restore();
  doc.y = y + 8;
  doc.x = left;
}

function body(
  doc: PDFKit.PDFDocument,
  text: string,
  options: { size?: number; color?: string; font?: "Body" | "Strong"; link?: string } = {},
) {
  const size = options.size ?? 10;
  doc.font(options.font ?? "Body").fontSize(size);
  const height = doc.heightOfString(text, { width: contentWidth(doc), lineGap: 1 });
  ensure(doc, height);
  doc.fillColor(options.color ?? INK).text(text, {
    width: contentWidth(doc),
    lineGap: 1,
    link: options.link,
    underline: Boolean(options.link),
  });
}

function bullet(doc: PDFKit.PDFDocument, text: string) {
  const left = doc.page.margins.left;
  const mark = 12;
  const textWidth = contentWidth(doc) - mark;
  doc.font("Body").fontSize(10);
  const height = doc.heightOfString(text, { width: textWidth, lineGap: 1 });
  ensure(doc, height);
  const y = doc.y;
  doc.fillColor(INK).text("•", left, y, { width: mark, lineBreak: false });
  doc.text(text, left + mark, y, { width: textWidth, lineGap: 1 });
  doc.x = left;
  doc.moveDown(0.15);
}

function roleHeight(doc: PDFKit.PDFDocument, role: CvRole) {
  const width = contentWidth(doc);
  doc.font("Strong").fontSize(10.5);
  let height = doc.heightOfString(`${role.title}  ·  ${role.period}`, { width }) + 6;
  doc.font("Body").fontSize(10);
  for (const line of role.bullets) {
    height += doc.heightOfString(line, { width: width - 12, lineGap: 1 }) + 6;
  }
  return height;
}

/** Keep a short role on one page. A role taller than the page still flows. */
function keepRoleTogether(doc: PDFKit.PDFDocument, role: CvRole) {
  const height = roleHeight(doc, role);
  const room = doc.page.maxY() - doc.y;
  const pageRoom = doc.page.maxY() - doc.page.margins.top;
  if (height < pageRoom && height > room) doc.addPage();
}

/**
 * Paint the About record: experience, education, skills, languages, training.
 * `cv.summary` stays off the page and off this file.
 */
export function renderCvPdf(cv: Cv, header: CvPdfHeader): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 48, bottom: 48, left: 52, right: 52 },
      info: {
        Title: `${header.name} — CV`,
        Author: header.name,
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Body", regular);
    doc.registerFont("Strong", strong);

    const contact = [header.location, header.email, header.linkedin]
      .filter(Boolean)
      .join("   ·   ");

    doc.font("Strong").fontSize(22).fillColor(INK).text(header.name, {
      width: contentWidth(doc),
    });
    doc.moveDown(0.15);
    body(doc, header.role, { size: 11, color: MUTED });
    doc.moveDown(0.2);
    body(doc, contact, { size: 9, color: MUTED });

    section(doc, "Experience");
    cv.experience.forEach((exp, index) => {
      if (index > 0) doc.moveDown(0.45);
      const place = exp.location ? `${exp.company}  ·  ${exp.location}` : exp.company;
      const first = exp.roles[0];
      doc.font("Strong").fontSize(12);
      const placeHeight = doc.heightOfString(place, { width: contentWidth(doc) }) + 8;
      const opening = placeHeight + (first ? roleHeight(doc, first) : 0);
      const room = doc.page.maxY() - doc.y;
      const pageRoom = doc.page.maxY() - doc.page.margins.top;
      if (opening < pageRoom && opening > room) doc.addPage();
      body(doc, place, { size: 12, font: "Strong" });
      for (const role of exp.roles) {
        doc.moveDown(0.3);
        keepRoleTogether(doc, role);
        body(doc, `${role.title}  ·  ${role.period}`, { size: 10.5, font: "Strong" });
        doc.moveDown(0.15);
        for (const line of role.bullets) bullet(doc, line);
      }
    });

    section(doc, "Education");
    cv.education.forEach((ed, index) => {
      if (index > 0) doc.moveDown(0.45);
      body(doc, ed.school, { size: 12, font: "Strong" });
      if (ed.period) body(doc, ed.period, { size: 9, color: MUTED });
      body(doc, ed.degree, { size: 10.5, font: "Strong" });
      if (ed.detail) body(doc, ed.detail);
      if (ed.thesisTitle) body(doc, `Thesis: ${ed.thesisTitle}`);
      if (ed.thesisUrl) {
        body(doc, ed.thesisUrl, { size: 9, color: MUTED, link: ed.thesisUrl });
      }
    });

    section(doc, "Skills");
    for (const group of cv.skills) {
      body(doc, group.label, { size: 10.5, font: "Strong" });
      body(doc, group.items.join("  ·  "));
      doc.moveDown(0.25);
    }

    section(doc, "Languages");
    body(
      doc,
      cv.languages.map((lang) => `${lang.name} · ${lang.level}`).join("     "),
    );

    if (cv.training.length > 0) {
      section(doc, "Training & more");
      for (const item of cv.training) bullet(doc, item);
    }

    doc.end();
  });
}
