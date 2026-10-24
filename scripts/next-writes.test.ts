import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankNextWrites, type NextWriteCandidate } from "../src/lib/next-writes";

function essay(
  slug: string,
  category: string,
  tags: string[],
  date: string,
): NextWriteCandidate {
  return { slug, category, tags, date };
}

const current = essay("current", "Delivery", ["Agents", "Fabric"], "2026-10-01");

describe("rankNextWrites", () => {
  it("puts the same category ahead of a newer essay that only shares a tag", () => {
    const ranked = rankNextWrites(current, [
      current,
      essay("newer-tag", "AI", ["Fabric"], "2026-10-20"),
      essay("older-same", "Delivery", [], "2026-09-01"),
    ]);

    assert.equal(ranked.related, true);
    assert.deepEqual(
      ranked.writes.map((item) => item.slug),
      ["older-same", "newer-tag"],
    );
  });

  it("uses shared tags to order essays in the same category, and ignores case", () => {
    const ranked = rankNextWrites(current, [
      current,
      essay("plain", "Delivery", [], "2026-10-18"),
      essay("tagged", "Delivery", ["fabric"], "2026-10-02"),
    ]);

    assert.deepEqual(
      ranked.writes.map((item) => item.slug),
      ["tagged", "plain"],
    );
  });

  it("fills with a shared tag from another category after the same topic", () => {
    const ranked = rankNextWrites(current, [
      current,
      essay("same", "Delivery", [], "2026-08-01"),
      essay("tag", "Data", ["Agents", "Fabric"], "2026-07-01"),
      essay("neither", "Career", ["Hiring"], "2026-10-20"),
    ]);

    assert.deepEqual(
      ranked.writes.map((item) => item.slug),
      ["same", "tag"],
    );
  });

  it("stops at three and drops essays that share nothing while a related one exists", () => {
    const ranked = rankNextWrites(current, [
      current,
      essay("a", "Delivery", ["Agents"], "2026-01-01"),
      essay("b", "Delivery", ["Fabric"], "2026-02-01"),
      essay("c", "Delivery", [], "2026-03-01"),
      essay("d", "Delivery", [], "2026-04-01"),
      essay("unrelated", "Learning", ["Notes"], "2026-10-20"),
    ]);

    assert.equal(ranked.writes.length, 3);
    assert.deepEqual(
      ranked.writes.map((item) => item.slug),
      ["b", "a", "d"],
    );
  });

  it("offers the three newest other essays when nothing shares a topic or a tag", () => {
    const ranked = rankNextWrites(current, [
      current,
      essay("old", "Career", ["Hiring"], "2026-01-01"),
      essay("mid", "Data", ["Models"], "2026-05-01"),
      essay("new", "Learning", ["Notes"], "2026-09-01"),
      essay("newest", "AI", ["Tools"], "2026-10-01"),
    ]);

    assert.equal(ranked.related, false);
    assert.deepEqual(
      ranked.writes.map((item) => item.slug),
      ["newest", "new", "mid"],
    );
  });
});
