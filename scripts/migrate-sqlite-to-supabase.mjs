import { createClient } from "@supabase/supabase-js";
import Database from "better-sqlite3";
import { loadEnvConfig } from "@next/env";
import { join } from "node:path";

loadEnvConfig(process.cwd());

if (!process.argv.includes("--confirm")) {
  throw new Error("هذا الأمر يستبدل بيانات الواجبات والدروس في Supabase. أعد تشغيله مع --confirm للمتابعة.");
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("أضف SUPABASE_URL وSUPABASE_SERVICE_ROLE_KEY إلى .env.local أو متغيرات البيئة.");
}

const subjects = [
  "islamic-education",
  "arabic",
  "mathematics",
  "history",
  "geography",
  "civic-education",
  "science",
  "memorization",
];
const sqlitePath = join(process.cwd(), "data", "content.sqlite");
const database = new Database(sqlitePath, { readonly: true, fileMustExist: true });
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function groupRows(rows, keySelector) {
  const groups = new Map();
  for (const row of rows) {
    const key = keySelector(row);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  return groups;
}

function itemKey(row) {
  return JSON.stringify([row.subject_id, row.lesson_id, row.item_id]);
}

async function migrate() {
  const assignments = database.prepare(`
    select id, name, assigned_date, submission_date, link, completed
    from assignments order by position
  `).all().map((row) => ({
    id: row.id,
    name: row.name,
    assignedDate: row.assigned_date,
    submissionDate: row.submission_date,
    link: row.link || undefined,
    completed: row.completed === 1,
  }));

  const lessonRows = database.prepare(`
    select subject_id, id, title from lessons order by subject_id, position
  `).all();
  const itemRows = database.prepare(`
    select subject_id, lesson_id, id, title, summary
    from lesson_items order by subject_id, lesson_id, position
  `).all();
  const activityRows = database.prepare(`
    select subject_id, lesson_id, item_id, text
    from lesson_activities order by subject_id, lesson_id, item_id, position
  `).all();
  const imageRows = database.prepare(`
    select subject_id, lesson_id, item_id, src, alt
    from lesson_images order by subject_id, lesson_id, item_id, position
  `).all();
  const videoRows = database.prepare(`
    select subject_id, lesson_id, item_id, url, title
    from lesson_videos order by subject_id, lesson_id, item_id, position
  `).all();

  const itemsByLesson = groupRows(itemRows, (row) => JSON.stringify([row.subject_id, row.lesson_id]));
  const activitiesByItem = groupRows(activityRows, itemKey);
  const imagesByItem = groupRows(imageRows, itemKey);
  const videosByItem = groupRows(videoRows, itemKey);
  const lessonsBySubject = groupRows(lessonRows, (row) => row.subject_id);

  const { error: assignmentError } = await supabase.rpc("replace_assignments", {
    p_assignments: assignments,
  });
  if (assignmentError) throw assignmentError;

  for (const subjectId of subjects) {
    const lessons = (lessonsBySubject.get(subjectId) ?? []).map((lesson) => {
      const key = JSON.stringify([lesson.subject_id, lesson.id]);
      const items = (itemsByLesson.get(key) ?? []).map((item) => {
        const key = itemKey({
          subject_id: item.subject_id,
          lesson_id: item.lesson_id,
          item_id: item.id,
        });
        return {
          id: item.id,
          title: item.title,
          summary: item.summary || "",
          activities: (activitiesByItem.get(key) ?? []).map(({ text }) => text),
          images: (imagesByItem.get(key) ?? []).map(({ src, alt }) => ({ src, alt })),
          videos: (videosByItem.get(key) ?? []).map(({ url, title }) => ({ url, title })),
        };
      });
      return { id: lesson.id, title: lesson.title, items };
    });

    const { error } = await supabase.rpc("replace_lessons", {
      p_subject_id: subjectId,
      p_lessons: lessons,
    });
    if (error) throw error;
    console.log(`${subjectId}: ${lessons.length} درس`);
  }

  console.log(`تم نقل ${assignments.length} واجباً وبيانات الدروس إلى Supabase.`);
}

try {
  await migrate();
} finally {
  database.close();
}