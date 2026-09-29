import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Assignment = {
  id: string;
  name: string;
  assignedDate: string;
  submissionDate: string;
  link?: string;
  completed: boolean;
};

export type LessonItem = {
  id: string;
  title: string;
  summary?: string;
  activities: string[];
  images: { src: string; alt: string }[];
  videos: { url: string; title?: string }[];
  pdfs: { url: string; title?: string }[];
};

export type Lesson = {
  id: string;
  title: string;
  items: LessonItem[];
};

export const subjectFiles: Record<string, string> = {
  "islamic-education": "islamic-education.json",
  arabic: "arabic.json",
  mathematics: "mathematics.json",
  history: "history.json",
  geography: "geography.json",
  "civic-education": "civic-education.json",
  science: "science.json",
  memorization: "memorization.json",
};

type AssignmentRow = Omit<Assignment, "assignedDate" | "submissionDate" | "link" | "completed"> & {
  assigned_date: string;
  submission_date: string;
  link: string;
  completed: boolean | number;
};

type LessonRow = {
  subject_id: string;
  id: string;
  title: string;
};

type LessonItemRow = {
  subject_id: string;
  lesson_id: string;
  id: string;
  title: string;
  summary: string;
};

type ActivityRow = {
  subject_id: string;
  lesson_id: string;
  item_id: string;
  text: string;
};

type ImageRow = {
  subject_id: string;
  lesson_id: string;
  item_id: string;
  src: string;
  alt: string;
};

type VideoRow = {
  subject_id: string;
  lesson_id: string;
  item_id: string;
  url: string;
  title: string;
};

type PdfRow = {
  subject_id: string;
  lesson_id: string;
  item_id: string;
  url: string;
  title: string;
};

let client: SupabaseClient | undefined;

function getDatabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("أضف SUPABASE_URL وSUPABASE_SERVICE_ROLE_KEY إلى متغيرات البيئة.");
  }

  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(`تعذر الوصول إلى Supabase: ${error.message}`);
}

function isMissingPdfTable(error: { code?: string; message: string } | null) {
  return error?.code === "PGRST205" ||
    error?.message.includes("Could not find the table 'public.lesson_pdfs' in the schema cache") === true;
}

const pdfSchemaSetupMessage = "جدول ملفات PDF غير جاهز في Supabase. شغّل تحديث supabase/schema.sql، ثم أعد تحميل مخطط PostgREST إذا استمر الخطأ.";

function lessonKey(subjectId: string, lessonId: string) {
  return JSON.stringify([subjectId, lessonId]);
}

function itemKey(subjectId: string, lessonId: string, itemId: string) {
  return JSON.stringify([subjectId, lessonId, itemId]);
}

function groupRows<Row>(rows: Row[], keyFor: (row: Row) => string) {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = keyFor(row);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  return groups;
}

async function loadLessons(subjectIds: string[]) {
  const database = getDatabase();
  const [lessonsResult, itemsResult, activitiesResult, imagesResult, videosResult, pdfsResult] = await Promise.all([
    database.from("lessons").select("subject_id, id, title").in("subject_id", subjectIds).order("position"),
    database.from("lesson_items").select("subject_id, lesson_id, id, title, summary").in("subject_id", subjectIds).order("position"),
    database.from("lesson_activities").select("subject_id, lesson_id, item_id, text").in("subject_id", subjectIds).order("position"),
    database.from("lesson_images").select("subject_id, lesson_id, item_id, src, alt").in("subject_id", subjectIds).order("position"),
    database.from("lesson_videos").select("subject_id, lesson_id, item_id, url, title").in("subject_id", subjectIds).order("position"),
    database.from("lesson_pdfs").select("subject_id, lesson_id, item_id, url, title").in("subject_id", subjectIds).order("position"),
  ]);

  throwIfError(lessonsResult.error);
  throwIfError(itemsResult.error);
  throwIfError(activitiesResult.error);
  throwIfError(imagesResult.error);
  throwIfError(videosResult.error);
  if (pdfsResult.error && !isMissingPdfTable(pdfsResult.error)) {
    throwIfError(pdfsResult.error);
  }

  const lessonRows = (lessonsResult.data ?? []) as LessonRow[];
  const itemRows = (itemsResult.data ?? []) as LessonItemRow[];
  const activityRows = (activitiesResult.data ?? []) as ActivityRow[];
  const imageRows = (imagesResult.data ?? []) as ImageRow[];
  const videoRows = (videosResult.data ?? []) as VideoRow[];
  const pdfRows = (pdfsResult.error ? [] : pdfsResult.data ?? []) as PdfRow[];
  const itemsByLesson = groupRows(itemRows, (row) => lessonKey(row.subject_id, row.lesson_id));
  const activitiesByItem = groupRows(activityRows, (row) => itemKey(row.subject_id, row.lesson_id, row.item_id));
  const imagesByItem = groupRows(imageRows, (row) => itemKey(row.subject_id, row.lesson_id, row.item_id));
  const videosByItem = groupRows(videoRows, (row) => itemKey(row.subject_id, row.lesson_id, row.item_id));
  const pdfsByItem = groupRows(pdfRows, (row) => itemKey(row.subject_id, row.lesson_id, row.item_id));
  const lessonsBySubject = Object.fromEntries(
    subjectIds.map((subjectId) => [subjectId, { lessons: [] as Lesson[] }]),
  );

  for (const lesson of lessonRows) {
    const items = (itemsByLesson.get(lessonKey(lesson.subject_id, lesson.id)) ?? []).map((item) => {
      const key = itemKey(item.subject_id, item.lesson_id, item.id);
      return {
        id: item.id,
        title: item.title,
        summary: item.summary || undefined,
        activities: (activitiesByItem.get(key) ?? []).map(({ text }) => text),
        images: (imagesByItem.get(key) ?? []).map(({ src, alt }) => ({ src, alt })),
        videos: (videosByItem.get(key) ?? []).map(({ url, title }) => ({ url, title: title || undefined })),
        pdfs: (pdfsByItem.get(key) ?? []).map(({ url, title }) => ({ url, title: title || undefined })),
      };
    });
    lessonsBySubject[lesson.subject_id]?.lessons.push({ id: lesson.id, title: lesson.title, items });
  }

  return lessonsBySubject;
}

export async function getAssignments(): Promise<Assignment[]> {
  const { data, error } = await getDatabase()
    .from("assignments")
    .select("id, name, assigned_date, submission_date, link, completed")
    .order("position");
  throwIfError(error);

  return ((data ?? []) as AssignmentRow[]).map((assignment) => ({
    id: assignment.id,
    name: assignment.name,
    assignedDate: assignment.assigned_date,
    submissionDate: assignment.submission_date,
    link: assignment.link || undefined,
    completed: assignment.completed === true || assignment.completed === 1,
  }));
}

export async function replaceAssignments(assignments: Assignment[]): Promise<void> {
  const { error } = await getDatabase().rpc("replace_assignments", {
    p_assignments: assignments,
  });
  throwIfError(error);
}

export async function getLessons(subjectId: string): Promise<Lesson[]> {
  if (!(subjectId in subjectFiles)) throw new Error("المادة المحددة غير معروفة.");
  const result = await loadLessons([subjectId]);
  return result[subjectId].lessons;
}

export async function getAllLessons(): Promise<Record<string, { lessons: Lesson[] }>> {
  return loadLessons(Object.keys(subjectFiles));
}

export async function replaceLessons(subjectId: string, lessons: Lesson[]): Promise<void> {
  if (!(subjectId in subjectFiles)) throw new Error("المادة المحددة غير معروفة.");

  if (lessons.some((lesson) => lesson.items.some((item) => item.pdfs.length > 0))) {
    const { error: pdfTableError } = await getDatabase()
      .from("lesson_pdfs")
      .select("item_id")
      .limit(0);
    if (isMissingPdfTable(pdfTableError)) throw new Error(pdfSchemaSetupMessage);
    throwIfError(pdfTableError);
  }

  const { error } = await getDatabase().rpc("replace_lessons", {
    p_subject_id: subjectId,
    p_lessons: lessons,
  });
  throwIfError(error);
}