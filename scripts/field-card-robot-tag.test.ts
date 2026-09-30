import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ensureFieldCardRobot, htmlMountsFieldCardRobot } from "../src/lib/field-card/robot-tag";

describe("field card robot tag", () => {
  it("inserts the script before the closing body", () => {
    const html = "<html><body><p>Card</p></body></html>";
    const next = ensureFieldCardRobot(html, "analytics");
    assert.match(next, /data-card="analytics"/);
    assert.ok(next.indexOf("field-card-robot.mjs") < next.indexOf("</body>"));
    assert.equal(ensureFieldCardRobot(next, "analytics"), next);
  });

  it("leaves a sheet that already mounts the character", () => {
    const html = '<html><body><script>layer.id = "field-robot";</script></body></html>';
    assert.equal(htmlMountsFieldCardRobot(html), true);
    assert.equal(ensureFieldCardRobot(html, "ai"), html);
  });

  it("refuses a card id that is not a token", () => {
    const html = "<html><body></body></html>";
    assert.equal(ensureFieldCardRobot(html, "analytics\"><script>"), html);
  });
});
