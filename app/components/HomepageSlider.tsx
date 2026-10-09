'use client';

import { ChevronLeft, ChevronRight, Megaphone, MoveDiagonal2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { getGoogleDriveImageUrl } from '../../lib/google-drive';
import FullscreenImageViewer from './FullscreenImageViewer';
import RichText from './RichText';

export type HomepageSlide = {
  id: string;
  title: string;
  url: string;
  content: string;
};

export default function HomepageSlider({ slides }: { slides: HomepageSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerSlide, setViewerSlide] = useState<HomepageSlide | null>(null);

  if (slides.length === 0) {
    return (
      <section
        className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
        aria-labelledby="homepage-slider-title"
      >
        <header className="border-b border-border bg-surface-muted/30 px-6 py-5">
          <h2 id="homepage-slider-title" className="text-xl font-bold text-foreground">
            منشورات القسم
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">الإعلانات والمستندات المصورة</p>
        </header>
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <Megaphone size={40} className="text-muted-foreground/50" aria-hidden="true" />
          <p className="text-lg font-bold text-muted-foreground">
            يعرض هذا القسم منشورات القسم: معلومات، تنبيهات، إعلانات، وصور تعليمية من الأستاذ
            ومستندات مصورة
          </p>
        </div>
      </section>
    );
  }

  const slide = slides[activeIndex % slides.length];
  if (!slide) return null;

  const hasImage = Boolean(slide.url.trim());
  const hasContent = Boolean(slide.content.trim());

  function showSlide(nextIndex: number) {
    setActiveIndex((nextIndex + slides.length) % slides.length);
  }

  return (
    <section
      aria-labelledby="homepage-slider-title"
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
    >
      <header className="border-b border-border bg-surface-muted/30 px-4 py-4 text-center sm:px-6 sm:py-5">
        <h2 id="homepage-slider-title" className="text-lg font-bold text-foreground sm:text-xl">
          منشورات القسم
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          الإعلانات والمستندات المصورة
        </p>
        <h3 className="mx-auto mt-3 max-w-3xl break-words text-xl font-black leading-tight text-primary sm:text-2xl lg:text-3xl">
          {slide.title}
        </h3>
        <span className="mt-3 inline-block rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1 text-sm font-bold text-secondary">
          {activeIndex + 1} / {slides.length}
        </span>
      </header>

      <div
        className={`relative flex items-center justify-center overflow-hidden bg-surface-muted/30 ${
          hasImage && hasContent
            ? 'h-[min(88vh,52rem)] min-h-[28rem] p-2 sm:p-5'
            : hasContent
              ? 'h-[min(60vh,40rem)] min-h-[250px] p-3 sm:p-6'
              : 'h-[min(60vh,40rem)] min-h-[250px] p-3 sm:min-h-[350px] sm:p-6 sm:p-10'
        }`}
      >
        <div
          className={`relative size-full overflow-hidden rounded-lg border border-border/60 bg-background shadow-inner shadow-black/10 ${
            hasContent ? 'homepage-slide-scrollport overflow-auto' : ''
          }`}
        >
          {hasContent ? (
            <div className="p-4 sm:p-6">
              <RichText
                content={slide.content}
                imageUrl={hasImage ? getGoogleDriveImageUrl(slide.url) : undefined}
                imageAlt={slide.title}
                onImageClick={hasImage ? () => setViewerSlide(slide) : undefined}
              />
            </div>
          ) : (
            <div className="relative size-full">
              <Image
                src={getGoogleDriveImageUrl(slide.url)}
                alt={slide.title}
                fill
                unoptimized
                sizes="100vw"
                className="object-contain p-2 sm:p-4"
              />
            </div>
          )}

          {/* زر تكبير المنشور بملء الصفحة — يظهر دائماً في حالة الصور فقط */}
          {!hasContent && (
            <button
              type="button"
              onClick={() => setViewerSlide(slide)}
              aria-label="تكبير المنشور بملء الصفحة"
              title="تكبير بملء الصفحة"
              className="absolute left-3 top-3 z-20 flex size-9 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90 sm:size-10"
            >
              <MoveDiagonal2 size={19} aria-hidden="true" />
            </button>
          )}
        </div>
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => showSlide(activeIndex - 1)}
              aria-label="الصورة السابقة"
              title="الصورة السابقة"
              className="absolute right-2 sm:right-3 top-1/2 z-20 flex size-9 sm:size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => showSlide(activeIndex + 1)}
              aria-label="الصورة التالية"
              title="الصورة التالية"
              className="absolute left-2 sm:left-3 top-1/2 z-20 flex size-9 sm:size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          </>
        )}
        <span className="sr-only" aria-live="polite">
          {slides.map((item) => item.title).join(' • ')}
        </span>
      </div>

      {/* عارض الصورة بملء الشاشة — يعمل في الحالتين: صورة فقط أو نص وصورة */}
      <FullscreenImageViewer
        key={viewerSlide?.id ?? 'closed'}
        src={viewerSlide ? getGoogleDriveImageUrl(viewerSlide.url) : ''}
        alt={viewerSlide?.title ?? ''}
        shareUrl={viewerSlide?.url}
        isOpen={viewerSlide !== null}
        onClose={() => setViewerSlide(null)}
      />
    </section>
  );
}
