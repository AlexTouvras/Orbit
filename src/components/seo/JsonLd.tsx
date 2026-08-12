import { getEditableProfile, getResolvedSocials } from "@/lib/profile-store";
import { getSiteUrl } from "@/lib/site";

/** Site-wide Person + WebSite structured data for search engines. */
export function JsonLd() {
  const profile = getEditableProfile();
  const socials = getResolvedSocials();
  const siteUrl = getSiteUrl();
  const sameAs = socials
    .map((s) => s.href)
    .filter((href) => href.startsWith("http"));

  const person = {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: profile.name,
    url: siteUrl,
    jobTitle: profile.role,
    description: profile.tagline,
    email: profile.email || undefined,
    image: profile.avatarUrl
      ? new URL(profile.avatarUrl, siteUrl).toString()
      : undefined,
    address: profile.location
      ? {
          "@type": "PostalAddress",
          addressLocality: profile.location,
        }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Orbit",
    url: siteUrl,
    description: profile.tagline,
    publisher: { "@id": `${siteUrl}/#person` },
    author: { "@id": `${siteUrl}/#person` },
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [person, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
