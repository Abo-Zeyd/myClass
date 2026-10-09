'use client';

import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export type FullscreenImageViewerProps = {
  src: string;
  alt: string;
  /** رابط الصورة الأصلي (مثل رابط مشاركة Google Drive) */
  shareUrl?: string | undefined;
  isOpen: boolean;
  onClose: () => void;
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

type Area = { width: number; height: number };

export default function FullscreenImageViewer({
  src,
  alt,
  shareUrl,
  isOpen,
  onClose,
}: FullscreenImageViewerProps) {
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [area, setArea] = useState<Area>({ width: 0, height: 0 });
  const areaRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // قياس المساحة المتاحة فعلياً — يضمن الاحتواء مهما تغيّر حجم الشاشة أو الاتجاه
  useEffect(() => {
    if (!isOpen) return;

    const element = areaRef.current;
    if (!element) return;

    function measure() {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setArea({ width: rect.width, height: rect.height });
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isOpen]);

  // الإغلاق بمفتاح Escape + منع تمرير الخلفية + تركيز زر الإغلاق
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isZoomed = zoom > ZOOM_MIN;
  const hasArea = area.width > 0 && area.height > 0;

  // عند التكبير نصغّر الإطار نفسه، فتبقى الصورة كاملة الظهور داخل منطقة العرض
  const frameStyle: React.CSSProperties | undefined = hasArea
    ? {
        width: area.width / zoom,
        height: area.height / zoom,
        transition: 'width 0.2s ease, height 0.2s ease',
      }
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
    >
      {/* شريط الأدوات */}
      <div className="flex shrink-0 items-center justify-between gap-2 bg-black/40 p-2 sm:p-3">
        <span className="min-w-0 flex-1 truncate px-1 text-sm font-bold text-white/90 sm:text-base">
          {alt}
        </span>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(ZOOM_MIN, current - ZOOM_STEP))}
            disabled={!isZoomed}
            aria-label="تصغير الصورة"
            title="تصغير"
            className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11"
          >
            <ZoomOut size={19} aria-hidden="true" />
          </button>

          <span className="min-w-12 text-center text-xs font-bold text-white/90 sm:text-sm">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(ZOOM_MAX, current + ZOOM_STEP))}
            disabled={zoom >= ZOOM_MAX}
            aria-label="تكبير الصورة"
            title="تكبير"
            className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11"
          >
            <ZoomIn size={19} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setZoom(ZOOM_MIN)}
            disabled={!isZoomed}
            aria-label="الحجم الأصلي"
            title="الحجم الأصلي"
            className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11"
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>

          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="فتح الصورة في تبويب جديد"
              title="فتح في تبويب جديد"
              className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:size-11"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
              </svg>
            </a>
          )}

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق الصورة"
            title="إغلاق"
            className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-red-600 sm:size-11"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* منطقة العرض — الصورة محتواة بالكامل داخلها دائماً */}
      <div
        ref={areaRef}
        onClick={onClose}
        className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden p-2 sm:p-4"
      >
        <div
          onClick={(event) => event.stopPropagation()}
          style={frameStyle}
          className="relative shrink-0 overflow-hidden"
        >
          {hasArea && (
            <Image
              src={src}
              alt={alt}
              fill
              unoptimized
              priority
              sizes="100vw"
              // object-contain ضمن إطار بأبعاد محسوبة = احتواء كامل بلا قص
              className="object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
