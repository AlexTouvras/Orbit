import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HANDBOOKS } from "../src/content/handbooks";
import { MODELS_PLATE_IDS, VOLUME_FIGURE_KINDS, VOLUME_PICTURE_SIZE } from "../src/components/handbooks/volume/catalog";
import { isVolumeReaderPath } from "../src/lib/handbook-reader";
import { adjacentPages, chapterPlace, pagePath } from "../src/lib/handbooks";

describe("handbook volume reader", () => {
  it("opens every published chapter in the handbook view", () => {
    for (const handbook of HANDBOOKS) {
      for (const page of handbook.pages) {
        assert.equal(isVolumeReaderPath(pagePath(handbook.slug, page.number)), true);
      }
    }
    assert.equal(isVolumeReaderPath("/handbooks"), false);
    assert.equal(isVolumeReaderPath("/handbooks/software-that-stays-in-use"), false);
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

  it("draws a figure for every kind either book uses", () => {
    const kinds = new Set<string>();
    for (const handbook of HANDBOOKS) {
      for (const page of handbook.pages) {
        for (const section of page.sections) {
          const figure = section.figure;
          if (!figure) continue;
          kinds.add(figure.kind);
          const drawn =
            (VOLUME_FIGURE_KINDS as readonly string[]).includes(figure.kind) ||
            figure.steps.length > 0 ||
            (figure.columns?.length ?? 0) > 0 ||
            (figure.rows?.length ?? 0) > 0;
          assert.equal(drawn, true, `${handbook.slug} ${figure.kind}`);
        }
      }
    }
    assert.ok(kinds.has("pyramid"));
    assert.ok(kinds.has("curve"));
    assert.ok(kinds.has("loop"));
  });

  it("gives each published book a dark cover and one line per chapter", () => {
    for (const handbook of HANDBOOKS) {
      const plate = handbook.pages[0]?.plate;
      assert.ok(
        plate === "horizon" || plate === "ledger" || plate === "pipeline",
        handbook.slug,
      );
      assert.ok(handbook.contents.length >= 1, handbook.slug);
    }
    const data = HANDBOOKS.find((item) => item.slug === "data-that-drives-decisions");
    assert.ok(data);
    assert.deepEqual(
      data.contents.map((entry) => entry.title),
      [
        "What good looks like",
        "Choose the work",
        "Make the number fit to use",
        "Choose the stack",
        "Keep trust in force",
        "Run the product and judge the value",
      ],
    );
    assert.equal(data.contents[2]?.sections?.length, 4);
    const models = HANDBOOKS.find((item) => item.slug === "models-that-stay-in-the-decision");
    assert.ok(models);
    assert.equal(models.pages[0]?.plate, "pipeline");
    assert.ok(models.recipe);
    assert.equal(models.recipe.href, "/ml-pipeline-field-card/openbi-agent-recipe.md");
    assert.equal(models.recipe.filename, "openbi-agent-recipe.md");
    assert.ok(
      VOLUME_PICTURE_SIZE["/handbook-art/models-that-stay-in-the-decision/cover.jpg"],
      "exclusive cover leaf",
    );
    assert.deepEqual(
      models.contents.map((entry) => entry.title),
      [
        "What good looks like",
        "Prepare the table",
        "Features that hold",
        "Fit without spending the holdout",
        "Ship and watch",
        "Name what the version may do",
      ],
    );
    assert.ok(
      models.pages.some((page) =>
        page.sections.some((section) => section.figure?.kind === "pipeline"),
      ),
    );
    const plated = new Set<string>(MODELS_PLATE_IDS);
    const figureIds = models.pages.flatMap((page) =>
      page.sections.filter((section) => section.figure).map((section) => section.id),
    );
    assert.deepEqual([...figureIds].sort(), [...plated].sort());
    assert.ok(
      VOLUME_PICTURE_SIZE["/handbook-art/models-that-stay-in-the-decision/path.jpg"],
      "opening path",
    );
    for (const page of models.pages) {
      const pictures = page.sections.filter((section) => section.picture);
      assert.equal(pictures.length, 0, `page ${page.number} still life`);
    }
  });
});
