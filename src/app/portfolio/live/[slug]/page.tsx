import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLiveDesk, liveDeskSlugs } from "@/content/live-desks";
import { NordicEquityDesk } from "@/components/live/NordicEquityDesk";
import { EuSpotDesk, EuSpotMissing } from "@/components/live/EuSpotDesk";
import { HousingDesk, HousingMissing } from "@/components/live/HousingDesk";
import { PowerMixDesk, PowerMixMissing } from "@/components/live/PowerMixDesk";
import { EconomyDesk, EconomyMissing } from "@/components/live/EconomyDesk";
import { readEuSpotSnapshot, toEuSpotView } from "@/lib/live/eu-spot";
import { readHousingSnapshot, toHousingView } from "@/lib/live/housing";
import { readPowerMixSnapshot, toPowerMixView } from "@/lib/live/power-mix";
import { readEconomySnapshot, toEconomyView } from "@/lib/live/economy";

export function generateStaticParams() {
  return liveDeskSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const desk = getLiveDesk(slug);
  if (!desk || desk.status !== "live") return { title: "Desk not found" };
  const path = `/portfolio/live/${slug}`;
  return {
    title: desk.title,
    description: desk.question,
    alternates: { canonical: path },
    openGraph: { title: desk.title, description: desk.question, url: path },
  };
}

export default async function LiveDeskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "power") redirect("/portfolio/live/eu-spot");
  const desk = getLiveDesk(slug);
  if (!desk || desk.status !== "live") notFound();

  if (slug === "nordic-equity") {
    return <NordicEquityDesk />;
  }

  if (slug === "eu-spot") {
    const snap = readEuSpotSnapshot();
    if (!snap) return <EuSpotMissing />;
    return <EuSpotDesk view={toEuSpotView(snap)} />;
  }

  if (slug === "housing") {
    const snap = readHousingSnapshot();
    if (!snap) return <HousingMissing />;
    return <HousingDesk view={toHousingView(snap)} />;
  }

  if (slug === "power-mix") {
    const snap = readPowerMixSnapshot();
    if (!snap) return <PowerMixMissing />;
    return <PowerMixDesk view={toPowerMixView(snap)} />;
  }

  if (slug === "economy") {
    const snap = readEconomySnapshot();
    if (!snap) return <EconomyMissing />;
    return <EconomyDesk view={toEconomyView(snap)} />;
  }

  notFound();
}
