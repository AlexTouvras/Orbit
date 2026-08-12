import Image from "next/image";
import { cn } from "@/lib/utils";

interface PixelAvatarProps {
  src: string;
  alt: string;
  className?: string;
}

/** Crisp pixel-art avatar — square with a thin cyan frame. */
export function PixelAvatar({ src, alt, className }: PixelAvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neon-cyan/35 bg-void shadow-[0_0_24px_-8px_rgba(34,211,238,0.35)] sm:h-[72px] sm:w-[72px]",
        className,
      )}
      aria-hidden={alt === "" ? true : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={64}
        height={64}
        unoptimized
        priority
        className="h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </span>
  );
}
