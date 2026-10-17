import type { Metadata } from "next";

type ShareFields = {
  title?: string;
  description?: string;
  type?: "website" | "article";
  url?: string;
};

/**
 * Open Graph for one public path.
 *
 * A child `openGraph` object replaces the root layout's object. The layout
 * therefore cannot pin `url` (it would stay the homepage) and cannot pin
 * title or description (a page that only sets `metadata.title` would keep
 * the homepage share card). Call this from the page so the share URL is
 * that page, and leave title and description unset when the document title
 * and meta description should be copied across.
 */
export function pageOpenGraph(
  path: string,
  extra?: ShareFields,
): Metadata["openGraph"] {
  return {
    type: "website",
    siteName: "Orbit",
    locale: "en_US",
    url: path,
    // Replacing openGraph drops the root file image. Point back at it.
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Orbit — personal portfolio",
      },
    ],
    ...extra,
  };
}
