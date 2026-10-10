'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type NaturalImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** يلف المحتوى المعروض فوق الصورة (مثل زر التكبير) */
  overlay?: ReactNode;
  sizes?: string;
  priority?: boolean;
};

type Size = { width: number; height: number };

/**
 * صورة تُعرض بحجمها الطبيعي.
 *
 * تُصغَّر فقط إذا تجاوزت حدود الحاوية، ولا تُضخَّم أبداً فوق أصلها.
 * هذا هو السلوك الصحيح لخرائط التوزيع الزمني وصور الجداول: تكبيرها
 * يجعل النص مشوّهاً وغير مقروء.
 */
export default function NaturalImage({
  src,
  alt,
  className = '',
  overlay,
  sizes = '100vw',
  priority = false,
}: NaturalImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<Size>({ width: 0, height: 0 });
  const [container, setContainer] = useState<Size>({ width: 0, height: 0 });

  // قياس الحاوية — يتابع تغيّر حجم الشاشة
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    function measure() {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setContainer({ width: rect.width, height: rect.height });
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const isReady = natural.width > 0 && container.width > 0 && container.height > 0;

  /**
   * الحجم النهائي المعروض:
   *  - الحد الأعلى = الحجم الطبيعي (لا نضخّم صورة صغيرة)
   *  - الحد الأدنى = حدود الحاوية (نُصغّر الصورة الكبيرة)
   */
  const displaySize = isReady
    ? {
        width: natural.width * Math.min(1, container.width / natural.width, container.height / natural.height),
        height: natural.height * Math.min(1, container.width / natural.width, container.height / natural.height),
      }
    : null;

  return (
    <div ref={containerRef} className={`relative size-full ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          {...(isReady ? { width: natural.width, height: natural.height } : {})}
          src={src}
          alt={alt}
          unoptimized
          priority={priority}
          sizes={sizes}
          onLoad={(event) => {
            const image = event.currentTarget;
            if (image.naturalWidth > 0 && image.naturalHeight > 0) {
              setNatural({ width: image.naturalWidth, height: image.naturalHeight });
            }
          }}
          // قياسات صريحة تتجاوز preflight الذي يفرض max-width:100% و height:auto
          style={{
            width: displaySize ? displaySize.width : undefined,
            height: displaySize ? displaySize.height : undefined,
            maxWidth: 'none',
            maxHeight: 'none',
            objectFit: 'contain',
          }}
        />
      </div>
      {overlay}
    </div>
  );
}
