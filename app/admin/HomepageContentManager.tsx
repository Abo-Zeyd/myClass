"use client";

import Image from "next/image";
import { BellRing, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getGoogleDriveFileId, getGoogleDriveImageUrl } from "../../lib/google-drive";
import type { Announcement, HomepageSlide } from "../../lib/content-db";
import {
  loadAnnouncements,
  loadHomepageSlides,
  saveAnnouncements,
  saveHomepageSlides,
} from "./actions";

const inputClassName = "w-full rounded-md border border-border bg-surface px-3 py-3 text-base font-normal leading-7 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClassName = "grid gap-2 text-sm font-medium text-foreground";
const controlButton = "inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton = "inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const dangerButton = "inline-flex size-11 shrink-0 items-center justify-center rounded-md text-red-800 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export default function HomepageContentManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([loadAnnouncements(), loadHomepageSlides()])
      .then(([loadedAnnouncements, loadedSlides]) => {
        if (!active) return;
        setAnnouncements(loadedAnnouncements);
        setSlides(loadedSlides);
      })
      .catch((error: unknown) => {
        if (active) setNotice({ type: "error", text: error instanceof Error ? error.message : "تعذر تحميل محتوى الصفحة الرئيسية." });
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
      setNotice({ type: "success", text: "تم حفظ التنبيهات." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "تعذر حفظ التنبيهات." });
    } finally {
      setBusy(false);
    }
  }

  async function persistSlides() {
    setBusy(true);
    setNotice(null);
    try {
      await saveHomepageSlides(slides);
      setNotice({ type: "success", text: "تم حفظ صور السلايدر." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "تعذر حفظ الصور." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section role="tabpanel" aria-label="إدارة التنبيهات وصور الصفحة الرئيسية" className="space-y-10">
      {busy && <p className="text-sm text-muted-foreground">جارٍ العمل...</p>}
      {notice && (
        <p role="status" className={`rounded-md border px-5 py-4 text-base ${notice.type === "success" ? "border-green-700/25 bg-green-50 text-green-900" : "border-red-700/25 bg-red-50 text-red-900"}`}>
          {notice.text}
        </p>
      )}

      <section aria-labelledby="announcements-admin-title" className="border-b border-border pb-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="announcements-admin-title" className="inline-flex items-center gap-2 text-xl font-bold"><BellRing size={20} aria-hidden="true" /> شريط التنبيهات</h2>
            <p className="mt-1 text-sm text-muted-foreground">تظهر التنبيهات المفعّلة فوق الواجبات المنزلية.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setAnnouncements((current) => [{ id: newId("notice"), message: "", active: true }, ...current])} aria-label="إضافة تنبيه" title="إضافة تنبيه" disabled={busy} className={controlButton}>
              <Plus size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => void persistAnnouncements()} aria-label="حفظ التنبيهات" title="حفظ التنبيهات" disabled={busy} className={primaryButton}>
              <Save size={19} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="divide-y divide-border">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="grid gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <label className={labelClassName}>
                نص التنبيه
                <textarea rows={2} maxLength={1000} className={inputClassName} value={announcement.message} onChange={(event) => setAnnouncements((current) => current.map((entry) => entry.id === announcement.id ? { ...entry, message: event.target.value } : entry))} />
              </label>
              <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" className="size-5 accent-green-700" checked={announcement.active} onChange={(event) => setAnnouncements((current) => current.map((entry) => entry.id === announcement.id ? { ...entry, active: event.target.checked } : entry))} />
                نشر
              </label>
              <button type="button" onClick={() => setAnnouncements((current) => current.filter((entry) => entry.id !== announcement.id))} aria-label="حذف التنبيه" title="حذف التنبيه" disabled={busy} className={dangerButton}>
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
          {announcements.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">لا توجد تنبيهات. أضف تنبيهاً ليظهر الشريط في الصفحة الرئيسية.</p>}
        </div>
      </section>

      <section aria-labelledby="homepage-slides-admin-title">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="homepage-slides-admin-title" className="inline-flex items-center gap-2 text-xl font-bold"><ImagePlus size={20} aria-hidden="true" /> صور منشورات القسم</h2>
            <p className="mt-1 text-sm text-muted-foreground">أضف رابط مشاركة لصورة من Google Drive، واجعل الملف متاحاً لمن لديه الرابط.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setSlides((current) => [{ id: newId("slide"), title: "صورة جديدة", url: "", active: true }, ...current])} aria-label="إضافة صورة" title="إضافة صورة" disabled={busy} className={controlButton}>
              <Plus size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => void persistSlides()} aria-label="حفظ صور السلايدر" title="حفظ الصور" disabled={busy} className={primaryButton}>
              <Save size={19} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="divide-y divide-border">
          {slides.map((slide) => {
            const fileId = getGoogleDriveFileId(slide.url);
            return (
              <div key={slide.id} className="grid gap-4 py-5 sm:grid-cols-[6rem_minmax(0,1fr)_auto_auto] sm:items-end">
                <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted/30 sm:size-20">
                  {fileId ? (
                    <Image src={getGoogleDriveImageUrl(slide.url)} alt={slide.title} fill unoptimized sizes="96px" className="object-contain" />
                  ) : (
                    <ImagePlus size={25} className="text-muted-foreground/50" aria-hidden="true" />
                  )}
                </div>
                <div className="grid gap-4">
                  <label className={labelClassName}>
                    عنوان الصورة
                    <input className={inputClassName} maxLength={300} value={slide.title} onChange={(event) => setSlides((current) => current.map((entry) => entry.id === slide.id ? { ...entry, title: event.target.value } : entry))} />
                  </label>
                  <label className={labelClassName}>
                    رابط مشاركة Google Drive
                    <input type="url" className={inputClassName} value={slide.url} placeholder="https://drive.google.com/file/d/.../view" onChange={(event) => setSlides((current) => current.map((entry) => entry.id === slide.id ? { ...entry, url: event.target.value } : entry))} />
                  </label>
                </div>
                <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" className="size-5 accent-green-700" checked={slide.active} onChange={(event) => setSlides((current) => current.map((entry) => entry.id === slide.id ? { ...entry, active: event.target.checked } : entry))} />
                  نشر
                </label>
                <button type="button" onClick={() => setSlides((current) => current.filter((entry) => entry.id !== slide.id))} aria-label={`حذف الصورة ${slide.title}`} title="حذف الصورة" disabled={busy} className={dangerButton}>
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            );
          })}
          {slides.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">لا توجد صور. أضف صورة مثل التوزيع الزمني لعرضها في السلايدر.</p>}
        </div>
      </section>
    </section>
  );
}