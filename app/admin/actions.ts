"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  hasAdminAuthConfig,
  isAdminAuthenticated,
} from "../../lib/admin-auth";
import {
  getAssignments,
  getAnnouncements,
  getHomepageSlides,
  getLessons,
  getSupportingActivities,
  replaceAssignments,
  replaceAnnouncements,
  replaceHomepageSlides,
  replaceLessons,
  replaceSupportingActivities,
  type Announcement,
  type HomepageSlide,
  type SupportingActivity,
} from "../../lib/content-db";
import { getGoogleDriveFileId } from "../../lib/google-drive";

type Assignment = {
  id: string;
  name: string;
  assignedDate: string;
  submissionDate: string;
  link?: string;
  completed: boolean;
};

type LessonItem = {
  id: string;
  title: string;
  summary?: string;
  activities: string[];
  images: { src: string; alt: string }[];
  videos: { url: string; title?: string }[];
  pdfs: { url: string; title?: string }[];
};

type Lesson = {
  id: string;
  title: string;
  items: LessonItem[];
};

async function assertAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("انتهت جلسة الإدارة. سجّل الدخول مجدداً.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, label: string, maxLength = 10000) {
  if (typeof value !== "string" || value.length > maxLength) {
    throw new Error(`تحقق من حقل ${label}.`);
  }

  return value.trim();
}

function isValidWebUrl(value: string, allowHttp = false) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (allowHttp && url.protocol === "http:");
  } catch {
    return false;
  }
}

function normalizeAssignments(value: unknown): Assignment[] {
  if (!Array.isArray(value)) throw new Error("قائمة الواجبات غير صالحة.");

  return value.map((entry) => {
    if (!isRecord(entry)) throw new Error("بيانات أحد الواجبات غير صالحة.");

    const id = requiredText(entry.id, "معرّف الواجب", 120);
    const name = requiredText(entry.name, "اسم الواجب", 300);
    const assignedDate = requiredText(entry.assignedDate, "تاريخ التكليف", 10);
    const submissionDate = requiredText(entry.submissionDate, "تاريخ التقديم", 10);
    const link = requiredText(entry.link ?? "", "الرابط", 2000);

    if (!id || !name) throw new Error("يجب إدخال اسم لكل واجب.");
    if (assignedDate && !/^\d{4}-\d{2}-\d{2}$/.test(assignedDate)) {
      throw new Error("صيغة تاريخ التكليف غير صحيحة.");
    }
    if (submissionDate && !/^\d{4}-\d{2}-\d{2}$/.test(submissionDate)) {
      throw new Error("صيغة تاريخ التقديم غير صحيحة.");
    }
    if (link && !isValidWebUrl(link, true)) {
      throw new Error("رابط الواجب يجب أن يبدأ بـ http أو https.");
    }

    return { id, name, assignedDate, submissionDate, link, completed: entry.completed === true };
  });
}

function normalizeSupportingActivities(value: unknown): SupportingActivity[] {
  if (!Array.isArray(value)) throw new Error("قائمة الأنشطة الداعمة غير صالحة.");

  return value.map((entry) => {
    if (!isRecord(entry)) throw new Error("بيانات أحد الأنشطة غير صالحة.");

    const id = requiredText(entry.id, "معرّف النشاط", 120);
    const name = requiredText(entry.name, "اسم النشاط", 300);
    const link = requiredText(entry.link ?? "", "الرابط", 2000);
    if (!id || !name) throw new Error("يجب إدخال اسم لكل نشاط.");
    if (link && !isValidWebUrl(link, true)) {
      throw new Error("رابط النشاط يجب أن يبدأ بـ http أو https.");
    }

    return { id, name, link, completed: entry.completed === true };
  });
}

function normalizeAnnouncements(value: unknown): Announcement[] {
  if (!Array.isArray(value)) throw new Error("قائمة التنبيهات غير صالحة.");

  return value.map((entry) => {
    if (!isRecord(entry)) throw new Error("بيانات أحد التنبيهات غير صالحة.");
    const id = requiredText(entry.id, "معرّف التنبيه", 120);
    const message = requiredText(entry.message, "نص التنبيه", 1000);
    if (!id || !message) throw new Error("يجب كتابة نص لكل تنبيه.");
    return { id, message, active: entry.active === true };
  });
}

function normalizeHomepageSlides(value: unknown): HomepageSlide[] {
  if (!Array.isArray(value)) throw new Error("قائمة صور الصفحة الرئيسية غير صالحة.");

  return value.map((entry) => {
    if (!isRecord(entry)) throw new Error("بيانات إحدى الصور غير صالحة.");
    const id = requiredText(entry.id, "معرّف الصورة", 120);
    const title = requiredText(entry.title, "عنوان الصورة", 300);
    const url = requiredText(entry.url, "رابط Google Drive", 2000);
    if (!id || !title || !url) throw new Error("أدخل عنواناً ورابطاً لكل صورة.");
    if (!isValidWebUrl(url) || !getGoogleDriveFileId(url)) {
      throw new Error("أدخل رابط مشاركة صالحاً لملف صورة على Google Drive.");
    }
    return { id, title, url, active: entry.active === true };
  });
}

function normalizeLessons(value: unknown): Lesson[] {
  if (!Array.isArray(value)) throw new Error("قائمة الدروس غير صالحة.");

  return value.map((entry) => {
    if (!isRecord(entry) || !Array.isArray(entry.items)) {
      throw new Error("بيانات أحد الدروس غير صالحة.");
    }

    const id = requiredText(entry.id, "معرّف الدرس", 120);
    const title = requiredText(entry.title, "عنوان الدرس", 300);
    if (!id || !title) throw new Error("يجب إدخال عنوان لكل درس.");

    const items = entry.items.map((item) => {
      if (!isRecord(item)) throw new Error("بيانات محتوى الدرس غير صالحة.");

      const itemId = requiredText(item.id, "معرّف المحتوى", 120);
      const itemTitle = requiredText(item.title, "عنوان المحتوى", 300);
      if (!itemId || !itemTitle) throw new Error("يجب إدخال عنوان لكل محتوى.");

      const activitiesValue = item.activities ?? [];
      const imagesValue = item.images ?? [];
      const videosValue = item.videos ?? [];
      const pdfsValue = item.pdfs ?? [];
      if (!Array.isArray(activitiesValue) || !Array.isArray(imagesValue) || !Array.isArray(videosValue) || !Array.isArray(pdfsValue)) {
        throw new Error("تحقق من الأنشطة والصور والفيديوهات.");
      }

      const activities = activitiesValue.map((activity) =>
        requiredText(activity, "النشاط", 2000),
      ).filter(Boolean);
      const images = imagesValue.map((image) => {
        if (!isRecord(image)) throw new Error("بيانات الصورة غير صالحة.");
        const src = requiredText(image.src, "مسار الصورة", 2000);
        const alt = requiredText(image.alt ?? "", "وصف الصورة", 500);
        const isLocalPath = src.startsWith("/") && !src.startsWith("//") && !src.includes("..");
        if (!isLocalPath && !isValidWebUrl(src)) {
          throw new Error("الصورة يجب أن تكون مسارًا محليًا أو رابط https.");
        }
        return { src, alt };
      });
      const videos = videosValue.map((video) => {
        if (!isRecord(video)) throw new Error("بيانات الفيديو غير صالحة.");
        const url = requiredText(video.url, "رابط الفيديو", 2000);
        const videoTitle = requiredText(video.title ?? "", "عنوان الفيديو", 300);
        if (!isValidWebUrl(url)) throw new Error("رابط الفيديو يجب أن يبدأ بـ https.");
        return { url, title: videoTitle };
      });
      const pdfs = pdfsValue.flatMap((pdf) => {
        if (!isRecord(pdf)) throw new Error("بيانات ملف PDF غير صالحة.");
        const url = requiredText(pdf.url, "رابط PDF", 2000);
        if (!url) return [];
        const pdfTitle = requiredText(pdf.title ?? "", "عنوان PDF", 300);
        if (!isValidWebUrl(url)) throw new Error("رابط PDF يجب أن يبدأ بـ https.");
        return [{ url, title: pdfTitle }];
      });

      return {
        id: itemId,
        title: itemTitle,
        summary: requiredText(item.summary ?? "", "الخلاصة", 10000),
        activities,
        images,
        videos,
        pdfs,
      };
    });

    return { id, title, items };
  });
}

export async function login(formData: FormData) {
  if (!hasAdminAuthConfig()) redirect("/admin?error=setup");
  if (!(await createAdminSession(formData.get("password")))) redirect("/admin?error=invalid");
  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin");
}

export async function loadAssignments() {
  await assertAdmin();
  return await getAssignments();
}

export async function saveAssignments(value: unknown) {
  await assertAdmin();
  const assignments = normalizeAssignments(value);
  await replaceAssignments(assignments);
  revalidatePath("/");
}

export async function loadSupportingActivities() {
  await assertAdmin();
  return await getSupportingActivities();
}

export async function saveSupportingActivities(value: unknown) {
  await assertAdmin();
  const activities = normalizeSupportingActivities(value);
  await replaceSupportingActivities(activities);
  revalidatePath("/");
}

export async function loadAnnouncements() {
  await assertAdmin();
  return await getAnnouncements();
}

export async function saveAnnouncements(value: unknown) {
  await assertAdmin();
  const announcements = normalizeAnnouncements(value);
  await replaceAnnouncements(announcements);
  revalidatePath("/");
}

export async function loadHomepageSlides() {
  await assertAdmin();
  return await getHomepageSlides();
}

export async function saveHomepageSlides(value: unknown) {
  await assertAdmin();
  const slides = normalizeHomepageSlides(value);
  await replaceHomepageSlides(slides);
  revalidatePath("/");
}

export async function loadLessons(subjectId: string) {
  await assertAdmin();
  return await getLessons(subjectId);
}

export async function saveLessons(subjectId: string, value: unknown) {
  await assertAdmin();
  const lessons = normalizeLessons(value);
  await replaceLessons(subjectId, lessons);
  revalidatePath("/lessons");
}