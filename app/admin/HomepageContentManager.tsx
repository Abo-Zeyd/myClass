'use client';

import { BellRing, ChevronDown, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Announcement, HomepageSlide } from '../../lib/content-db';
import { getGoogleDriveFileId, getGoogleDriveImageUrl } from '../../lib/google-drive';
import RichTextEditor from '../components/RichTextEditor';
import {
  loadAnnouncements,
  loadHomepageSlides,
  saveAnnouncements,
  saveHomepageSlides,
} from './actions';

const inputClassName =
  'w-full rounded-md border border-border bg-surface px-3 py-3 text-base font-normal leading-7 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
const labelClassName = 'grid gap-2 text-sm font-medium text-foreground';
const controlButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50';
const primaryButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const dangerButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md text-error transition-colors hover:bg-error-light disabled:cursor-not-allowed disabled:opacity-50';

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export default function HomepageContentManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [expandedPanel, setExpandedPanel] = useState<'announcements' | 'slides' | null>(null);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([loadAnnouncements(), loadHomepageSlides()])
      .then(([loadedAnnouncements, loadedSlides]) => {
        if (!active) return;
        setAnnouncements(loadedAnnouncements);
        setSlides(loadedSlides);
      })
      .catch((error: unknown) => {
        if (active)
          setNotice({
            type: 'error',
            text: error instanceof Error ? error.message : 'تعذر تحميل محتوى الصفحة الرئيسية.',
          });
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function persistAnnouncements() {
    setBusy(true);
    setNotice(null);
    try {
      await saveAnnouncements(announcements);
      setNotice({ type: 'success', text: 'تم حفظ التنبيهات.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حفظ التنبيهات.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function persistSlides() {
    setBusy(true);
    setNotice(null);
    try {
      await saveHomepageSlides(slides);
      setNotice({ type: 'success', text: 'تم حفظ منشورات القسم.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حفظ المنشورات.',
      });
    } finally {
      setBusy(false);
    }
  }

  function addAnnouncement() {
    const announcement = { id: newId('notice'), message: '', active: true };
    setAnnouncements((current) => [announcement, ...current]);
    setExpandedAnnouncementId(announcement.id);
  }

  function addSlide() {
    const slide = { id: newId('slide'), title: 'منشور جديد', url: '', content: '', active: true };
    setSlides((current) => [slide, ...current]);
    setExpandedSlideId(slide.id);
  }

  function updateSlide(id: string, patch: Partial<HomepageSlide>) {
    setSlides((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
    );
  }

  return (
    <section
      role="tabpanel"
      aria-label="إدارة التنبيهات وصور الصفحة الرئيسية"
      className="space-y-4"
    >
      {busy && <p className="text-sm text-muted-foreground">جارٍ العمل...</p>}
      {notice && (
        <p
          role="status"
          className={`rounded-md border px-5 py-4 text-base ${notice.type === 'success' ? 'border-success/25 bg-success-light text-success' : 'border-error/25 bg-error-light text-error'}`}
        >
          {notice.text}
        </p>
      )}

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            aria-expanded={expandedPanel === 'announcements'}
            aria-controls="announcements-admin-panel"
            onClick={() =>
              setExpandedPanel((current) => (current === 'announcements' ? null : 'announcements'))
            }
            className="flex min-h-16 min-w-0 flex-1 items-center justify-between gap-4 px-4 py-3 text-right transition-colors hover:bg-surface-muted/40"
          >
            <span className="flex min-w-0 items-center gap-3">
              <BellRing size={20} className="shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0">
                <span id="announcements-admin-title" className="block text-lg font-bold">
                  شريط التنبيهات
                </span>
                <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                  تظهر التنبيهات المفعّلة فوق الواجبات المنزلية.
                </span>
              </span>
            </span>
            <ChevronDown
              className={`size-5 shrink-0 text-primary transition-transform ${expandedPanel === 'announcements' ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          {expandedPanel === 'announcements' && (
            <div className="flex gap-2 px-4">
              <button
                type="button"
                onClick={addAnnouncement}
                aria-label="إضافة تنبيه"
                title="إضافة تنبيه"
                disabled={busy}
                className={controlButton}
              >
                <Plus size={19} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void persistAnnouncements()}
                aria-label="حفظ التنبيهات"
                title="حفظ التنبيهات"
                disabled={busy}
                className={primaryButton}
              >
                <Save size={19} aria-hidden="true" />
              </button>
            </div>
          )}
        </header>

        <div
          id="announcements-admin-panel"
          hidden={expandedPanel !== 'announcements'}
          className="border-t border-border px-4"
        >
          <div className="divide-y divide-border">
            {announcements.map((announcement) => {
              const isExpanded = expandedAnnouncementId === announcement.id;
              const detailsId = `${announcement.id}-admin-content`;
              return (
                <article key={announcement.id} className="py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      onClick={() => setExpandedAnnouncementId(isExpanded ? null : announcement.id)}
                      className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-3 text-right transition-colors hover:bg-surface-muted/35"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                        {announcement.message.trim() || 'تنبيه جديد'}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${announcement.active ? 'bg-success-light text-success' : 'bg-surface-muted text-muted-foreground'}`}
                      >
                        {announcement.active ? 'منشور' : 'متوقف'}
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-primary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnnouncements((current) =>
                          current.filter((entry) => entry.id !== announcement.id)
                        );
                        setExpandedAnnouncementId((current) =>
                          current === announcement.id ? null : current
                        );
                      }}
                      aria-label="حذف التنبيه"
                      title="حذف التنبيه"
                      disabled={busy}
                      className={dangerButton}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <div
                    id={detailsId}
                    hidden={!isExpanded}
                    className="grid gap-4 px-3 pb-3 pt-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <label className={labelClassName}>
                      نص التنبيه
                      <textarea
                        rows={2}
                        maxLength={1000}
                        className={inputClassName}
                        value={announcement.message}
                        onChange={(event) =>
                          setAnnouncements((current) =>
                            current.map((entry) =>
                              entry.id === announcement.id
                                ? { ...entry, message: event.target.value }
                                : entry
                            )
                          )
                        }
                      />
                    </label>
                    <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground">
                      <input
                        type="checkbox"
                        className="size-5 accent-green-700"
                        checked={announcement.active}
                        onChange={(event) =>
                          setAnnouncements((current) =>
                            current.map((entry) =>
                              entry.id === announcement.id
                                ? { ...entry, active: event.target.checked }
                                : entry
                            )
                          )
                        }
                      />
                      نشر
                    </label>
                  </div>
                </article>
              );
            })}
            {announcements.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                لا توجد تنبيهات. أضف تنبيهاً ليظهر الشريط في الصفحة الرئيسية.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            aria-expanded={expandedPanel === 'slides'}
            aria-controls="homepage-slides-admin-panel"
            onClick={() => setExpandedPanel((current) => (current === 'slides' ? null : 'slides'))}
            className="flex min-h-16 min-w-0 flex-1 items-center justify-between gap-4 px-4 py-3 text-right transition-colors hover:bg-surface-muted/40"
          >
            <span className="flex min-w-0 items-center gap-3">
              <ImagePlus size={20} className="shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0">
                <span id="homepage-slides-admin-title" className="block text-lg font-bold">
                  منشورات القسم
                </span>
                <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                  أضف صورة و/أو نصاً مع أدوات تنسيق. اكتب نصاً أو أضف رابط صورة على الأقل.
                </span>
              </span>
            </span>
            <ChevronDown
              className={`size-5 shrink-0 text-primary transition-transform ${expandedPanel === 'slides' ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          {expandedPanel === 'slides' && (
            <div className="flex gap-2 px-4">
              <button
                type="button"
                onClick={addSlide}
                aria-label="إضافة منشور"
                title="إضافة منشور"
                disabled={busy}
                className={controlButton}
              >
                <Plus size={19} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void persistSlides()}
                aria-label="حفظ منشورات القسم"
                title="حفظ المنشورات"
                disabled={busy}
                className={primaryButton}
              >
                <Save size={19} aria-hidden="true" />
              </button>
            </div>
          )}
        </header>

        <div
          id="homepage-slides-admin-panel"
          hidden={expandedPanel !== 'slides'}
          className="border-t border-border px-4"
        >
          <div className="divide-y divide-border">
            {slides.map((slide) => {
              const isExpanded = expandedSlideId === slide.id;
              const detailsId = `${slide.id}-admin-content`;
              const fileId = getGoogleDriveFileId(slide.url);
              const hasImage = Boolean(fileId);
              const hasContent = Boolean(slide.content.trim());
              return (
                <article key={slide.id} className="py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      onClick={() => setExpandedSlideId(isExpanded ? null : slide.id)}
                      className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-3 text-right transition-colors hover:bg-surface-muted/35"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                        {slide.title || 'منشور جديد'}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        {hasImage && (
                          <span className="rounded-md bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            صورة
                          </span>
                        )}
                        {hasContent && (
                          <span className="rounded-md bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                            نص
                          </span>
                        )}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${slide.active ? 'bg-success-light text-success' : 'bg-surface-muted text-muted-foreground'}`}
                      >
                        {slide.active ? 'منشور' : 'متوقف'}
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-primary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSlides((current) => current.filter((entry) => entry.id !== slide.id));
                        setExpandedSlideId((current) => (current === slide.id ? null : current));
                      }}
                      aria-label={`حذف المنشور ${slide.title}`}
                      title="حذف المنشور"
                      disabled={busy}
                      className={dangerButton}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <div id={detailsId} hidden={!isExpanded} className="grid gap-4 px-3 pb-4 pt-2">
                    <div className="grid gap-4 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-end">
                      <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted/30 sm:size-20">
                        {hasImage ? (
                          <Image
                            src={getGoogleDriveImageUrl(slide.url)}
                            alt={slide.title}
                            fill
                            unoptimized
                            sizes="96px"
                            className="object-contain"
                          />
                        ) : (
                          <ImagePlus
                            size={25}
                            className="text-muted-foreground/50"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="grid gap-4">
                        <label className={labelClassName}>
                          عنوان المنشور
                          <input
                            className={inputClassName}
                            maxLength={300}
                            value={slide.title}
                            onChange={(event) =>
                              updateSlide(slide.id, { title: event.target.value })
                            }
                          />
                        </label>
                        <label className={labelClassName}>
                          رابط مشاركة Google Drive (اختياري)
                          <input
                            type="url"
                            className={inputClassName}
                            value={slide.url}
                            placeholder="https://drive.google.com/file/d/.../view"
                            onChange={(event) => updateSlide(slide.id, { url: event.target.value })}
                          />
                        </label>
                      </div>
                      <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground">
                        <input
                          type="checkbox"
                          className="size-5 accent-green-700"
                          checked={slide.active}
                          onChange={(event) =>
                            updateSlide(slide.id, { active: event.target.checked })
                          }
                        />
                        نشر
                      </label>
                    </div>

                    <label className={labelClassName}>
                      نص المنشور (اختياري)
                      <RichTextEditor
                        id={`${slide.id}-content-editor`}
                        value={slide.content}
                        onChange={(value) => updateSlide(slide.id, { content: value })}
                        placeholder="اكتب نص المنشور هنا... استخدم الأدوات أعلاه للتنسيق (عناوين، قوائم، عريض، روابط)"
                        rows={6}
                        maxLength={5000}
                        ariaLabel={`نص المنشور ${slide.title}`}
                      />
                    </label>

                    <p className="text-xs text-muted-foreground">
                      {hasImage && hasContent
                        ? 'سيُعرض المنشور جنباً إلى جنب: الصورة في جهة والنص في الجهة الأخرى.'
                        : hasImage
                          ? 'سيُعرض المنشور صورة فقط بعرض المنشور.'
                          : 'سيُعرض المنشور نصاً فقط بعرض المنشور.'}
                    </p>
                  </div>
                </article>
              );
            })}
            {slides.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                لا توجد منشورات. أضف منشوراً يحتوي صورة أو نصاً أو كليهما.
              </p>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
