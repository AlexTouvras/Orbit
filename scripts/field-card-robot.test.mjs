import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  FALLBACK_CARDS,
  READING_BAND,
  argb,
  cardSpeech,
  cardsForSheet,
  parseAccents,
  parseFieldCards,
  parseRobotContract,
  sectionLine,
} from "../public/field-card-robot.mjs";

const TUCK = "Tap me and I'll wait in the corner.";

describe("field card robot copy", () => {
  it("reads the six cards storytelling publishes", async () => {
    const res = await fetch(
      "https://raw.githubusercontent.com/AlexTouvras/storytelling/main/src/illustrations/field-cards.ts",
    );
    assert.equal(res.ok, true);
    const source = await res.text();
    const cards = parseFieldCards(source);
    const accents = parseAccents(source);
    assert.ok(cards);
    assert.ok(accents);
    assert.deepEqual(
      cards.map((card) => card.id),
      ["ai", "delivery", "analytics", "sdlc", "credit", "story"],
    );
    const bodies = [];
    for (const card of cards) {
      assert.equal(card.lines.length, 6);
      assert.equal(card.lines[5], TUCK);
      const speech = cardSpeech(card.id, cards, accents);
      assert.ok(speech);
      assert.equal(speech.rgb.length, 3);
      bodies.push(card.lines.slice(0, 5).join("\n"));
      for (const words of card.lines) {
        assert.ok(words.length > 0);
        assert.ok(words.length <= 64);
        assert.ok([...words].every((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126));
      }
    }
    assert.equal(new Set(bodies).size, cards.length);
    assert.equal(cardSpeech("sdlc", cards, accents).rgb.join(","), "157,91,244");
    assert.equal(cardSpeech("story", cards, accents).rgb.join(","), "0,210,211");
    assert.equal(cardSpeech("credit", cards, accents).rgb.join(","), "240,166,70");
    assert.equal(cards[0].lines[0], FALLBACK_CARDS[0].lines[0]);
    const delivery = cards.find((card) => card.id === "delivery");
    assert.equal(
      sectionLine(delivery.sections, "Match the calendars, then cut over."),
      "This card is evidence before the change is called done.",
    );
    assert.equal(sectionLine(delivery.sections, "Tool picker"), "Flags and pipelines are lanes. The sequence is the call.");
    assert.equal(sectionLine(delivery.sections, "not a section"), null);
    assert.equal(READING_BAND, 0.38);
  });

  it("speaks the Orbit SDLC pillars even when storytelling still hands release to Delivery", () => {
    const remote = FALLBACK_CARDS.map((card) =>
      card.id === "sdlc"
        ? {
            ...card,
            lines: [
              "Release, proof, and cutover live on the Delivery card.",
              "a",
              "b",
              "c",
              "d",
              TUCK,
            ],
            sections: [{ heading: "Write the plan before the code", line: "old" }],
          }
        : card,
    );
    const cards = cardsForSheet("sdlc", remote);
    const sdlc = cards.find((card) => card.id === "sdlc");
    assert.ok(sdlc);
    assert.equal(sdlc.lines.length, 6);
    assert.equal(sdlc.lines.some((line) => line.includes("Delivery")), false);
    assert.equal(sectionLine(sdlc.sections, "Build software that stays in use"), sdlc.lines[0]);
    assert.equal(
      cardsForSheet("delivery", remote).find((card) => card.id === "delivery").lines[0],
      remote.find((card) => card.id === "delivery").lines[0],
    );
  });

  it("speaks the Orbit credit scene even when storytelling still has the old headings", () => {
    const remote = FALLBACK_CARDS.map((card) =>
      card.id === "credit"
        ? {
            ...card,
            lines: [
              "A score at application is not the loss you hold.",
              "a",
              "b",
              "c",
              "d",
              TUCK,
            ],
            sections: [{ heading: "Problem → use → example", line: "old" }],
          }
        : card,
    );
    const cards = cardsForSheet("credit", remote);
    const credit = cards.find((card) => card.id === "credit");
    assert.ok(credit);
    assert.equal(credit.lines.length, 6);
    assert.equal(credit.lines[0], "This card is the life of the loan. Act before the loss.");
    assert.equal(
      sectionLine(credit.sections, "How I run one account"),
      "The cutoff is not the system. Watch what is next.",
    );
    for (const words of credit.lines) {
      assert.ok(words.length <= 64);
    }
    assert.equal(
      cardsForSheet("analytics", remote).find((card) => card.id === "analytics").lines[0],
      remote.find((card) => card.id === "analytics").lines[0],
    );
  });

  it("reads the six line slots and the accent from the robot contract", async () => {
    const res = await fetch(
      "https://raw.githubusercontent.com/AlexTouvras/storytelling/main/src/illustrations/robot.ts",
    );
    assert.equal(res.ok, true);
    const robot = parseRobotContract(await res.text());
    assert.ok(robot);
    assert.deepEqual(
      ["line", "line2", "line3", "line4", "line5", "line6"].map((key) => robot.props[key]),
      ["line", "line2", "line3", "line4", "line5", "line6"],
    );
    assert.equal(robot.props.accent, "accent");
    assert.equal(robot.width, 400);
  });

  it("stores accent as Rive ARGB", () => {
    assert.equal(argb(0, 210, 211), 0xff00d2d3);
    assert.equal(argb(157, 91, 244), 0xff9d5bf4);
  });
});

describe("field card pages", () => {
  const mounted = [
    ["public/delivery-field-card/index.html", "delivery"],
    ["public/analytics-field-card/index.html", "analytics"],
    ["public/sdlc-field-card/index.html", "sdlc"],
    ["public/credit-risk-field-card/index.html", "credit"],
    ["public/story-field-card/index.html", "story"],
  ];

  for (const [path, id] of mounted) {
    it(`mounts the ${id} robot without dropping canonical`, () => {
      const html = readFileSync(path, "utf8");
      assert.match(html, new RegExp(`src="/field-card-robot.mjs" data-card="${id}"`));
      assert.match(html, /rel="canonical"/);
      assert.match(html, /property="og:image"/);
    });
  }

  it("leaves the method card and the AI sheet's own script alone", () => {
    const bayes = readFileSync("public/bayes-field-card/index.html", "utf8");
    const ai = readFileSync("public/field-card/index.html", "utf8");
    assert.equal(bayes.includes("field-card-robot"), false);
    assert.equal(ai.includes("field-card-robot.mjs"), false);
    assert.equal(ai.includes('id = "field-robot"'), true);
    assert.match(ai, /function followSections/);
    assert.match(readFileSync("public/field-card-robot.mjs", "utf8"), /function followSections/);
  });
});
