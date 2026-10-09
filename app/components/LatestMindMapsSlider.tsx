'use client';

import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getGoogleDriveImageUrl } from '../../lib/google-drive';

export type LatestMindMapSlide = {
  id: string;
  subjectId: string;
  lessonId: string;
  title: string;
  src: string;
  lessonTitle: string;
};

export default function LatestMindMapsSlider({ maps }: { maps: LatestMindMapSlide[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');

  useEffect(() => {
    function handleFullscreenChange() {
      setIsExpanded(document.fullscreenElement === sectionRef.current);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (maps.length === 0) return null;

  const slide = maps[activeIndex % maps.length];
  if (!slide) return null;

  function showSlide(nextIndex: number) {
    setActiveIndex((nextIndex + maps.length) % maps.length);
  }

  async function toggleFullscreen() {
    const section = sectionRef.current;
    if (!section) {
      setFullscreenError('تعذر العثور على قسم الخرائط الذهنية.');
      return;
    }

    setFullscreenError('');
    try {
      if (document.fullscreenElement === section) {
        await document.exitFullscreen();
      } else {
        await section.requestFullscreen();
      }
    } catch {
      setFullscreenError('تعذر فتح وضع ملء الشاشة. تحقق من دعم المتصفح أو أذونات الصفحة.');
    }
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="latest-mind-maps-title"
      className={
        isExpanded
          ? 'fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-surface'
          : 'overflow-hidden rounded-2xl border border-border bg-surface shadow-md'
      }
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/30 px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id="latest-mind-maps-title" className="text-lg sm:text-xl font-bold text-foreground">
            الخرائط الذهنية
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            أحدث الخرائط الذهنية المضافة إلى الدروس
          </p>
        </div>
        <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs sm:text-sm font-bold text-secondary">
          {maps.length} خريطة
        </span>
      </header>

      <div
        className={
          isExpanded
            ? 'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-surface-muted/30 p-2 sm:p-6'
            : 'relative flex h-[min(60vh,40rem)] min-h-[250px] sm:min-h-[350px] items-center justify-center overflow-hidden bg-surface-muted/30 p-3 sm:p-6 sm:p-10'
        }
      >
        <div className="relative size-full overflow-auto rounded-lg border border-border/60 bg-background shadow-inner shadow-black/10">
          <div className="relative size-full">
            <Image
              src={getGoogleDriveImageUrl(slide.src)}
              alt={slide.title}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain p-1 sm:p-2"
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
          <h3 className="truncate font-semibold text-foreground">
            <Link
              href={`/lessons?subject=${encodeURIComponent(slide.subjectId)}&lesson=${encodeURIComponent(slide.lessonId)}`}
              className="transition-colors hover:text-primary hover:underline"
            >
              {slide.title}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground">{slide.lessonTitle}</p>
        </div>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label={isExpanded ? 'الخروج من ملء الشاشة' : 'عرض الخريطة بملء الشاشة'}
          title={isExpanded ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
          className="flex size-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
        >
          {isExpanded ? (
            <Minimize2 size={19} aria-hidden="true" />
          ) : (
            <Maximize2 size={19} aria-hidden="true" />
          )}
        </button>
        {fullscreenError && (
          <p role="alert" className="w-full text-sm text-error">
            {fullscreenError}
          </p>
        )}
      </footer>
    </section>
  );
}
