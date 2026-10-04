'use client';

import { ChevronLeft, ChevronRight, FileVideo, Maximize2, Minimize2 } from 'lucide-react';
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

export default function LatestVideosSlider({ videos }: { videos: LatestVideoSlide[] }) {
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
      aria-labelledby="latest-videos-title"
      className={
        isExpanded
          ? 'fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-surface'
          : 'overflow-hidden rounded-2xl border border-border bg-surface shadow-md'
      }
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/30 px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id="latest-videos-title" className="text-lg sm:text-xl font-bold text-foreground">
            أحدث الفيديوهات
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">آخر مقاطع الفيديو المنشورة في القسم</p>
        </div>
        <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs sm:text-sm font-bold text-secondary">
          {videos.length} فيديو
        </span>
      </header>

      <div
        className={
          isExpanded
            ? 'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-surface-muted/30 p-2 sm:p-6'
            : 'relative flex h-[min(60vh,40rem)] min-h-[220px] sm:min-h-[320px] items-center justify-center overflow-hidden bg-surface-muted/30 p-3 sm:p-6 sm:p-10'
        }
      >
        <div className="relative size-full overflow-hidden rounded-lg border border-border/60 bg-background shadow-inner shadow-black/10">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={slide.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
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
      </footer>
    </section>
  );
}
