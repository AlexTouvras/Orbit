export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Week log",
  robots: { index: false, follow: false },
};

export default function WeekLogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
