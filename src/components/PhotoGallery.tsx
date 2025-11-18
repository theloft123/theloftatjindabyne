"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import type { SiteContent } from "@/lib/siteContent";

type PhotoGalleryProps = {
  photos: SiteContent["gallery"];
};

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return null;
  }

  // Reverse the photos array to display in reverse order
  const reversedPhotos = [...photos].reverse();

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < reversedPhotos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const goToPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

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
      <PhotoMosaic photos={reversedPhotos} onImageClick={openLightbox} />
      
      {selectedIndex !== null && (
        <Lightbox
          photo={reversedPhotos[selectedIndex]}
          currentIndex={selectedIndex}
          totalPhotos={reversedPhotos.length}
          onClose={closeLightbox}
          onNext={goToNext}
          onPrev={goToPrev}
        />
      )}
    </section>
  );
}

type Photo = SiteContent["gallery"][number];

function GalleryImage({
  photo,
  priority = false,
  onClick,
}: {
  photo: Photo;
  priority?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
    >
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
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}

function PhotoMosaic({
  photos,
  onImageClick,
}: {
  photos: Photo[];
  onImageClick: (index: number) => void;
}) {
  const primary = photos[0];
  const second = photos[1];
  const third = photos[2];
  const fourth = photos[3];

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {primary && (
        <div className="md:col-span-2">
          <GalleryImage photo={primary} priority onClick={() => onImageClick(0)} />
        </div>
      )}
      {second && (
        <div className="hidden md:block">
          <GalleryImage photo={second} onClick={() => onImageClick(1)} />
        </div>
      )}
      {third && (
        <div className="md:col-span-2">
          <GalleryImage photo={third} onClick={() => onImageClick(2)} />
        </div>
      )}
      {fourth && (
        <div>
          <GalleryImage photo={fourth} onClick={() => onImageClick(3)} />
        </div>
      )}
      {photos.slice(4).map((photo, idx) => (
        <div key={photo.src} className="md:col-span-1">
          <GalleryImage photo={photo} onClick={() => onImageClick(idx + 4)} />
        </div>
      ))}
    </div>
  );
}

type LightboxProps = {
  photo: Photo;
  currentIndex: number;
  totalPhotos: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

function Lightbox({
  photo,
  currentIndex,
  totalPhotos,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close lightbox"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Image counter */}
      <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
        {currentIndex + 1} / {totalPhotos}
      </div>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 z-50 rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {currentIndex < totalPhotos - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 z-50 rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Main image */}
      <div
        className="relative mx-auto h-[90vh] w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

