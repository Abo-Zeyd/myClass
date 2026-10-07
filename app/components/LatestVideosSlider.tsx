'use client';

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type LatestVideoSlide = {
  id: string;
  subjectId: string;
  lessonId: string;
  title: string;
  url: string;
  lessonTitle: string;
};

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;

    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
        : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId =
        parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/+(?:embed|shorts)\/([^/]+)/)?.[1];
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

export default function LatestVideosSlider({
  videos,
  title = 'أحدث الفيديوهات',
  description = 'آخر مقاطع الفيديو المنشورة في القسم',
  headingId = 'latest-videos-title',
  showAllVideosLink = false,
}: {
  videos: LatestVideoSlide[];
  title?: string;
  description?: string;
  headingId?: string;
  showAllVideosLink?: boolean;
}) {
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

  if (videos.length === 0) {
    return null;
  }

  const slide = videos[activeIndex % videos.length] ?? videos[0];
  if (!slide) {
    return null;
  }

  const embedUrl = getEmbedUrl(slide.url);

  function showSlide(nextIndex: number) {
    setActiveIndex((nextIndex + videos.length) % videos.length);
  }

  return (
    <section
      role={isExpanded ? 'dialog' : undefined}
      aria-modal={isExpanded || undefined}
      aria-labelledby={headingId}
      className={
        isExpanded
          ? 'fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-surface'
          : 'overflow-hidden rounded-2xl border border-border bg-surface shadow-md'
      }
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/30 px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id={headingId} className="text-lg sm:text-xl font-bold text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs sm:text-sm font-bold text-secondary">
          {videos.length} فيديو
        </span>
      </header>

      <div
        className={`flex min-h-0 flex-col items-center overflow-y-auto bg-surface-muted/30 p-3 sm:p-6 ${isExpanded ? 'flex-1 justify-center' : ''}`}
      >
        <article className="flex w-full max-w-4xl min-w-0 items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 shadow-sm sm:gap-4 sm:px-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <FileVideo size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-foreground">
              <Link
                href={`/lessons?subject=${encodeURIComponent(slide.subjectId)}&lesson=${encodeURIComponent(slide.lessonId)}`}
                className="transition-colors hover:text-primary hover:underline"
              >
                {slide.title}
              </Link>
            </h3>
            <p className="truncate text-xs text-muted-foreground">{slide.lessonTitle}</p>
          </div>
          {videos.length > 1 && (
            <span
              dir="ltr"
              className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground"
            >
              {activeIndex + 1} / {videos.length}
            </span>
          )}
        </article>

        <div
          className={`relative mt-3 w-full overflow-hidden rounded-lg border border-border/60 bg-background shadow-inner shadow-black/10 ${isExpanded ? 'min-h-0 max-w-full flex-1' : 'aspect-video max-w-4xl'}`}
        >
          <div className="absolute inset-0">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={slide.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
                className="size-full"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-surface-muted/20 px-6 text-center text-muted-foreground">
                <div className="space-y-3">
                  <FileVideo size={48} className="mx-auto opacity-70" aria-hidden="true" />
                  <p className="font-medium">لا يمكن معاينة هذا الفيديو مباشرة.</p>
                  <a
                    href={slide.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary underline"
                  >
                    فتح الفيديو في علامة جديدة
                  </a>
                </div>
              </div>
            )}
          </div>

          {videos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => showSlide(activeIndex - 1)}
                aria-label="الفيديو السابق"
                title="الفيديو السابق"
                className="absolute right-3 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90"
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => showSlide(activeIndex + 1)}
                aria-label="الفيديو التالي"
                title="الفيديو التالي"
                className="absolute left-3 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-primary shadow-xl transition-all hover:bg-primary hover:text-white active:scale-90"
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      <footer className="flex min-h-14 items-center justify-end border-t border-border px-4 py-2 sm:px-6">
        <div className="flex shrink-0 items-center gap-2">
          {showAllVideosLink && (
            <Link
              href="/videos"
              aria-label="عرض جميع الفيديوهات حسب المادة"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
            >
              <span>عرض الكل</span>
              <ArrowLeft size={17} aria-hidden="true" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-label={isExpanded ? 'تصغير الفيديو' : 'عرض الفيديو بملء الصفحة'}
            title={isExpanded ? 'تصغير' : 'ملء الصفحة'}
            className="flex size-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
          >
            {isExpanded ? (
              <Minimize2 size={19} aria-hidden="true" />
            ) : (
              <Maximize2 size={19} aria-hidden="true" />
            )}
          </button>
        </div>
      </footer>
    </section>
  );
}
