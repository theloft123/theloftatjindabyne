import Image from "next/image";
import type { SiteContent } from "@/lib/siteContent";

type PhotoGalleryProps = {
  photos: SiteContent["gallery"];
};

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return null;
  }

  // Reverse the photos array to display in reverse order
  const reversedPhotos = [...photos].reverse();

  return (
    <section id="photos" className="scroll-mt-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Photo Gallery
        </h2>
        <span className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Scenic loft living
        </span>
      </div>
      <PhotoMosaic photos={reversedPhotos} />
    </section>
  );
}

type Photo = SiteContent["gallery"][number];

function GalleryImage({
  photo,
  priority = false,
}: {
  photo: Photo;
  priority?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
      <div className="relative aspect-[4/3] md:aspect-square">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          priority={priority}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-slate-900/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}

function PhotoMosaic({ photos }: { photos: Photo[] }) {
  const primary = photos[0];
  const second = photos[1];
  const third = photos[2];
  const fourth = photos[3];

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {primary && (
        <div className="md:col-span-2">
          <GalleryImage photo={primary} priority />
        </div>
      )}
      {second && (
        <div className="hidden md:block">
          <GalleryImage photo={second} />
        </div>
      )}
      {third && (
        <div className="md:col-span-2">
          <GalleryImage photo={third} />
        </div>
      )}
      {fourth && (
        <div>
          <GalleryImage photo={fourth} />
        </div>
      )}
      {photos.slice(4).map((photo) => (
        <div key={photo.src} className="md:col-span-1">
          <GalleryImage photo={photo} />
        </div>
      ))}
    </div>
  );
}

