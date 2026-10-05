import Image from "next/image";
import { Check, CircleAlert, ChevronLeft, ChevronRight, Download, FileText, Link2, Maximize2, Minimize2 } from "lucide-react";
import { getGoogleDriveImageUrl } from "../../lib/google-drive";
import LessonComments from "./LessonComments";

import { useEffect, useState } from "react";

type LessonImage = {
  src: string;
  alt: string;
};

type LessonVideo = {
  url: string;
  title?: string;
};

type LessonPdf = {
  url: string;
  title?: string;
};

export type LessonItem =
  {
    id: string;
    title: string;
    summary?: string;
    activities?: string[];
    images?: LessonImage[];
    videos?: LessonVideo[];
    pdfs?: LessonPdf[];
  };

type LessonItemCardProps = {
  item: LessonItem;
  lessonTitle: string;
  subjectId: string;
  lessonId: string;
  contentId: string;
  anchorBaseId: string;
  navigationTargetId: string | null;
  onClearNavigationTarget: () => void;
  isCollapsible: boolean;
  isExpanded: boolean;
  onToggle: () => void;
};

function getVideoDetails(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    if (url.protocol !== "https:") return null;

    const hostname = url.hostname.replace(/^www\./, "");
    let videoId: string | undefined;

    if (hostname === "youtu.be") {
      videoId = url.pathname.slice(1).split("/")[0];
    } else if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      videoId =
        url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
    }

    return videoId
      ? { embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` }
      : { linkUrl: url.href };
  } catch {
    return null;
  }
}

function getPdfUrls(pdfUrl: string) {
  try {
    const url = new URL(pdfUrl);
    if (url.hostname !== "drive.google.com" && url.hostname !== "www.drive.google.com") {
      return { previewUrl: pdfUrl, downloadUrl: pdfUrl };
    }

    const fileId =
      url.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] ??
      url.searchParams.get("id");

    return fileId
      ? {
          previewUrl: `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`,
        }
      : { previewUrl: pdfUrl, downloadUrl: pdfUrl };
  } catch {
    return { previewUrl: pdfUrl, downloadUrl: pdfUrl };
  }
}

export default function LessonItemCard({
  item,
  lessonTitle,
  subjectId,
  lessonId,
  contentId,
  anchorBaseId,
  navigationTargetId,
  onClearNavigationTarget,
  isCollapsible,
  isExpanded,
  onToggle,
}: LessonItemCardProps) {
  const [fullscreenMediaId, setFullscreenMediaId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState<{
    anchorId: string;
    status: "copied" | "failed";
  } | null>(null);
  const [imageSliderIndex, setImageSliderIndex] = useState(0);
  const [videoSliderIndex, setVideoSliderIndex] = useState(0);
  const summaryAnchorId = `${anchorBaseId}-summary`;
  const activitiesAnchorId = `${anchorBaseId}-activities`;
  const isSummaryCollapsed =
    collapsedSections.includes(summaryAnchorId) && navigationTargetId !== summaryAnchorId;
  const areActivitiesCollapsed =
    collapsedSections.includes(activitiesAnchorId) && navigationTargetId !== activitiesAnchorId;

  useEffect(() => {
    function updateFullscreenMedia() {
      setFullscreenMediaId(
        document.fullscreenElement?.getAttribute("data-media-id") ?? null,
      );
    }

    document.addEventListener("fullscreenchange", updateFullscreenMedia);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenMedia);
  }, []);

  async function copySectionLink(anchorId: string) {
    const link = new URL(window.location.href);
    link.hash = anchorId;

    try {
      await navigator.clipboard.writeText(link.toString());
      setCopyStatus({ anchorId, status: "copied" });
    } catch {
      setCopyStatus({ anchorId, status: "failed" });
    }
  }

  function toggleSection(sectionId: string) {
    if (navigationTargetId === sectionId) onClearNavigationTarget();

    setCollapsedSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  }

  function toggleFullscreen(mediaId: string) {
    const mediaElement = document.querySelector<HTMLElement>(
      `[data-media-id="${mediaId}"]`,
    );

    if (!mediaElement) return;

    if (document.fullscreenElement === mediaElement) {
      void document.exitFullscreen();
    } else {
      void mediaElement.requestFullscreen();
    }
  }

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-sm">
      {isCollapsible ? (
        <h3>
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-right font-bold text-foreground transition-colors hover:bg-surface-muted/40"
          >
            <span>{item.title}</span>
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-lg text-primary"
            >
              {isExpanded ? "−" : "+"}
            </span>
          </button>
        </h3>
      ) : (
        <h3 className="px-4 pt-4 font-bold text-foreground">{item.title}</h3>
      )}

      <div
        id={contentId}
        hidden={isCollapsible && !isExpanded}
        className="min-w-0 space-y-4 p-4 pt-2"
      >
        {item.summary && (
          <section
            id={summaryAnchorId}
            className="scroll-mt-6 rounded-md border border-border bg-background px-4 py-3 min-w-0"
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                aria-expanded={!isSummaryCollapsed}
                aria-controls={`${summaryAnchorId}-content`}
                onClick={() => toggleSection(summaryAnchorId)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-right"
              >
                <h4 className="text-sm font-semibold text-foreground">الخلاصة</h4>
                <span aria-hidden="true" className="text-lg text-primary">
                  {isSummaryCollapsed ? "+" : "−"}
                </span>
              </button>
              <button
                type="button"
                aria-label={
                  copyStatus?.anchorId === summaryAnchorId && copyStatus.status === "copied"
                    ? "تم نسخ رابط الخلاصة"
                    : copyStatus?.anchorId === summaryAnchorId
                      ? "تعذر نسخ رابط الخلاصة"
                      : "نسخ رابط الخلاصة"
                }
                title="نسخ رابط الخلاصة"
                onClick={() => void copySectionLink(summaryAnchorId)}
                                className="flex size-9 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
              >
                {copyStatus?.anchorId === summaryAnchorId
                  ? copyStatus.status === "copied"
                    ? <Check aria-hidden="true" size={18} />
                    : <CircleAlert aria-hidden="true" size={18} />
                  : <Link2 aria-hidden="true" size={18} />}
              </button>

            </div>
            <div
              id={`${summaryAnchorId}-content`}
              hidden={isSummaryCollapsed}
              className="pt-2"
            >
              <p className="whitespace-pre-line rounded-md border border-secondary/60 bg-surface px-4 py-3 font-naskh text-lg font-medium leading-9 text-foreground shadow-sm">
                {item.summary}
              </p>
            </div>
          </section>
        )}

        {item.activities && item.activities.length > 0 && (
          <section
            id={activitiesAnchorId}
            className="scroll-mt-6 rounded-md border border-border bg-background px-4 py-3 min-w-0"
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                aria-expanded={!areActivitiesCollapsed}
                aria-controls={`${activitiesAnchorId}-content`}
                onClick={() => toggleSection(activitiesAnchorId)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-right"
              >
                <h4 className="text-sm font-semibold text-foreground">أنشطة وتمارين</h4>
                <span aria-hidden="true" className="text-lg text-primary">
                  {areActivitiesCollapsed ? "+" : "−"}
                </span>
              </button>
              <button
                type="button"
                aria-label={
                  copyStatus?.anchorId === activitiesAnchorId && copyStatus.status === "copied"
                    ? "تم نسخ رابط الأنشطة"
                    : copyStatus?.anchorId === activitiesAnchorId
                      ? "تعذر نسخ رابط الأنشطة"
                      : "نسخ رابط الأنشطة"
                }
                title="نسخ رابط الأنشطة"
                onClick={() => void copySectionLink(activitiesAnchorId)}
                                className="flex size-9 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
              >
                {copyStatus?.anchorId === activitiesAnchorId
                  ? copyStatus.status === "copied"
                    ? <Check aria-hidden="true" size={18} />
                    : <CircleAlert aria-hidden="true" size={18} />
                  : <Link2 aria-hidden="true" size={18} />}
              </button>

            </div>
            <div
              id={`${activitiesAnchorId}-content`}
              hidden={areActivitiesCollapsed}
              className="pt-2"
            >
              <ol className="list-inside list-decimal space-y-2 text-base font-medium leading-8 text-foreground">
                {item.activities.map((activity, index) => (
                  <li key={`${item.id}-activity-${index}`}>{activity}</li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {item.images && item.images.length > 0 && (
          <section className="min-w-0">
            <h4 className="mb-2 text-sm font-semibold text-foreground">الصور</h4>
            <div className="relative mb-2 flex items-center justify-between rounded-md border border-border bg-background px-2 py-1">
              <button
                type="button"
                disabled={item.images.length < 2}
                onClick={() => setImageSliderIndex((prev) => (prev - 1 + item.images!.length) % item.images!.length)}
                aria-label="الصورة السابقة"
                title="الصورة السابقة"
                className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={20} />
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold tabular-nums text-foreground" aria-live="polite">
                {imageSliderIndex + 1} / {item.images.length}
              </span>
              <button
                type="button"
                disabled={item.images.length < 2}
                onClick={() => setImageSliderIndex((prev) => (prev + 1) % item.images!.length)}
                aria-label="الصورة التالية"
                title="الصورة التالية"
                className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="relative" role="region" aria-label="سلايدر الصور">
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(${imageSliderIndex * 100}%)` }}
                >
                  {item.images.map((image, index) => {
                    const imageId = `${anchorBaseId}-image-${index}`;
                    const isFullscreen = fullscreenMediaId === imageId;

                    return (
                      <div
                        key={imageId}
                        id={imageId}
                        data-media-id={imageId}
                        className="lesson-image-card w-full shrink-0 scroll-mt-24"
                      >
                        <div className="group relative flex h-[clamp(18rem,65vh,46rem)] items-center justify-center overflow-hidden">
                          <Image
                            src={getGoogleDriveImageUrl(image.src)}
                            alt={image.alt || `صورة توضيحية لدرس ${lessonTitle}`}
                            width={960}
                            height={540}
                            className="h-full w-full object-contain"
                          />
                          <div className="absolute right-2 top-2 flex flex-col gap-2 z-10 fullscreen-controls">
                            <button
                              type="button"
                              aria-label={isFullscreen ? "تصغير الصورة" : "عرض الصورة بملء الشاشة"}
                              title={isFullscreen ? "تصغير الصورة" : "ملء الشاشة"}
                              onClick={() => toggleFullscreen(imageId)}
                              className="flex size-9 items-center justify-center rounded-xl bg-surface/90 text-primary shadow-sm hover:bg-surface transition-all active:scale-90"
                            >
                              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                            <button
                              type="button"
                              aria-label="نسخ رابط الصورة"
                              title="نسخ رابط الصورة"
                              onClick={() => void copySectionLink(imageId)}
                              className="flex size-9 items-center justify-center rounded-xl bg-surface/90 text-primary shadow-sm hover:bg-surface transition-all active:scale-90"
                            >
                              {copyStatus?.anchorId === imageId && copyStatus.status === "copied" ? (
                                <Check size={18} />
                              ) : (
                                <Link2 size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div
                className="mt-3 flex gap-2 overflow-x-auto pb-2"
                role="group"
                aria-label="مصغرات الصور"
              >
                {item.images.map((image, index) => (
                  <button
                    key={`${anchorBaseId}-image-thumbnail-${index}`}
                    type="button"
                    aria-label={`عرض الصورة ${index + 1}: ${image.alt || `صورة توضيحية لدرس ${lessonTitle}`}`}
                    aria-pressed={imageSliderIndex === index}
                    onClick={() => setImageSliderIndex(index)}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      imageSliderIndex === index
                        ? "border-primary"
                        : "border-border hover:border-primary/60"
                    }`}
                  >
                    <Image
                      src={getGoogleDriveImageUrl(image.src)}
                      alt=""
                      width={144}
                      height={96}
                      className="h-20 w-28 object-cover sm:h-24 sm:w-36"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {item.videos && item.videos.length > 0 && (
          <section className="min-w-0">
            <h4 className="mb-2 text-sm font-semibold text-foreground">الفيديوهات</h4>
            <div className="relative mb-2 flex items-center justify-between rounded-md border border-border bg-background px-2 py-1">
              <button
                type="button"
                disabled={item.videos.length < 2}
                onClick={() => setVideoSliderIndex((prev) => (prev - 1 + item.videos!.length) % item.videos!.length)}
                aria-label="الفيديو السابق"
                title="الفيديو السابق"
                className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={20} />
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold tabular-nums text-foreground" aria-live="polite">
                {videoSliderIndex + 1} / {item.videos.length}
              </span>
              <button
                type="button"
                disabled={item.videos.length < 2}
                onClick={() => setVideoSliderIndex((prev) => (prev + 1) % item.videos!.length)}
                aria-label="الفيديو التالي"
                title="الفيديو التالي"
                className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="relative" role="region" aria-label="سلايدر الفيديوهات">
              <div className="overflow-hidden rounded-md border border-border bg-background">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(${videoSliderIndex * 100}%)` }}
                >
                  {item.videos.map((videoItem, index) => {
                    const video = getVideoDetails(videoItem.url);
                    const videoTitle = videoItem.title || `${item.title} - ${lessonTitle}`;
                    const videoId = `${item.id}-video-${index}`;
                    const isFullscreen = fullscreenMediaId === videoId;

                    if (!video) return null;

                    return (
                      <div
                        key={videoId}
                        data-media-id={videoId}
                        className="lesson-video-card w-full shrink-0"
                      >
                        {video.embedUrl ? (
                          <div className="relative aspect-video group">
                            <iframe
                              src={video.embedUrl}
                              title={videoTitle}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="size-full"
                            />
                            <div className="absolute right-2 top-2 z-10 flex flex-col gap-2 fullscreen-controls opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                type="button"
                                aria-label={isFullscreen ? "تصغير الفيديو" : "عرض الفيديو بملء الشاشة"}
                                title={isFullscreen ? "تصغير الفيديو" : "ملء الشاشة"}
                                onClick={() => toggleFullscreen(videoId)}
                                className="flex size-9 items-center justify-center rounded-xl bg-surface/90 text-primary shadow-sm hover:bg-surface transition-all active:scale-90"
                              >
                                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <a
                            href={video.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex px-4 py-3 text-sm font-semibold text-primary underline"
                          >
                            مشاهدة الفيديو: {videoItem.title || "فتح الرابط"}
                          </a>
                        )}
                        {videoItem.title && (
                          <p className="px-3 py-2 text-sm font-medium text-foreground">
                            {videoItem.title}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {item.pdfs && item.pdfs.length > 0 && (
          <section className="space-y-3 min-w-0">
            <h4 className="text-sm font-semibold text-foreground">ملفات PDF</h4>
            <div className="space-y-4">
              {item.pdfs.map((pdf, index) => {
                const urls = getPdfUrls(pdf.url);
                const pdfId = `${anchorBaseId}-pdf-${index}`;
                return (
                  <article
                    key={`${item.id}-pdf-${index}`}
                    id={pdfId}
                    className="scroll-mt-24 overflow-hidden rounded-md border border-border bg-background"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                      <h5 className="inline-flex min-w-0 items-center gap-2 font-semibold text-foreground">
                        <FileText size={18} className="shrink-0 text-primary" aria-hidden="true" />
                        <span className="wrap-break-word">{pdf.title || `ملف PDF ${index + 1}`}</span>
                      </h5>
                      <div className="inline-flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          aria-label={
                            copyStatus?.anchorId === pdfId && copyStatus.status === "copied"
                              ? "تم نسخ رابط ملف PDF"
                              : copyStatus?.anchorId === pdfId
                                ? "تعذر نسخ رابط ملف PDF"
                                : "نسخ رابط ملف PDF"
                          }
                          title="نسخ رابط ملف PDF"
                          onClick={() => void copySectionLink(pdfId)}
                          className="flex size-10 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
                        >
                          {copyStatus?.anchorId === pdfId
                            ? copyStatus.status === "copied"
                              ? <Check aria-hidden="true" size={18} />
                              : <CircleAlert aria-hidden="true" size={18} />
                            : <Link2 aria-hidden="true" size={18} />}
                        </button>
                        <a
                          href={urls.downloadUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="pdf-download-link inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          <Download size={17} aria-hidden="true" />
                          تنزيل
                        </a>
                      </div>
                    </div>
                    <iframe
                      src={urls.previewUrl}
                      title={pdf.title || `ملف PDF ${index + 1} - ${lessonTitle}`}
                      className="h-[min(70vh,48rem)] min-h-96 w-full bg-white"
                    />
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <LessonComments subjectId={subjectId} lessonId={lessonId} itemId={item.id} />
      </div>
    </article>
  );
}