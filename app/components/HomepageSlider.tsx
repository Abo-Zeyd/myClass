"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, FileImage, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { getGoogleDriveImageUrl } from "../../lib/google-drive";

export type HomepageSlide = {
  id: string;
  title: string;
  url: string;
};

export default function HomepageSlider({ slides }: { slides: HomepageSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  if (slides.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md" aria-labelledby="homepage-slider-title">
        <header className="border-b border-border bg-surface-muted/30 px-6 py-5">
          <h2 id="homepage-slider-title" className="text-xl font-bold text-foreground">منشورات القسم</h2>
          <p className="mt-1 text-sm text-muted-foreground">التوزيع الزمني والإعلانات المصورة</p>
        </header>
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <FileImage size={40} className="text-muted-foreground/50" aria-hidden="true" />
          <p className="font-medium text-muted-foreground">لا توجد صور منشورة حالياً.</p>
        </div>
      </section>
    );
  }

  const slide = slides[activeIndex % slides.length];

  function showSlide(nextIndex: number) {
    setActiveIndex((nextIndex + slides.length) % slides.length);
    setZoom(1);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md" aria-labelledby="homepage-slider-title">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border bg-surface-muted/30 px-6 py-5">
        <div>
          <h2 id="homepage-slider-title" className="text-xl font-bold text-foreground">منشورات القسم</h2>
          <p className="mt-1 text-sm text-muted-foreground">التوزيع الزمني والإعلانات المصورة</p>
        </div>
        <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary">
          {activeIndex + 1} / {slides.length}
        </span>
      </header>

      <div className="relative flex h-[min(70vh,48rem)] min-h-[350px] items-center justify-center overflow-hidden bg-surface-muted/30 p-6 sm:p-10">
        <div className="homepage-slide-scrollport relative size-full overflow-auto rounded-lg border border-border/60 bg-background shadow-inner shadow-black/10">
          <div
            className="relative min-h-full min-w-full transition-[width,height] duration-200"
            style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
          >
            <Image
              src={getGoogleDriveImageUrl(slide.url)}
              alt={slide.title}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain p-2"
            />
          </div>
        </div>
        {slides.length > 1 && (
          <>
            <button type="button" onClick={() => showSlide(activeIndex - 1)} aria-label="الصورة السابقة" title="الصورة السابقة" className="absolute right-3 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90">
              <ChevronRight size={24} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => showSlide(activeIndex + 1)} aria-label="الصورة التالية" title="الصورة التالية" className="absolute left-3 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90">
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
          </>
        )}
        <span className="sr-only" aria-live="polite">{slide.title}</span>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-6">
        <h3 className="min-w-0 flex-1 truncate font-semibold text-foreground">{slide.title}</h3>
        <div className="flex shrink-0 items-center gap-1" aria-label="أدوات تكبير الصورة">
          <button type="button" onClick={() => setZoom((current) => Math.max(1, current - 0.25))} disabled={zoom <= 1} aria-label="تصغير الصورة" title="تصغير الصورة" className="flex size-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40">
            <ZoomOut size={19} aria-hidden="true" />
          </button>
          <span className="min-w-12 text-center text-xs font-semibold text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((current) => Math.min(3, current + 0.25))} disabled={zoom >= 3} aria-label="تكبير الصورة" title="تكبير الصورة" className="flex size-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40">
            <ZoomIn size={19} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} aria-label="الحجم الأصلي" title="الحجم الأصلي" className="flex size-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40">
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </section>
  );
}