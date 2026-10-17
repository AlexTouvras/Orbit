import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ensureAnalyticsHandbookLink } from "../src/lib/field-card/handbook-link";

const PATH = "/handbooks/data-that-drives-decisions/1";
const DECISION = "/handbooks/data-that-drives-decisions/2";
const GRAIN = "/handbooks/data-that-drives-decisions/3";
const RECONCILE = "/handbooks/data-that-drives-decisions/4";
const KEEP = "/handbooks/data-that-drives-decisions/5";
const ASK = "Wrong question, wrong audience, or an unclear decision.";
const GRAIN_SENTENCE = "Mismatched grain, inconsistent definitions, incomplete scope.";
const OWNER = "A named owner approves the definition";

describe("analytics handbook link", () => {
  it("renames the four steps to Ask, Grain, Truth, and Use once", () => {
    const html =
      '<p class="verbs">Ask → name → define → consume</p><h3>01 Question</h3><h3>02 Grain</h3><h3>04 Decision</h3>';
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, /Ask → Grain → Truth → Use/);
    assert.match(next, /<h3>01 Ask<\/h3>/);
    assert.match(next, /<h3>04 Use<\/h3>/);
    assert.doesNotMatch(next, /name → define → consume/);
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });

  it("wraps the kill line once", () => {
    const html = '<article><p class="kill">Do not ship the number.</p></article>';
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, new RegExp(`<a href="${RECONCILE}">Do not ship the number.</a>`));
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });

  it("leaves a sheet that already links the chapter", () => {
    const html = `<p class="kill"><a href="${RECONCILE}">Already linked.</a></p>`;
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

  it("links the ask failure once, even when the kill line is already linked", () => {
    const html = `<p class="kill"><a href="${RECONCILE}">Do not ship.</a></p><p class="fail"><b>Failure mode</b> ${ASK}</p>`;
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, new RegExp(`<a href="${DECISION}" data-handbook-chapter="decision">${ASK}</a>`));
    assert.equal(next.match(new RegExp(DECISION, "g"))?.length, 1);
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });

  it("does not nest a link when the ask sentence is already anchored", () => {
    const html = `<p class="fail"><a href="/elsewhere">${ASK}</a></p>`;
    assert.equal(ensureAnalyticsHandbookLink(html), html);
  });

  it("links the owner sentence once, even when the other chapters are already linked", () => {
    const html = `<p class="kill"><a href="${RECONCILE}">Do not ship.</a></p><p class="fail"><a href="${DECISION}">${ASK}</a></p><span>${OWNER}</span>`;
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, new RegExp(`<a href="${KEEP}">${OWNER}</a>`));
    assert.equal(next.match(new RegExp(KEEP, "g"))?.length, 1);
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });

  it("does not nest a link when the owner sentence is already anchored", () => {
    const html = `<span><a href="/elsewhere">${OWNER}</a></span>`;
    assert.equal(ensureAnalyticsHandbookLink(html), html);
  });

  it("adds one click guard when the ask chapter is linked inside a document", () => {
    const html = `<body><p class="fail"><b>Failure mode</b> ${ASK}</p></body>`;
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, /data-handbook-ask-guard/);
    assert.match(next, /querySelectorAll\('\[data-handbook-chapter\]'\)/);
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });

  it("links the grain sentence once, even when the other chapters are already linked", () => {
    const html = `<p class="kill"><a href="${RECONCILE}">Do not ship.</a></p><p class="fail"><a href="${DECISION}">${ASK}</a></p><p class="fail"><b>Failure mode</b> ${GRAIN_SENTENCE}</p><span><a href="${KEEP}">${OWNER}</a></span>`;
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, new RegExp(`<a href="${GRAIN}" data-handbook-chapter="grain">${GRAIN_SENTENCE}</a>`));
    assert.equal(next.match(new RegExp(GRAIN, "g"))?.length, 1);
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });

  it("does not nest a link when the grain sentence is already anchored", () => {
    const html = `<p class="fail"><a href="/elsewhere">${GRAIN_SENTENCE}</a></p>`;
    assert.equal(ensureAnalyticsHandbookLink(html), html);
  });

  it("links the path heading once, and the later chapters stay on their own pages", () => {
    const html = `<h2>From question to decision</h2><p class="kill">Do not ship.</p><p class="fail"><b>Failure mode</b> ${ASK}</p><p class="fail"><b>Failure mode</b> ${GRAIN_SENTENCE}</p><span>${OWNER}</span>`;
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, new RegExp(`<a href="${PATH}">From question to decision</a>`));
    assert.match(next, new RegExp(`<a href="${DECISION}" data-handbook-chapter="decision">${ASK}</a>`));
    assert.match(next, new RegExp(`<a href="${GRAIN}" data-handbook-chapter="grain">${GRAIN_SENTENCE}</a>`));
    assert.match(next, new RegExp(`<a href="${RECONCILE}">Do not ship.</a>`));
    assert.match(next, new RegExp(`<a href="${KEEP}">${OWNER}</a>`));
    assert.equal(next.match(new RegExp(`${PATH}"`, "g"))?.length, 1);
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });

  it("widens a guard that only stopped the decision link", () => {
    const html = `<body><a href="${GRAIN}" data-handbook-chapter="grain">${GRAIN_SENTENCE}</a><script data-handbook-ask-guard>document.querySelectorAll('[data-handbook-chapter="decision"]').forEach(function(a){a.addEventListener("click",function(e){e.stopPropagation();});});</script></body>`;
    const next = ensureAnalyticsHandbookLink(html);
    assert.match(next, /querySelectorAll\('\[data-handbook-chapter\]'\)/);
    assert.equal(next.match(/data-handbook-ask-guard/g)?.length, 1);
    assert.equal(ensureAnalyticsHandbookLink(next), next);
  });
});
