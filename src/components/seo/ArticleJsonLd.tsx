import type { Write } from "@/lib/types";
import { getEditableProfile } from "@/lib/profile-store";
import { getSiteUrl } from "@/lib/site";

/** Article structured data for a Blog write. */
export function ArticleJsonLd({ write }: { write: Write }) {
  const profile = getEditableProfile();
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/writes/${write.slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: write.title,
    description: write.summary,
    datePublished: write.date,
    dateModified: write.date,
    url,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: profile.name,
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: profile.name,
      url: siteUrl,
    },
    keywords: write.tags.join(", "),
    articleSection: write.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
