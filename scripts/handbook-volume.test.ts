import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HANDBOOKS } from "../src/content/handbooks";
import { VOLUME_FIGURE_KINDS, VOLUME_PICTURE_SIZE } from "../src/components/handbooks/volume/catalog";
import { VOLUME_READER_SLUGS, isVolumeReaderPath, isVolumeReaderSlug } from "../src/lib/handbook-reader";
import { adjacentPages, chapterPlace, pagePath } from "../src/lib/handbooks";

describe("handbook volume reader", () => {
  it("opts in only the books whose slug the chrome already knows", () => {
    for (const handbook of HANDBOOKS) {
      assert.equal(handbook.reader === "volume", isVolumeReaderSlug(handbook.slug));
    }
    assert.deepEqual(
      HANDBOOKS.filter((handbook) => handbook.reader === "volume").map((handbook) => handbook.slug),
      [...VOLUME_READER_SLUGS],
    );
  });

  it("keeps Data that drives decisions on its addresses, in reading order", () => {
    const handbook = HANDBOOKS.find((item) => item.slug === "data-that-drives-decisions");
    assert.ok(handbook);
    assert.deepEqual(
      handbook.pages.map((page) => page.number),
      [1, 6, 2, 3, 4, 5, 7, 8, 9],
    );
    assert.equal(pagePath(handbook.slug, 1), "/handbooks/data-that-drives-decisions/1");
    assert.equal(adjacentPages(handbook, 1).next?.number, 6);
    assert.equal(adjacentPages(handbook, 6).next?.number, 2);
    assert.equal(adjacentPages(handbook, 5).next?.number, 7);
    assert.equal(adjacentPages(handbook, 9).next, null);
    assert.equal(adjacentPages(handbook, 2).previous?.number, 6);
    const fit = chapterPlace(handbook, 2);
    assert.deepEqual(fit, { place: 3, count: 6 });
    assert.equal(chapterPlace(handbook, 4).place, 3);
    assert.equal(chapterPlace(handbook, 1).place, 1);
    assert.equal(chapterPlace(handbook, 9).place, 6);
    for (const page of handbook.pages) {
      assert.ok(page.title);
      assert.ok(page.lede);
      assert.ok(page.sections.length > 0);
      assert.ok(page.reviewed);
    }
  });

  it("draws every figure kind this book uses, and keeps photograph captions", () => {
    const handbook = HANDBOOKS.find((item) => item.slug === "data-that-drives-decisions");
    assert.ok(handbook);
    const kinds = new Set<string>();
    for (const page of handbook.pages) {
      for (const section of page.sections) {
        if (section.figure) kinds.add(section.figure.kind);
        if (section.picture) {
          assert.ok(section.picture.alt.trim(), section.picture.src);
          assert.ok(VOLUME_PICTURE_SIZE[section.picture.src], section.picture.src);
        }
      }
    }
    for (const kind of kinds) {
      assert.ok(
        (VOLUME_FIGURE_KINDS as readonly string[]).includes(kind),
        kind,
      );
    }
    assert.ok(kinds.has("matrix"));
    assert.ok(kinds.has("panels"));
    assert.ok(kinds.has("tree"));
  });

  it("recognises the volume routes and leaves the other book on the leaf", () => {
    assert.equal(isVolumeReaderPath("/handbooks/data-that-drives-decisions/1"), true);
    assert.equal(isVolumeReaderPath("/handbooks/data-that-drives-decisions/9"), true);
    assert.equal(isVolumeReaderPath("/handbooks/data-that-drives-decisions"), false);
    assert.equal(isVolumeReaderPath("/handbooks/software-that-stays-in-use/1"), false);
    assert.equal(isVolumeReaderPath("/handbooks"), false);
  });
});
