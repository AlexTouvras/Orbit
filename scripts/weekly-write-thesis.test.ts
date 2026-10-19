import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  INTAKE_CATEGORY_ORDER,
  WEEKLY_WRITE_CATEGORY_ORDER,
} from "../src/lib/news/balance";
import {
  isReportingProductSignal,
  pickEssayThesis,
} from "../src/lib/weekly-write/thesis";
import type {
  WeeklyIntake,
  WeeklyIntakeSignal,
} from "../src/lib/weekly-write/types";

function signal(
  partial: Partial<WeeklyIntakeSignal> &
    Pick<WeeklyIntakeSignal, "title" | "category">,
): WeeklyIntakeSignal {
  return {
    id: partial.id ?? partial.title,
    title: partial.title,
    link: partial.link ?? "https://example.com/post",
    source: partial.source ?? "Example",
    category: partial.category,
    snippet: partial.snippet ?? "",
  };
}

function intake(signals: WeeklyIntakeSignal[]): WeeklyIntake {
  return {
    weekOf: "2026-10-19",
    generatedAt: "2026-10-19T00:00:00.000Z",
    signals,
    projects: [],
  };
}

const fullText = signal({
  title:
    "Monitoring The Impact Of Full-Text Indexing On Semantic Model Refresh In Power BI",
  source: "Chris Webb's BI Blog",
  category: "Analytics",
  snippet:
    "The September release of Power BI saw the introduction of a powerful new feature: full text indexing, which makes searching and filtering on text columns much faster.",
});

const discovery = signal({
  title: "AI-Assisted Product Discovery: When Code Is Cheap, Judgment Is the Job",
  source: "Scrum.org",
  category: "Delivery",
  snippet:
    "Agentic coding has removed the cost gate that used to stop product teams from chasing every idea at once, and the constraint has moved to product judgment: the ability to tell what is worth building.",
});

const newsletter = signal({
  title: "Data Engineering Weekly #292",
  source: "Data Engineering Weekly",
  category: "Data",
  snippet: "The Weekly Data Engineering Newsletter",
});

const forwards = signal({
  title: "Offshore forwards and exchange rate transmission in emerging markets",
  source: "BIS Financial Stability",
  category: "Credit",
  snippet:
    "We study how offshore non-deliverable forward markets transmit exchange-rate pressures to domestic currency markets over 2013–2025.",
});

describe("weekly thesis skips a Power BI feature", () => {
  it("keeps Analytics last in the weekly brief and first in the newsletter mix", () => {
    assert.equal(WEEKLY_WRITE_CATEGORY_ORDER.at(-1), "Analytics");
    assert.equal(INTAKE_CATEGORY_ORDER[0], "Analytics");
    assert.equal(
      WEEKLY_WRITE_CATEGORY_ORDER.includes("Analytics"),
      true,
    );
  });

  it("treats the Analytics lane and a feature title as reporting-product signals", () => {
    assert.equal(isReportingProductSignal(fullText), true);
    assert.equal(
      isReportingProductSignal(
        signal({
          title: "Direct Lake on a semantic model",
          source: "Example",
          category: "Data",
        }),
      ),
      true,
    );
    assert.equal(isReportingProductSignal(discovery), false);
    assert.equal(
      isReportingProductSignal(
        signal({
          title: "A sequenced change still needs an owner",
          source: "Example",
          category: "Delivery",
          snippet: "The report of the incident arrived after the release.",
        }),
      ),
      false,
    );
  });

  it("picks another lane when a Power BI feature is in the same intake", () => {
    const thesis = pickEssayThesis(
      intake([fullText, newsletter, discovery, forwards]),
    );
    assert.ok(thesis);
    assert.equal(thesis.primary.title, discovery.title);
    assert.equal(thesis.category, "Delivery");
    assert.equal(
      thesis.supporting.some((s) => s.category === "Analytics"),
      false,
    );
    assert.equal(thesis.tags.includes("Power BI"), false);
  });

  it("keeps a Power BI feature when the intake has no other lane", () => {
    const thesis = pickEssayThesis(intake([fullText]));
    assert.ok(thesis);
    assert.equal(thesis.primary.title, fullText.title);
  });
});
