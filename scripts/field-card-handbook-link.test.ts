import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ensureAnalyticsHandbookLink } from "../src/lib/field-card/handbook-link";

const PAGE = "/handbooks/data-that-drives-decisions/1";

describe("analytics handbook link", () => {
  it("wraps the kill line once", () => {
    const html = '<article><p class="kill">Do not ship the number.</p></article>';
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, new RegExp(`<a href="${PAGE}">Do not ship the number.</a>`));
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });

  it("leaves a sheet that already links the chapter", () => {
    const html = `<p class="kill"><a href="${PAGE}">Already linked.</a></p>`;
    assert.equal(ensureAnalyticsHandbookLink(html), html);
  });

  it("leaves a kill line that already has some other link", () => {
    const html = '<p class="kill"><a href="/elsewhere">Linked.</a></p>';
    assert.equal(ensureAnalyticsHandbookLink(html), html);
  });

  it("leaves a sheet with no kill line", () => {
    const html = "<article><p>No kill line.</p></article>";
    assert.equal(ensureAnalyticsHandbookLink(html), html);
  });
});
