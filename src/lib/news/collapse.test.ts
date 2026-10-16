import assert from "node:assert/strict";
import test from "node:test";
import type { NewsItem } from "@/lib/types";
import { collapseReadingTwins } from "./collapse";

function item(partial: Partial<NewsItem> & Pick<NewsItem, "link" | "title">): NewsItem {
  return {
    id: partial.link,
    source: "SQLBI",
    category: "Analytics",
    pubDate: "2026-10-06T00:00:00.000Z",
    contentSnippet: "",
    ...partial,
  };
}

test("keeps the article when SQLBI also posts the video", () => {
  const video = item({
    title: "Understanding DAX contracts when using AI",
    link: "https://www.sqlbi.com/tv/understanding-dax-contracts-when-using-ai/",
    pubDate: "2026-10-06T00:00:00.000Z",
  });
  const article = item({
    title: "Understanding DAX contracts when using AI",
    link: "https://www.sqlbi.com/articles/understanding-dax-contracts-when-using-ai/",
    pubDate: "2026-10-05T00:00:00.000Z",
  });
  const other = item({
    title: "A different piece",
    link: "https://www.sqlbi.com/articles/a-different-piece/",
    source: "SQLBI",
  });

  const kept = collapseReadingTwins([video, article, other]);
  assert.deepEqual(
    kept.map((entry) => entry.link),
    [article.link, other.link],
  );
});

test("does not merge different posts that share a title", () => {
  const a = item({
    title: "Weekly update",
    link: "https://example.com/2026/one",
    source: "Crisp Blog",
    category: "Delivery",
  });
  const b = item({
    title: "Weekly update",
    link: "https://example.com/2025/one",
    source: "Crisp Blog",
    category: "Delivery",
    pubDate: "2025-01-01T00:00:00.000Z",
  });
  assert.equal(collapseReadingTwins([a, b]).length, 2);
});
