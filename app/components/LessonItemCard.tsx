import Image from "next/image";
import { Check, CircleAlert, Link2, Maximize2, Minimize2 } from "lucide-react";

import { useEffect, useState } from "react";

type LessonImage = {
  src: string;
  alt: string;
};

type LessonVideo = {
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
  };

type LessonItemCardProps = {
  item: LessonItem;
  lessonTitle: string;
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

function getImageSource(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    if (url.hostname !== "drive.google.com" && url.hostname !== "www.drive.google.com") {
      return imageUrl;
    }

    const fileId =
      url.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] ??
      url.searchParams.get("id");

    return fileId
      ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1600`
      : imageUrl;
  } catch {
    return imageUrl;
  }
}

export default function LessonItemCard({
  item,
  lessonTitle,
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
    <article className="overflow-hidden rounded-lg border border-border bg-surface">
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
        className="space-y-4 p-4 pt-2"
      >
        {item.summary && (
          <section
            id={summaryAnchorId}
            className="scroll-mt-6 rounded-md border border-border bg-background px-4 py-3"
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
              <p className="whitespace-pre-line text-base font-medium leading-8 text-foreground">
                {item.summary}
              </p>
            </div>
          </section>
        )}

        {item.activities && item.activities.length > 0 && (
          <section
            id={activitiesAnchorId}
            className="scroll-mt-6 rounded-md border border-border bg-background px-4 py-3"
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
          <section>
            <h4 className="mb-2 text-sm font-semibold text-foreground">الصور</h4>
            <div
              role="region"
              aria-label="شريط الصور"
              tabIndex={0}
              className="lesson-media-strip flex snap-x gap-3 overflow-x-auto overscroll-x-contain pb-2"
            >
              {item.images.map((image, index) => {
                const imageId = `${anchorBaseId}-image-${index}`;
                const isFullscreen = fullscreenMediaId === imageId;

                return (
                  <div
                    key={imageId}
                    id={imageId}
                    data-media-id={imageId}
                    className="lesson-image-card w-72 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-background scroll-mt-24"
                  >
                    <div className="relative flex h-48 items-center justify-center overflow-hidden group">
                      <Image
                        src={getImageSource(image.src)}
                        alt={image.alt || `صورة توضيحية لدرس ${lessonTitle}`}
                        width={960}
                        height={540}
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute right-2 top-2 flex flex-col gap-2">
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
          </section>
        )}

        {item.videos && item.videos.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-semibold text-foreground">الفيديوهات</h4>
            <div
              role="region"
              aria-label="شريط الفيديوهات"
              tabIndex={0}
              className="lesson-media-strip flex snap-x gap-3 overflow-x-auto overscroll-x-contain pb-2"
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
                    className="lesson-video-card w-80 shrink-0 snap-start overflow-hidden rounded-md border border-border bg-background"
                  >
                    {video.embedUrl ? (
                      <div className="relative aspect-video">
                        <iframe
                          src={video.embedUrl}
                          title={videoTitle}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="size-full"
                        />
                                                <button
                          type="button"
                          aria-label={isFullscreen ? "تصغير الفيديو" : "عرض الفيديو بملء الشاشة"}
                          title={isFullscreen ? "تصغير الفيديو" : "ملء الشاشة"}
                          onClick={() => toggleFullscreen(videoId)}
                          className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-xl bg-surface/90 text-primary shadow-sm hover:bg-surface transition-all active:scale-90"
                        >
                          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>

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
          </section>
        )}
      </div>
    </article>
  );
}