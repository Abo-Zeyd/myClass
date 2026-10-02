'use client';

import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getGoogleDriveImageUrl } from '../../lib/google-drive';

export type LatestMindMapSlide = {
  id: string;
  title: string;
  src: string;
  lessonTitle: string;
};

export default function LatestMindMapsSlider({ maps }: { maps: LatestMindMapSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsExpanded(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  if (maps.length === 0) return null;

  const slide = maps[activeIndex % maps.length];
  if (!slide) return null;

  function showSlide(nextIndex: number) {
    setActiveIndex((nextIndex + maps.length) % maps.length);
  }

  return (
    <section
      role={isExpanded ? 'dialog' : undefined}
      aria-modal={isExpanded || undefined}
      aria-labelledby="latest-mind-maps-title"
      className={
        isExpanded
          ? 'fixed inset-0 z-50 flex h-dvh w-screen flex-col overflow-hidden bg-surface'
          : 'overflow-hidden rounded-2xl border border-border bg-surface shadow-md'
      }
    >
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border bg-surface-muted/30 px-6 py-5">
        <div>
          <h2 id="latest-mind-maps-title" className="text-xl font-bold text-foreground">
            الخرائط الذهنية
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            أحدث الخرائط الذهنية المضافة إلى الدروس
          </p>
        </div>
        <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary">
          {maps.length} خريطة
        </span>
      </header>

      <div
        className={
          isExpanded
            ? 'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-surface-muted/30 p-3 sm:p-6'
            : 'relative flex h-[min(70vh,48rem)] min-h-[350px] items-center justify-center overflow-hidden bg-surface-muted/30 p-6 sm:p-10'
        }
      >
        <div className="relative size-full overflow-auto rounded-lg border border-border/60 bg-background shadow-inner shadow-black/10">
          <div className="relative size-full">
            <Image
              src={getGoogleDriveImageUrl(slide.src)}
              alt={slide.title}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain p-2"
            />
          </div>
        </div>

        {maps.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => showSlide(activeIndex - 1)}
              aria-label="الخريطة السابقة"
              title="الخريطة السابقة"
              className="absolute right-3 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => showSlide(activeIndex + 1)}
              aria-label="الخريطة التالية"
              title="الخريطة التالية"
              className="absolute left-3 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">{slide.title}</h3>
          <p className="text-xs text-muted-foreground">{slide.lessonTitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-label={isExpanded ? 'تصغير الخريطة' : 'عرض الخريطة بملء الصفحة'}
          title={isExpanded ? 'تصغير' : 'ملء الصفحة'}
          className="flex size-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
        >
          {isExpanded ? (
            <Minimize2 size={19} aria-hidden="true" />
          ) : (
            <Maximize2 size={19} aria-hidden="true" />
          )}
        </button>
      </footer>
    </section>
  );
}
