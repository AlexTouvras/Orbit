import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import {
  signFieldCardActionToken,
  verifyFieldCardActionToken,
} from "../src/lib/field-card/tokens";

process.env.FIELD_CARD_ACTION_SECRET = "test-field-card-sync-secret";

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function signRaw(action: string, pr: number): string {
  const payload = b64url(
    JSON.stringify({
      kind: "field-card",
      repo: "AlexTouvras/technology-delivery-field-card",
      pr,
      action,
      exp: Math.floor(Date.now() / 1000) + 60,
    }),
  );
  const sig = createHmac("sha256", process.env.FIELD_CARD_ACTION_SECRET!).update(payload).digest();
  return `${payload}.${b64url(sig)}`;
}

describe("field card sync token", () => {
  it("accepts sync with pr 0", () => {
    const token = signFieldCardActionToken(
      0,
      "sync",
      "AlexTouvras/technology-delivery-field-card",
      60,
    );
    const verified = verifyFieldCardActionToken(token);
    assert.equal("error" in verified, false);
    if ("error" in verified) return;
    assert.equal(verified.action, "sync");
    assert.equal(verified.pr, 0);
    assert.equal(verified.repo, "AlexTouvras/technology-delivery-field-card");
  });

  it("still accepts approve, skip, and preview", () => {
    for (const action of ["approve", "skip", "preview"] as const) {
      const verified = verifyFieldCardActionToken(
        signFieldCardActionToken(4, action, "AlexTouvras/technology-delivery-field-card", 60),
      );
      assert.equal("error" in verified, false);
      if ("error" in verified) return;
      assert.equal(verified.action, action);
    }
  });

  it("rejects an unknown action as invalid_payload", () => {
    const verified = verifyFieldCardActionToken(signRaw("publish", 1));
    assert.deepEqual(verified, { error: "invalid_payload" });
  });
});
