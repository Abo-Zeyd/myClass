import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Assignment = {
  id: string;
  name: string;
  assignedDate: string;
  submissionDate: string;
  link?: string;
  completed: boolean;
};

export type SupportingActivity = {
  id: string;
  name: string;
  link?: string;
  completed: boolean;
};

export type Announcement = {
  id: string;
  message: string;
  active: boolean;
};

export type HomepageSlide = {
  id: string;
  title: string;
  /** رابط صورة Google Drive (اختياري عند وجود نص فقط) */
  url: string;
  /** نص المنشور المنسق (اختياري عند وجود صورة فقط) */
  content: string;
  active: boolean;
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

export type LessonComment = {
  id: string;
  displayName: string;
  body: string;
  createdAt: string;
};

export type ManagedLessonComment = LessonComment & {
  subjectId: string;
  subjectTitle: string;
  lessonId: string;
  lessonTitle: string;
  itemId: string;
  itemTitle: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type HomepageComment = LessonComment & {
  status: 'pending' | 'approved' | 'rejected';
};

export const subjectFiles: Record<string, string> = {
  'islamic-education': 'islamic-education.json',
  arabic: 'arabic.json',
  mathematics: 'mathematics.json',
  history: 'history.json',
  geography: 'geography.json',
  'civic-education': 'civic-education.json',
  science: 'science.json',
  memorization: 'memorization.json',
};

type AssignmentRow = Omit<Assignment, 'assignedDate' | 'submissionDate' | 'link' | 'completed'> & {
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

type DatedVideoRow = VideoRow & {
  created_at: string;
};

type DatedImageRow = ImageRow & {
  created_at: string;
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
    throw new Error('أضف SUPABASE_URL وSUPABASE_SERVICE_ROLE_KEY إلى متغيرات البيئة.');
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
  return (
    error?.code === 'PGRST205' ||
    error?.message.includes("Could not find the table 'public.lesson_pdfs' in the schema cache") ===
      true
  );
}

const pdfSchemaSetupMessage =
  'جدول ملفات PDF غير جاهز في Supabase. شغّل تحديث supabase/schema.sql، ثم أعد تحميل مخطط PostgREST إذا استمر الخطأ.';

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
  const [lessonsResult, itemsResult, activitiesResult, imagesResult, videosResult, pdfsResult] =
    await Promise.all([
      database
        .from('lessons')
        .select('subject_id, id, title')
        .in('subject_id', subjectIds)
        .order('position'),
      database
        .from('lesson_items')
        .select('subject_id, lesson_id, id, title, summary')
        .in('subject_id', subjectIds)
        .order('position'),
      database
        .from('lesson_activities')
        .select('subject_id, lesson_id, item_id, text')
        .in('subject_id', subjectIds)
        .order('position'),
      database
        .from('lesson_images')
        .select('subject_id, lesson_id, item_id, src, alt')
        .in('subject_id', subjectIds)
        .order('position'),
      database
        .from('lesson_videos')
        .select('subject_id, lesson_id, item_id, url, title')
        .in('subject_id', subjectIds)
        .order('position'),
      database
        .from('lesson_pdfs')
        .select('subject_id, lesson_id, item_id, url, title')
        .in('subject_id', subjectIds)
        .order('position'),
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
  const pdfRows = (pdfsResult.error ? [] : (pdfsResult.data ?? [])) as PdfRow[];
  const itemsByLesson = groupRows(itemRows, (row) => lessonKey(row.subject_id, row.lesson_id));
  const activitiesByItem = groupRows(activityRows, (row) =>
    itemKey(row.subject_id, row.lesson_id, row.item_id)
  );
  const imagesByItem = groupRows(imageRows, (row) =>
    itemKey(row.subject_id, row.lesson_id, row.item_id)
  );
  const videosByItem = groupRows(videoRows, (row) =>
    itemKey(row.subject_id, row.lesson_id, row.item_id)
  );
  const pdfsByItem = groupRows(pdfRows, (row) =>
    itemKey(row.subject_id, row.lesson_id, row.item_id)
  );
  const lessonsBySubject = Object.fromEntries(
    subjectIds.map((subjectId) => [subjectId, { lessons: [] as Lesson[] }])
  );

  for (const lesson of lessonRows) {
    const items = (itemsByLesson.get(lessonKey(lesson.subject_id, lesson.id)) ?? []).map((item) => {
      const key = itemKey(item.subject_id, item.lesson_id, item.id);
      return {
        id: item.id,
        title: item.title,
        ...(item.summary ? { summary: item.summary } : {}),
        activities: (activitiesByItem.get(key) ?? []).map(({ text }) => text),
        images: (imagesByItem.get(key) ?? []).map(({ src, alt }) => ({ src, alt })),
        videos: (videosByItem.get(key) ?? []).map(({ url, title }) => ({
          url,
          ...(title ? { title } : {}),
        })),
        pdfs: (pdfsByItem.get(key) ?? []).map(({ url, title }) => ({
          url,
          ...(title ? { title } : {}),
        })),
      };
    });
    lessonsBySubject[lesson.subject_id]?.lessons.push({
      id: lesson.id,
      title: lesson.title,
      items,
    });
  }

  return lessonsBySubject;
}

export async function getAssignments(): Promise<Assignment[]> {
  const { data, error } = await getDatabase()
    .from('assignments')
    .select('id, name, assigned_date, submission_date, link, completed')
    .order('position');
  throwIfError(error);

  return ((data ?? []) as AssignmentRow[]).map((assignment) => ({
    id: assignment.id,
    name: assignment.name,
    assignedDate: assignment.assigned_date,
    submissionDate: assignment.submission_date,
    ...(assignment.link ? { link: assignment.link } : {}),
    completed: assignment.completed === true || assignment.completed === 1,
  }));
}

export async function replaceAssignments(assignments: Assignment[]): Promise<void> {
  const { error } = await getDatabase().rpc('replace_assignments', {
    p_assignments: assignments,
  });
  throwIfError(error);
}

export async function getSupportingActivities(): Promise<SupportingActivity[]> {
  const { data, error } = await getDatabase()
    .from('supporting_activities')
    .select('id, name, link, completed')
    .order('position');
  throwIfError(error);
  return (data ?? []).map((activity) => ({
    id: activity.id,
    name: activity.name,
    link: activity.link || undefined,
    completed: activity.completed === true,
  }));
}

export async function replaceSupportingActivities(activities: SupportingActivity[]): Promise<void> {
  const { error } = await getDatabase().rpc('replace_supporting_activities', {
    p_activities: activities,
  });
  throwIfError(error);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await getDatabase()
    .from('announcements')
    .select('id, message, active')
    .order('position');
  throwIfError(error);
  return (data ?? []).map((announcement) => ({
    id: announcement.id,
    message: announcement.message,
    active: announcement.active === true,
  }));
}

export async function replaceAnnouncements(announcements: Announcement[]): Promise<void> {
  const { error } = await getDatabase().rpc('replace_announcements', {
    p_announcements: announcements,
  });
  throwIfError(error);
}

export async function getHomepageSlides(): Promise<HomepageSlide[]> {
  const { data, error } = await getDatabase()
    .from('homepage_slides')
    .select('id, title, url, content, active')
    .order('position');
  throwIfError(error);
  return (data ?? []).map((slide) => ({
    id: slide.id,
    title: slide.title,
    url: slide.url ?? '',
    content: slide.content ?? '',
    active: slide.active === true,
  }));
}

export async function replaceHomepageSlides(slides: HomepageSlide[]): Promise<void> {
  const { error } = await getDatabase().rpc('replace_homepage_slides', {
    p_slides: slides,
  });
  throwIfError(error);
}

export async function getLessons(subjectId: string): Promise<Lesson[]> {
  if (!(subjectId in subjectFiles)) throw new Error('المادة المحددة غير معروفة.');
  const result = await loadLessons([subjectId]);
  return result[subjectId]?.lessons ?? [];
}

export async function getAllLessons(): Promise<Record<string, { lessons: Lesson[] }>> {
  return loadLessons(Object.keys(subjectFiles));
}

export type HomepageVideo = {
  id: string;
  subjectId: string;
  lessonId: string;
  title: string;
  url: string;
  lessonTitle: string;
};

export async function getLatestVideos(): Promise<HomepageVideo[]> {
  const database = getDatabase();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [allLessons, recentVideosResult, latestVideosResult] = await Promise.all([
    getAllLessons(),
    database
      .from('lesson_videos')
      .select('subject_id, lesson_id, item_id, url, title, created_at')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false }),
    database
      .from('lesson_videos')
      .select('subject_id, lesson_id, item_id, url, title, created_at')
      .order('created_at', { ascending: false })
      .limit(3),
  ]);
  throwIfError(recentVideosResult.error);
  throwIfError(latestVideosResult.error);

  const lessonsByItem = new Map(
    Object.entries(allLessons).flatMap(([subjectId, { lessons }]) =>
      lessons.flatMap((lesson) =>
        lesson.items.map(
          (item) =>
            [
              JSON.stringify([subjectId, lesson.id, item.id]),
              { lessonTitle: lesson.title, itemTitle: item.title },
            ] as const
        )
      )
    )
  );
  const videoRows = [
    ...((recentVideosResult.data ?? []) as DatedVideoRow[]),
    ...((latestVideosResult.data ?? []) as DatedVideoRow[]),
  ];
  const uniqueVideos = new Map(
    videoRows.map((video) => [
      JSON.stringify([video.subject_id, video.lesson_id, video.item_id, video.url]),
      video,
    ])
  );

  return [...uniqueVideos.values()]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .map((video) => {
      const lessonAndItem = lessonsByItem.get(
        JSON.stringify([video.subject_id, video.lesson_id, video.item_id])
      );
      const itemTitle = lessonAndItem?.itemTitle ?? '';
      const lessonTitle = lessonAndItem?.lessonTitle ?? '';

      return {
        id: JSON.stringify([video.subject_id, video.lesson_id, video.item_id, video.url]),
        subjectId: video.subject_id,
        lessonId: video.lesson_id,
        title: video.title || itemTitle || lessonTitle,
        url: video.url,
        lessonTitle: [lessonTitle, itemTitle].filter(Boolean).join(' • '),
      };
    });
}

export type HomepageMindMap = {
  id: string;
  subjectId: string;
  lessonId: string;
  title: string;
  src: string;
  lessonTitle: string;
};

export async function getLatestMindMaps(): Promise<HomepageMindMap[]> {
  const database = getDatabase();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [allLessons, recentImagesResult, latestImagesResult] = await Promise.all([
    getAllLessons(),
    database
      .from('lesson_images')
      .select('subject_id, lesson_id, item_id, src, alt, created_at')
      .ilike('alt', '%خريطة ذهنية%')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false }),
    database
      .from('lesson_images')
      .select('subject_id, lesson_id, item_id, src, alt, created_at')
      .ilike('alt', '%خريطة ذهنية%')
      .order('created_at', { ascending: false })
      .limit(3),
  ]);
  throwIfError(recentImagesResult.error);
  throwIfError(latestImagesResult.error);

  const lessonsByItem = new Map(
    Object.entries(allLessons).flatMap(([subjectId, { lessons }]) =>
      lessons.flatMap((lesson) =>
        lesson.items.map(
          (item) =>
            [
              JSON.stringify([subjectId, lesson.id, item.id]),
              { lessonTitle: lesson.title, itemTitle: item.title },
            ] as const
        )
      )
    )
  );
  const imageRows = [
    ...((recentImagesResult.data ?? []) as DatedImageRow[]),
    ...((latestImagesResult.data ?? []) as DatedImageRow[]),
  ];
  const uniqueImages = new Map(
    imageRows.map((image) => [
      JSON.stringify([image.subject_id, image.lesson_id, image.item_id, image.src]),
      image,
    ])
  );

  return [...uniqueImages.values()]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .map((image) => {
      const lessonAndItem = lessonsByItem.get(
        JSON.stringify([image.subject_id, image.lesson_id, image.item_id])
      );
      const lessonTitle = lessonAndItem?.lessonTitle ?? '';
      const itemTitle = lessonAndItem?.itemTitle ?? '';

      return {
        id: JSON.stringify([image.subject_id, image.lesson_id, image.item_id, image.src]),
        subjectId: image.subject_id,
        lessonId: image.lesson_id,
        title: itemTitle || lessonTitle || image.alt,
        src: image.src,
        lessonTitle: [lessonTitle, itemTitle].filter(Boolean).join(' • '),
      };
    });
}

export async function replaceLessons(subjectId: string, lessons: Lesson[]): Promise<void> {
  if (!(subjectId in subjectFiles)) throw new Error('المادة المحددة غير معروفة.');

  if (lessons.some((lesson) => lesson.items.some((item) => item.pdfs.length > 0))) {
    const { error: pdfTableError } = await getDatabase()
      .from('lesson_pdfs')
      .select('item_id')
      .limit(0);
    if (isMissingPdfTable(pdfTableError)) throw new Error(pdfSchemaSetupMessage);
    throwIfError(pdfTableError);
  }

  const { error } = await getDatabase().rpc('replace_lessons', {
    p_subject_id: subjectId,
    p_lessons: lessons,
  });
  throwIfError(error);
}

export async function lessonItemExists(
  subjectId: string,
  lessonId: string,
  itemId: string
): Promise<boolean> {
  const { data, error } = await getDatabase()
    .from('lesson_items')
    .select('id')
    .eq('subject_id', subjectId)
    .eq('lesson_id', lessonId)
    .eq('id', itemId)
    .maybeSingle();
  throwIfError(error);
  return data !== null;
}

export async function getLessonComments(
  subjectId: string,
  lessonId: string,
  itemId: string
): Promise<LessonComment[]> {
  const { data, error } = await getDatabase()
    .from('lesson_comments')
    .select('id, display_name, body, created_at')
    .eq('subject_id', subjectId)
    .eq('lesson_id', lessonId)
    .eq('item_id', itemId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(100);
  throwIfError(error);

  return (data ?? []).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function insertLessonComment(
  subjectId: string,
  lessonId: string,
  itemId: string,
  displayName: string,
  body: string
): Promise<LessonComment> {
  const { data, error } = await getDatabase()
    .from('lesson_comments')
    .insert({
      subject_id: subjectId,
      lesson_id: lessonId,
      item_id: itemId,
      display_name: displayName,
      body,
    })
    .select('id, display_name, body, created_at')
    .single();
  throwIfError(error);
  if (!data) throw new Error('تعذر حفظ التعليق.');

  return {
    id: data.id,
    displayName: data.display_name,
    body: data.body,
    createdAt: data.created_at,
  };
}

export async function getLessonCommentsForAdmin(): Promise<ManagedLessonComment[]> {
  const database = getDatabase();
  const [commentsResult, lessonsResult, itemsResult] = await Promise.all([
    database
      .from('lesson_comments')
      .select('id, subject_id, lesson_id, item_id, display_name, body, status, created_at')
      .order('created_at', { ascending: false })
      .limit(1000),
    database.from('lessons').select('subject_id, id, title'),
    database.from('lesson_items').select('subject_id, lesson_id, id, title'),
  ]);
  throwIfError(commentsResult.error);
  throwIfError(lessonsResult.error);
  throwIfError(itemsResult.error);

  const subjectTitles: Record<string, string> = {
    'islamic-education': 'التربية الإسلامية',
    arabic: 'اللغة العربية',
    mathematics: 'الرياضيات',
    history: 'التاريخ',
    geography: 'الجغرافيا',
    'civic-education': 'التربية المدنية',
    science: 'التربية العلمية',
    memorization: 'المحفوظات',
  };
  const lessonTitles = new Map(
    (lessonsResult.data ?? []).map((lesson) => [
      lessonKey(lesson.subject_id, lesson.id),
      lesson.title,
    ])
  );
  const itemTitles = new Map(
    (itemsResult.data ?? []).map((item) => [
      itemKey(item.subject_id, item.lesson_id, item.id),
      item.title,
    ])
  );

  return (commentsResult.data ?? []).map((comment) => ({
    id: comment.id,
    displayName: comment.display_name,
    body: comment.body,
    createdAt: comment.created_at,
    subjectId: comment.subject_id,
    subjectTitle: subjectTitles[comment.subject_id] ?? comment.subject_id,
    lessonId: comment.lesson_id,
    lessonTitle:
      lessonTitles.get(lessonKey(comment.subject_id, comment.lesson_id)) ?? comment.lesson_id,
    itemId: comment.item_id,
    itemTitle:
      itemTitles.get(itemKey(comment.subject_id, comment.lesson_id, comment.item_id)) ??
      comment.item_id,
    status: comment.status as ManagedLessonComment['status'],
  }));
}

export async function updateLessonComment(
  id: string,
  displayName: string,
  body: string
): Promise<void> {
  const { error } = await getDatabase()
    .from('lesson_comments')
    .update({ display_name: displayName, body })
    .eq('id', id);
  throwIfError(error);
}

export async function deleteLessonComment(id: string): Promise<void> {
  const { error } = await getDatabase().from('lesson_comments').delete().eq('id', id);
  throwIfError(error);
}

function mapHomepageComment(row: {
  id: string;
  display_name: string;
  body: string;
  status: HomepageComment['status'];
  created_at: string;
}): HomepageComment {
  return {
    id: row.id,
    displayName: row.display_name,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getHomepageComments(): Promise<HomepageComment[]> {
  const { data, error } = await getDatabase()
    .from('homepage_comments')
    .select('id, display_name, body, status, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(100);
  throwIfError(error);
  return (data ?? []).map(mapHomepageComment);
}

export async function getHomepageCommentsForAdmin(): Promise<HomepageComment[]> {
  const { data, error } = await getDatabase()
    .from('homepage_comments')
    .select('id, display_name, body, status, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);
  throwIfError(error);
  return (data ?? []).map(mapHomepageComment);
}

export async function getUnreadHomepageCommentsForAdmin(): Promise<HomepageComment[]> {
  const { data, error } = await getDatabase()
    .from('homepage_comments')
    .select('id, display_name, body, status, created_at')
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(1000);
  throwIfError(error);
  return (data ?? []).map(mapHomepageComment);
}

export async function getUnreadHomepageCommentCount(): Promise<number> {
  const { count, error } = await getDatabase()
    .from('homepage_comments')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null);
  throwIfError(error);
  return count ?? 0;
}

export async function markHomepageCommentsAsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const { error } = await getDatabase()
    .from('homepage_comments')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids)
    .is('read_at', null);
  throwIfError(error);
}

export async function insertHomepageComment(
  displayName: string,
  body: string
): Promise<HomepageComment> {
  const { data, error } = await getDatabase()
    .from('homepage_comments')
    .insert({ display_name: displayName, body })
    .select('id, display_name, body, status, created_at')
    .single();
  throwIfError(error);
  if (!data) throw new Error('تعذر حفظ التعليق.');
  return mapHomepageComment(data);
}

export async function updateHomepageComment(
  id: string,
  displayName: string,
  body: string
): Promise<void> {
  const { error } = await getDatabase()
    .from('homepage_comments')
    .update({ display_name: displayName, body })
    .eq('id', id);
  throwIfError(error);
}

export async function deleteHomepageComment(id: string): Promise<void> {
  const { error } = await getDatabase().from('homepage_comments').delete().eq('id', id);
  throwIfError(error);
}

export async function incrementVisitorCount(): Promise<number> {
  const { data, error } = await getDatabase().rpc('increment_visitor_count');
  throwIfError(error);
  return Number(data ?? 0);
}

export async function getVisitorCount(): Promise<number> {
  const { data, error } = await getDatabase()
    .from('metadata')
    .select('value')
    .eq('key', 'visitor_count')
    .maybeSingle();
  throwIfError(error);
  return Number(data?.value ?? 0);
}

/* ============================================================================
   بلاغات الأخطاء
   ========================================================================== */

export type BugReportStatus = 'pending' | 'reviewing' | 'resolved' | 'ignored';

export type BugReport = {
  id: string;
  displayName: string;
  category: string;
  body: string;
  pageUrl: string;
  status: BugReportStatus;
  adminNote: string;
  createdAt: string;
};

type BugReportRow = {
  id: string;
  display_name: string | null;
  category: string | null;
  body: string;
  page_url: string | null;
  status: BugReportStatus;
  admin_note: string | null;
  created_at: string;
};

function mapBugReport(row: BugReportRow): BugReport {
  return {
    id: row.id,
    displayName: row.display_name ?? '',
    category: row.category ?? 'other',
    body: row.body,
    pageUrl: row.page_url ?? '',
    status: row.status,
    adminNote: row.admin_note ?? '',
    createdAt: row.created_at,
  };
}

export async function getBugReports(): Promise<BugReport[]> {
  const { data, error } = await getDatabase()
    .from('bug_reports')
    .select('id, display_name, category, body, page_url, status, admin_note, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  throwIfError(error);
  return ((data ?? []) as BugReportRow[]).map(mapBugReport);
}

export async function insertBugReport(input: {
  displayName: string;
  category: string;
  body: string;
  pageUrl: string;
}): Promise<BugReport> {
  const { data, error } = await getDatabase()
    .from('bug_reports')
    .insert({
      display_name: input.displayName,
      category: input.category,
      body: input.body,
      page_url: input.pageUrl,
    })
    .select('id, display_name, category, body, page_url, status, admin_note, created_at')
    .single();
  throwIfError(error);
  if (!data) throw new Error('تعذر حفظ البلاغ.');
  return mapBugReport(data as BugReportRow);
}

export async function updateBugReport(
  id: string,
  status: BugReportStatus,
  adminNote: string
): Promise<void> {
  const { error } = await getDatabase().rpc('update_bug_report', {
    p_id: id,
    p_status: status,
    p_admin_note: adminNote,
  });
  throwIfError(error);
}

export async function deleteBugReport(id: string): Promise<void> {
  const { error } = await getDatabase().rpc('delete_bug_report', { p_id: id });
  throwIfError(error);
}

/* ============================================================================
   التنبيهات الموحّدة (تعليقات رئيسية + دروس + بلاغات)
   ========================================================================== */

export type AdminNotificationSource = 'homepage_comment' | 'lesson_comment' | 'bug_report';

export type AdminNotification = {
  id: number;
  sourceType: AdminNotificationSource;
  sourceId: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type AdminNotificationRow = {
  id: number;
  source_type: AdminNotificationSource;
  source_id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

/** آخر التنبيهات — تبقى في القائمة بعد قراءتها ولا تُحذف */
export async function listAdminNotifications(limit = 10): Promise<AdminNotification[]> {
  const { data, error } = await getDatabase().rpc('list_admin_notifications', {
    p_limit: limit,
  });
  throwIfError(error);
  return ((data ?? []) as AdminNotificationRow[]).map((row) => ({
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  }));
}

/** عدد التنبيهات غير المقروءة — لشارة الجرس */
export async function countUnreadAdminNotifications(): Promise<number> {
  const { data, error } = await getDatabase().rpc('count_unread_admin_notifications');
  throwIfError(error);
  return Number(data ?? 0);
}

/** تعليم كمقروء — التنبيه يبقى في القائمة */
export async function markAdminNotificationsRead(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await getDatabase().rpc('mark_admin_notifications_read', { p_ids: ids });
  throwIfError(error);
}
