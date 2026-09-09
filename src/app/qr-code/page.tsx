import type { Metadata, Viewport } from "next";
import { CardQr } from "@/components/card/CardQr";
import { getSiteUrl } from "@/lib/site";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "QR code",
  description: "On-screen QR to the identity HUD — show this page instead of a sticker.",
  alternates: { canonical: "/qr-code" },
  robots: { index: false, follow: true },
};

export default function QrCodePage() {
  const fallbackUrl = `${getSiteUrl()}/card`;
  return <CardQr fallbackUrl={fallbackUrl} />;
}
