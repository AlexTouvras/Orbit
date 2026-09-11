import type { Write } from "@/lib/types";
import { getEditableProfile } from "@/lib/profile-store";
import { getSiteUrl } from "@/lib/site";
import {
  getWriteModifiedDate,
  writeAbsoluteUrl,
  writeOgImageUrl,
} from "@/lib/seo/writes";

/** BlogPosting + BreadcrumbList for a Write — auto from frontmatter for every post. */
export function ArticleJsonLd({ write }: { write: Write }) {
  const profile = getEditableProfile();
  const siteUrl = getSiteUrl();
  const url = writeAbsoluteUrl(write.slug);
  const modified = getWriteModifiedDate(write);
  const image = writeOgImageUrl(write.slug);

  const blogPosting = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: write.title,
    description: write.summary,
    datePublished: write.date,
    dateModified: modified,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: [image],
    author: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.name,
      url: siteUrl,
    },
    publisher: {
      "@id": `${siteUrl}/#person`,
    },
    keywords: write.tags.join(", "),
    articleSection: write.category,
    inLanguage: "en",
    wordCount: Math.max(1, write.readingTime * 200),
    timeRequired: `PT${write.readingTime}M`,
    isPartOf: {
      "@type": "Blog",
      "@id": `${siteUrl}/writes#blog`,
      name: `${profile.name} — Blog`,
      url: `${siteUrl}/writes`,
    },
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writes",
        item: `${siteUrl}/writes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: write.title,
        item: url,
      },
    ],
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [blogPosting, breadcrumb],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
