import { MoveDiagonal2, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';

type RichTextProps = {
  content: string;
  className?: string;
  /** رابط صورة اختياري يطفو مع النص (منشورات القسم) */
  imageUrl?: string | undefined;
  imageAlt?: string | undefined;
  /** عند تمريره تصبح الصورة العائمة قابلة للنقر لفتحها بملء الصفحة */
  onImageClick?: (() => void) | undefined;
  /**放开 تكبير الصور المضمّنة داخل النص عند النقر */
  onInlineImageClick?: ((src: string, alt: string) => void) | undefined;
};

type Size = { width: number; height: number };

const INLINE_PATTERN =
  /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|_[^_\n]+_|\[[^\]]+\]\([^)\s]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/** بادئة الكتلة الموسّطة — تُزال من العرض */
const CENTER_PREFIX = '::: ';
/** بادئة الكتلة المحاذاة لليمين — تُزال من العرض */
const RIGHT_PREFIX = '!!! ';

/** يفصل رابط مشاركة Google Drive إلى رابط صورة مباشر */
function resolveImageSrc(src: string) {
  try {
    const url = new URL(src);
    if (url.hostname === 'drive.google.com' || url.hostname === 'www.drive.google.com') {
      const fileId =
        url.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] ?? url.searchParams.get('id') ?? null;
      if (fileId) return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`;
    }
  } catch {
    // رابط غير صالح — نستخدمه كما هو
  }
  return src;
}

function isSafeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:'
    );
  } catch {
    return false;
  }
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_PATTERN.lastIndex = 0;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;

    if (token.startsWith('***')) {
      nodes.push(
        <strong key={key} className="font-black text-foreground">
          {token.slice(3, -3)}
        </strong>
      );
    } else if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-extrabold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('__')) {
      nodes.push(
        <u key={key} className="decoration-primary decoration-2 underline-offset-2">
          {token.slice(2, -2)}
        </u>
      );
    } else if (token.startsWith('_')) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      const linkMatch = token.match(LINK_PATTERN);
      const linkText = linkMatch?.[1];
      const linkUrl = linkMatch?.[2];
      if (linkText !== undefined && linkUrl !== undefined && isSafeUrl(linkUrl)) {
        nodes.push(
          <a
            key={key}
            href={linkUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            {linkText}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** ![نص بديل](رابط الصورة) — صورة مضمّنة داخل النص */
const IMAGE_PATTERN = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

/** بادئة السطر لاختيار الخط: ~اسم~ */
const FONT_LINE_PATTERN = /^~([a-z]+)~\s*/i;

/** أحجام السطر حسب البادئة */
const LINE_SIZE_CLASSES: Record<number, string> = {
  1: 'text-sm sm:text-base',
  2: 'text-base sm:text-lg',
  3: 'text-lg sm:text-xl',
};

const FONT_FAMILY_CLASSES: Record<string, string> = {
  naskh: 'font-naskh',
  sans: 'font-sans',
};

/**
 * يفصل سطراً إلى كتل: نصوص وصور مضمّنة.
 * كل صورة تُعرض في سطر مستقل مع إمكانية النقر لتكبيرها.
 */
function renderLine(
  line: string,
  keyPrefix: string,
  onInlineImageClick?: (src: string, alt: string) => void
): ReactNode[] {
  const imageMatch = line.trim().match(IMAGE_PATTERN);
  if (!imageMatch) return renderInline(line, keyPrefix);

  const alt = imageMatch[1] ?? '';
  const src = imageMatch[2] ?? '';
  if (!src) return [];

  const resolved = resolveImageSrc(src);
  const image = (
    <figure key={`${keyPrefix}-img`} className="my-3 flex flex-col items-center gap-2">
      {onInlineImageClick ? (
        <button
          type="button"
          onClick={() => onInlineImageClick(resolved, alt)}
          title="تكبير الصورة"
          className="group relative w-full overflow-hidden rounded-lg border border-border/60 bg-surface transition-shadow hover:shadow-lg"
        >
          <Image
            src={resolved}
            alt={alt}
            width={960}
            height={720}
            unoptimized
            className="h-auto max-h-[28rem] w-full object-contain"
          />
          <span className="absolute left-1.5 top-1.5 flex size-8 items-center justify-center rounded-full bg-white/95 text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <ZoomIn size={16} aria-hidden="true" />
          </span>
        </button>
      ) : (
        <Image
          src={resolved}
          alt={alt}
          width={960}
          height={720}
          unoptimized
          className="h-auto max-h-[28rem] w-full rounded-lg border border-border/60 object-contain"
        />
      )}
      {alt && <figcaption className="text-center text-xs text-muted-foreground">{alt}</figcaption>}
    </figure>
  );

  return [image];
}

export default function RichText({
  content,
  className = '',
  imageUrl,
  imageAlt = '',
  onImageClick,
  onInlineImageClick,
}: RichTextProps) {
  // الأبعاد الطبيعية للصورة العائمة — تُقاس بعد التحميل لتفادي التشويه
  const [floatingSize, setFloatingSize] = useState<Size>({ width: 480, height: 640 });

  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];

  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let quoteLines: string[] = [];
  let centeredLines: string[] = [];
  let rightLines: string[] = [];

  const floatingRatio =
    floatingSize.width > 0 && floatingSize.height > 0
      ? `${floatingSize.width} / ${floatingSize.height}`
      : null;

  // الصورة تطفو على اليسار فيلتفّ النص حولها، وتُدرج مرة واحدة في البداية.
  const floatingImage =
    imageUrl && imageUrl.trim() ? (
      <div key="floating-image" className="float-left me-4 mb-3 w-40 shrink-0 sm:w-52 lg:w-60">
        <div
          className="relative overflow-hidden rounded-lg border border-border/60 bg-surface"
          // follows the real image ratio so small/wide images aren't stretched
          style={floatingRatio ? { aspectRatio: floatingRatio } : undefined}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={floatingSize.width}
            height={floatingSize.height}
            unoptimized
            className="h-auto w-full object-contain"
            onLoad={(event) => {
              const image = event.currentTarget;
              if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                setFloatingSize({
                  width: image.naturalWidth,
                  height: image.naturalHeight,
                });
              }
            }}
          />

          {/* زر التكبير في أحد أركان الصورة العائمة */}
          {onImageClick && (
            <button
              type="button"
              onClick={onImageClick}
              aria-label={`تكبير الصورة: ${imageAlt}`}
              title="عرض الصورة بملء الصفحة"
              className="absolute left-1.5 top-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-all hover:bg-primary hover:text-white active:scale-90 sm:size-9"
            >
              <MoveDiagonal2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    ) : null;

  function flushLists() {
    if (listItems.length > 0) {
      blocks.push(
        <ul
          key={`ul-${blocks.length}`}
          className="list-inside list-disc space-y-1.5 ps-5 marker:text-primary"
        >
          {listItems.map((item, index) => (
            <li key={index}>{renderInline(item, `li-${blocks.length}-${index}`)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    if (orderedListItems.length > 0) {
      blocks.push(
        <ol
          key={`ol-${blocks.length}`}
          className="list-inside list-decimal space-y-1.5 ps-5 marker:font-bold marker:text-primary"
        >
          {orderedListItems.map((item, index) => (
            <li key={index}>{renderInline(item, `oli-${blocks.length}-${index}`)}</li>
          ))}
        </ol>
      );
      orderedListItems = [];
    }
  }

  function flushQuote() {
    if (quoteLines.length > 0) {
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="border-s-4 border-primary/50 bg-surface-muted/40 px-4 py-2 text-base italic text-muted-foreground"
        >
          {renderInline(quoteLines.join(' '), `quote-${blocks.length}`)}
        </blockquote>
      );
      quoteLines = [];
    }
  }

  function flushAligned() {
    if (centeredLines.length > 0) {
      blocks.push(
        <p
          key={`center-${blocks.length}`}
          className="text-center text-base leading-8 text-foreground sm:text-lg"
        >
          {renderInline(centeredLines.join(' '), `center-${blocks.length}`)}
        </p>
      );
      centeredLines = [];
    }
    if (rightLines.length > 0) {
      blocks.push(
        <p
          key={`right-${blocks.length}`}
          className="text-start text-base leading-8 text-foreground sm:text-lg"
        >
          {renderInline(rightLines.join(' '), `right-${blocks.length}`)}
        </p>
      );
      rightLines = [];
    }
  }

  function flushAll() {
    flushLists();
    flushQuote();
    flushAligned();
  }

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushAll();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    const headingLevel = headingMatch?.[1]?.length;
    const headingText = headingMatch?.[2];
    if (headingLevel !== undefined && headingText !== undefined) {
      flushAll();
      const headingClasses =
        [
          'text-xl font-black leading-snug text-primary sm:text-2xl',
          'text-lg font-extrabold leading-snug text-foreground sm:text-xl',
          'text-base font-bold leading-snug text-foreground sm:text-lg',
        ][headingLevel - 1] ?? 'text-base font-bold leading-snug text-foreground';

      blocks.push(
        <h3 key={`h-${lineIndex}`} className={headingClasses}>
          {renderInline(headingText, `h-${lineIndex}`)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith(CENTER_PREFIX)) {
      flushLists();
      flushQuote();
      rightLines = [];
      centeredLines.push(trimmed.slice(CENTER_PREFIX.length));
      return;
    }

    if (trimmed.startsWith(RIGHT_PREFIX)) {
      flushLists();
      flushQuote();
      centeredLines = [];
      rightLines.push(trimmed.slice(RIGHT_PREFIX.length));
      return;
    }

    if (/^>\s?/.test(trimmed)) {
      flushLists();
      flushAligned();
      quoteLines.push(trimmed.replace(/^>\s?/, ''));
      return;
    }

    if (/^-\s+/.test(trimmed)) {
      flushQuote();
      flushAligned();
      orderedListItems = [];
      listItems.push(trimmed.replace(/^-\s+/, ''));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushQuote();
      flushAligned();
      listItems = [];
      orderedListItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      return;
    }

    flushAll();

    // سطر صورة مضمّنة: يُعرض في سطر مستقل مع إمكانية التكبير
    if (IMAGE_PATTERN.test(trimmed)) {
      blocks.push(
        <div key={`line-${lineIndex}`}>
          {renderLine(trimmed, `img-${lineIndex}`, onInlineImageClick)}
        </div>
      );
      return;
    }

    // بادئة السطر: # حجم، ~خط~
    let lineText = trimmed;
    let sizeClasses = '';
    let fontClasses = '';

    const sizeLevel = lineText.match(/^(#{1,3})\s+/)?.[1]?.length;
    if (sizeLevel !== undefined) {
      sizeClasses = LINE_SIZE_CLASSES[sizeLevel] ?? '';
      lineText = lineText.replace(/^#{1,3}\s+/, '');
    }

    const fontMatch = lineText.match(FONT_LINE_PATTERN);
    const fontKey = fontMatch?.[1]?.toLowerCase();
    if (fontKey !== undefined) {
      fontClasses = FONT_FAMILY_CLASSES[fontKey] ?? '';
      lineText = lineText.replace(FONT_LINE_PATTERN, '');
    }

    blocks.push(
      <p
        key={`p-${lineIndex}`}
        className={`leading-8 text-foreground ${sizeClasses || 'text-base sm:text-lg'} ${fontClasses}`}
      >
        {renderInline(lineText, `p-${lineIndex}`)}
      </p>
    );
  });

  flushAll();

  if (blocks.length === 0 && !floatingImage) return null;

  // حاوية بـ flow-root تحتوي الطفو وتضمن التفاف النص بشكل صحيح
  return (
    <div className={`flow-root ${className}`}>
      {floatingImage}
      <div className="space-y-3">{blocks}</div>
    </div>
  );
}
