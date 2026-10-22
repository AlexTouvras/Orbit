import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HANDBOOKS } from "../src/content/handbooks";
import {
  chapterLinks,
  citationMarks,
  isChapterLink,
  pageReferences,
  referenceNumber,
  workKey,
} from "../src/lib/handbook-citations";

function page(slug: string, number: number) {
  const handbook = HANDBOOKS.find((item) => item.slug === slug);
  assert.ok(handbook);
  const found = handbook.pages.find((item) => item.number === number);
  assert.ok(found);
  return found;
}

describe("handbook citations", () => {
  it("numbers the listed works, and a section hash uses that work's number", () => {
    const opening = page("software-that-stays-in-use", 1);
    const references = pageReferences(opening);
    assert.equal(references.length, opening.sources.length);
    assert.equal(references[0]?.n, 1);
    assert.equal(
      referenceNumber(references, "https://martinfowler.com/articles/continuousIntegration.html#EveryonePushesCommitsToTheMainlineEveryDay"),
      1,
    );
    const practice = opening.sections.find((section) => section.id === "practice");
    assert.ok(practice);
    assert.deepEqual(citationMarks(references, practice.sources), [1, 2]);
  });

  it("keeps another chapter as a link, and numbers the field card", () => {
    const review = page("data-that-drives-decisions", 9);
    const references = pageReferences(review);
    const limits = review.sections.find((section) => section.id === "value-limits");
    assert.ok(limits);
    assert.equal(chapterLinks(limits.sources).length, 7);
    assert.deepEqual(citationMarks(references, limits.sources), [1, 2]);
    assert.equal(isChapterLink("/handbooks/data-that-drives-decisions/8"), true);
  });

  it("adds a section work the page list does not already name", () => {
    const definition = page("data-that-drives-decisions", 5);
    const references = pageReferences(definition);
    const grain = "https://www.kimballgroup.com/2003/03/declaring-the-grain/";
    assert.equal(definition.sources.some((source) => workKey(source.href) === workKey(grain)), false);
    const added = references.find((item) => workKey(item.href) === workKey(grain));
    assert.ok(added);
    assert.equal(added.n, definition.sources.length + 1);
    const shape = definition.sections.find((section) => section.id === "shape");
    assert.ok(shape);
    assert.ok(citationMarks(references, shape.sources).includes(added.n));
  });

  it("gives every section work on both books a number or a chapter link", () => {
    for (const handbook of HANDBOOKS) {
      for (const item of handbook.pages) {
        const references = pageReferences(item);
        const numbers = references.map((reference) => reference.n);
        assert.deepEqual(numbers, references.map((_, index) => index + 1));
        for (const section of item.sections) {
          for (const source of section.sources ?? []) {
            const n = referenceNumber(references, source.href);
            assert.equal(n != null || isChapterLink(source.href), true, `${handbook.slug} ${item.number} ${source.href}`);
          }
        }
      }
    }
  });
});
