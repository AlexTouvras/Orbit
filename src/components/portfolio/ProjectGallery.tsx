import Image from "next/image";

export function ProjectGallery({ images }: { images: string[] }) {
  if (!images.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {images.map((src, i) => (
        <div
          key={src}
          className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-void-800"
        >
          <Image
            src={src}
            alt={`Screenshot ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
