"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { renderSVG } from "uqr";

export function CardQr({ fallbackUrl }: { fallbackUrl: string }) {
  const [url, setUrl] = useState(fallbackUrl);

  useEffect(() => {
    setUrl(`${window.location.origin}/card`);
  }, []);

  const src = useMemo(() => {
    const svg = renderSVG(url, {
      ecc: "H",
      boostEcc: true,
      border: 4,
      pixelSize: 8,
      whiteColor: "#ffffff",
      blackColor: "#111111",
    });
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [url]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-void px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
        Identity HUD
      </p>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`QR code opening ${url}`}
          width={320}
          height={320}
          className="h-auto w-full"
        />
      </div>
      <p className="max-w-sm text-center text-sm text-slate-300">
        Point their camera here. Opens the identity HUD on their phone.
      </p>
      <p className="max-w-sm break-all text-center font-mono text-xs text-slate-500">
        {url}
      </p>
      <Link
        href="/card"
        className="focus-ring inline-flex min-h-12 items-center text-sm font-medium text-neon-cyan"
      >
        Open HUD on this phone
      </Link>
    </div>
  );
}
