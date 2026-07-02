/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow remote thumbnails from news sources if we ever render them.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Our project covers/diagrams are local, trusted SVGs. Allow the optimizer
    // to serve them, sandboxed via CSP so they can't execute scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Keep these out of the server component bundle; only used in scripts / route handlers.
  serverExternalPackages: ["rss-parser", "node-cron"],
};

export default nextConfig;
