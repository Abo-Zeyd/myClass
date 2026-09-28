"use client";

import {
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  ImagePlus,
  LogOut,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAssignmentStatus } from "../assignment-status";
import { loadAssignments, loadLessons, logout, saveAssignments, saveLessons } from "./actions";

type Assignment = {
  id: string;
  name: string;
  assignedDate: string;
  submissionDate: string;
  link?: string;
  completed?: boolean;
};

type LessonItem = {
  id: string;
  title: string;
  summary?: string;
  activities: string[];
  images: { src: string; alt: string }[];
  videos: { url: string; title?: string }[];
};

type Lesson = {
  id: string;
  title: string;
  items: LessonItem[];
};

const subjects = [
  { id: "islamic-education", name: "التربية الإسلامية" },
  { id: "arabic", name: "اللغة العربية" },
  { id: "mathematics", name: "الرياضيات" },
  { id: "history", name: "التاريخ" },
  { id: "geography", name: "الجغرافيا" },
  { id: "civic-education", name: "التربية المدنية" },
  { id: "science", name: "التربية العلمية" },
  { id: "memorization", name: "المحفوظات" },
];

const inputClassName = "w-full rounded-md border border-border bg-surface px-3 py-3 text-base font-normal leading-7 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClassName = "grid gap-2 text-sm font-medium text-foreground";

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"assignments" | "lessons">("assignments");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState("arabic");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);

  useEffect(() => {
    let active = true;

    Promise.all([loadAssignments(), loadLessons("arabic")])
      .then(([loadedAssignments, loadedLessons]) => {
        if (!active) return;
        setAssignments(loadedAssignments);
        setLessons(loadedLessons);
      })
      .catch((error: unknown) => {
        if (active) setNotice({ type: "error", text: error instanceof Error ? error.message : "تعذر تحميل البيانات." });
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateAssignment(id: string, field: keyof Assignment, value: string) {
    setAssignments((current) => current.map((assignment) =>
      assignment.id === id ? { ...assignment, [field]: value } : assignment,
    ));
  }

  function updateAssignmentCompletion(id: string, completed: boolean) {
    setAssignments((current) => current.map((assignment) =>
      assignment.id === id ? { ...assignment, completed } : assignment,
    ));
  }

  function updateLessonTitle(value: string) {
    setLessons((current) => current.map((lesson) =>
      lesson.id === selectedLessonId ? { ...lesson, title: value } : lesson,
    ));
  }

  function updateSelectedItem(update: (item: LessonItem) => LessonItem) {
    setLessons((current) => current.map((lesson) =>
      lesson.id === selectedLessonId
        ? { ...lesson, items: lesson.items.map((item) => item.id === selectedItemId ? update(item) : item) }
        : lesson,
    ));
  }

  async function changeSubject(nextSubjectId: string) {
    setSubjectId(nextSubjectId);
    setSelectedLessonId("");
    setSelectedItemId("");
    setBusy(true);
    setNotice(null);

    try {
      const loadedLessons = await loadLessons(nextSubjectId);
      setLessons(loadedLessons);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "تعذر تحميل الدروس." });
    } finally {
      setBusy(false);
    }
  }

  async function persistAssignments() {
    setBusy(true);
    setNotice(null);
    try {
      await saveAssignments(assignments);
      setNotice({ type: "success", text: "تم حفظ الواجبات في Supabase." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "تعذر حفظ الواجبات." });
    } finally {
      setBusy(false);
    }
  }

  async function persistLessons() {
    setBusy(true);
    setNotice(null);
    try {
      await saveLessons(subjectId, lessons);
      setNotice({ type: "success", text: "تم حفظ دروس المادة في Supabase." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "تعذر حفظ الدروس." });
    } finally {
      setBusy(false);
    }
  }

  function addAssignment() {
    const assignment = {
      id: newId("homework"),
      name: "",
      assignedDate: "",
      submissionDate: "",
      link: "",
      completed: false,
    };
    setAssignments((current) => [assignment, ...current]);
    setExpandedAssignmentId(assignment.id);
  }

  function addLesson() {
    const lesson = { id: newId("lesson"), title: "درس جديد", items: [] };
    setLessons((current) => [...current, lesson]);
    setSelectedLessonId(lesson.id);
    setSelectedItemId("");
  }

  function addLessonItem() {
    if (!selectedLesson) return;
    const item: LessonItem = {
      id: newId("item"),
      title: "محتوى جديد",
      summary: "",
      activities: [],
      images: [],
      videos: [],
    };
    setLessons((current) => current.map((lesson) =>
      lesson.id === selectedLessonId ? { ...lesson, items: [...lesson.items, item] } : lesson,
    ));
    setSelectedItemId(item.id);
  }

  const controlButton = "inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50";
  const primaryButton = "inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
  const dangerButton = "inline-flex size-11 shrink-0 items-center justify-center rounded-md text-red-800 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <main className="admin-dashboard mx-auto w-full max-w-6xl px-4 py-8 text-base leading-relaxed sm:px-6" dir="rtl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="mb-1 text-sm font-semibold text-primary">إدارة المحتوى</p>
          <h1 className="text-3xl font-extrabold leading-tight text-foreground">لوحة المحتوى</h1>
        </div>
        <div className="flex items-center gap-4">
          {busy && <span className="text-sm text-muted-foreground">جارٍ العمل...</span>}
          <form action={logout}>
            <button className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-surface-muted" type="submit">
              <LogOut size={17} aria-hidden="true" />
              خروج
            </button>
          </form>
        </div>
      </header>

      <div className="mb-8 inline-flex gap-2 rounded-lg border border-border bg-surface-muted/60 p-2" role="tablist" aria-label="أقسام لوحة التحكم">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "assignments"}
          onClick={() => setActiveTab("assignments")}
          className={`inline-flex min-h-12 items-center gap-2 rounded-md px-6 text-base font-bold transition-colors ${activeTab === "assignments" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}
        >
          <ClipboardList size={17} aria-hidden="true" /> الواجبات
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "lessons"}
          onClick={() => setActiveTab("lessons")}
          className={`inline-flex min-h-12 items-center gap-2 rounded-md px-6 text-base font-bold transition-colors ${activeTab === "lessons" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}
        >
          <BookOpen size={17} aria-hidden="true" /> الدروس
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className={`mb-6 rounded-md border px-5 py-4 text-base ${notice.type === "success" ? "border-green-700/25 bg-green-50 text-green-900" : "border-red-700/25 bg-red-50 text-red-900"}`}
        >
          {notice.text}
        </p>
      )}

      {activeTab === "assignments" ? (
        <section role="tabpanel" aria-label="إدارة الواجبات">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold leading-snug">الواجبات المنزلية</h2>
            <div className="flex gap-3">
              <button type="button" onClick={addAssignment} aria-label="إضافة واجب" title="إضافة واجب" className={controlButton}>
                <Plus size={19} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => void persistAssignments()} aria-label="حفظ الواجبات" title="حفظ الواجبات" disabled={busy} className={primaryButton}>
                <Save size={19} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment) => {
              const isExpanded = expandedAssignmentId === assignment.id;
              const detailsId = `${assignment.id}-details`;
              const status = getAssignmentStatus(assignment.completed === true, assignment.submissionDate);

              return (
                <article key={assignment.id} className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() => setExpandedAssignmentId(isExpanded ? null : assignment.id)}
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-right text-lg font-semibold text-foreground transition-colors hover:bg-surface-muted/40"
                  >
                    <span className="min-w-0 flex-1 truncate">{assignment.name || "واجب جديد"}</span>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {status === "completed" ? "تم الإنجاز" : status === "overdue" ? "لم يتم - متأخر" : "لم يتم"}
                    </span>
                    <ChevronDown className={`size-5 shrink-0 text-primary transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                  <div id={detailsId} hidden={!isExpanded} className="grid gap-5 border-t border-border bg-surface-muted/25 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,2fr)_1fr_1fr_minmax(14rem,2fr)_auto] lg:items-end">
                    <label className={labelClassName}>
                      اسم الواجب
                      <input className={inputClassName} value={assignment.name} onChange={(event) => updateAssignment(assignment.id, "name", event.target.value)} />
                    </label>
                    <label className={labelClassName}>
                      تاريخ التكليف
                      <input type="date" className={inputClassName} value={assignment.assignedDate} onChange={(event) => updateAssignment(assignment.id, "assignedDate", event.target.value)} />
                    </label>
                    <label className={labelClassName}>
                      تاريخ التقديم
                      <input type="date" className={inputClassName} value={assignment.submissionDate} onChange={(event) => updateAssignment(assignment.id, "submissionDate", event.target.value)} />
                    </label>
                    <label className={labelClassName}>
                      رابط الواجب
                      <input type="url" className={inputClassName} value={assignment.link ?? ""} placeholder="https://..." onChange={(event) => updateAssignment(assignment.id, "link", event.target.value)} />
                    </label>
                    <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground">
                      <input type="checkbox" className="size-5 accent-green-700" checked={assignment.completed === true} onChange={(event) => updateAssignmentCompletion(assignment.id, event.target.checked)} />
                      تم الإنجاز
                    </label>
                    <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                      <button
                        type="button"
                        aria-label={`حفظ الواجب ${assignment.name || "الجديد"}`}
                        title="حفظ الواجب"
                        onClick={() => void persistAssignments()}
                        disabled={busy}
                        className={primaryButton}
                      >
                        <Save size={19} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`حذف الواجب ${assignment.name || "الجديد"}`}
                        title="حذف الواجب"
                        onClick={() => {
                          setAssignments((current) => current.filter((entry) => entry.id !== assignment.id));
                          setExpandedAssignmentId(null);
                        }}
                        className={dangerButton}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {assignments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">لا توجد واجبات.</p>}
          </div>
        </section>
      ) : (
        <section role="tabpanel" aria-label="إدارة الدروس">
          <div className="mb-6 grid gap-4 border-b border-border pb-6 sm:grid-cols-[minmax(14rem,1fr)_auto_auto] sm:items-end">
            <label className={labelClassName}>
              المادة
              <select className={inputClassName} value={subjectId} disabled={busy} onChange={(event) => void changeSubject(event.target.value)}>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <button type="button" onClick={addLesson} aria-label="إضافة درس" title="إضافة درس" disabled={busy} className={controlButton}>
              <Plus size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => void persistLessons()} aria-label="حفظ المادة" title="حفظ المادة" disabled={busy} className={primaryButton}>
              <Save size={19} aria-hidden="true" />
            </button>
          </div>

          {busy ? (
            <p className="border-y border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              جارٍ تحميل دروس المادة...
            </p>
          ) : lessons.length === 0 ? (
            <p className="border-y border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              لا يوجد درس محدد في هذه المادة. أضف درسًا للبدء.
            </p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => {
                const isLessonExpanded = selectedLessonId === lesson.id;
                const lessonDetailsId = `${lesson.id}-admin-details`;

                return (
                  <article key={lesson.id} className="overflow-hidden rounded-md border border-border bg-surface">
                    <button
                      type="button"
                      aria-expanded={isLessonExpanded}
                      aria-controls={lessonDetailsId}
                      onClick={() => {
                        setSelectedLessonId(isLessonExpanded ? "" : lesson.id);
                        setSelectedItemId("");
                      }}
                      className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-4 text-right text-lg font-semibold text-foreground transition-colors hover:bg-surface-muted/40"
                    >
                      <span className="min-w-0 flex-1 truncate">{lesson.title || "درس جديد"}</span>
                      <ChevronDown className={`size-5 shrink-0 text-primary transition-transform ${isLessonExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                    <div id={lessonDetailsId} hidden={!isLessonExpanded} className="space-y-6 border-t border-border bg-surface-muted/25 p-5 sm:p-6">
                      <div className="flex flex-wrap items-end gap-4">
                        <label className={`${labelClassName} min-w-64 flex-1`}>
                          عنوان الدرس
                          <input className={inputClassName} value={lesson.title} onChange={(event) => {
                            setSelectedLessonId(lesson.id);
                            updateLessonTitle(event.target.value);
                          }} />
                        </label>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => void persistLessons()} aria-label={`حفظ الدرس ${lesson.title}`} title="حفظ الدرس" disabled={busy} className={primaryButton}>
                            <Save size={19} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`حذف الدرس ${lesson.title}`}
                            title="حذف الدرس"
                            onClick={() => {
                              setLessons((current) => current.filter((entry) => entry.id !== lesson.id));
                              setSelectedLessonId("");
                              setSelectedItemId("");
                            }}
                            className={dangerButton}
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {lesson.items.map((item) => {
                          const isItemExpanded = isLessonExpanded && selectedItemId === item.id;
                          const itemDetailsId = `${item.id}-admin-details`;

                          return (
                            <article key={item.id} className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
                              <div className="flex items-center gap-2 p-1.5">
                                <button
                                  type="button"
                                  aria-expanded={isItemExpanded}
                                  aria-controls={itemDetailsId}
                                  onClick={() => {
                                    setSelectedLessonId(lesson.id);
                                    setSelectedItemId(isItemExpanded ? "" : item.id);
                                  }}
                                  className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-4 py-3 text-right text-base font-semibold text-foreground transition-colors hover:bg-surface-muted/35"
                                >
                                  <span className="min-w-0 flex-1 truncate">{item.title || "محتوى جديد"}</span>
                                  <ChevronDown className={`size-4 shrink-0 text-primary transition-transform ${isItemExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`حفظ المحتوى ${item.title || "الجديد"}`}
                                  title="حفظ المحتوى"
                                  onClick={() => void persistLessons()}
                                  disabled={busy}
                                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
                                >
                                  <Save size={18} aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`حذف المحتوى ${item.title || "الجديد"}`}
                                  title="حذف المحتوى"
                                  onClick={() => {
                                    setLessons((current) => current.map((entry) => entry.id === lesson.id
                                      ? { ...entry, items: entry.items.filter((lessonItem) => lessonItem.id !== item.id) }
                                      : entry));
                                    if (selectedItemId === item.id) setSelectedItemId("");
                                  }}
                                  className={`${dangerButton} size-10`}
                                >
                                  <Trash2 size={16} aria-hidden="true" />
                                </button>
                              </div>
                              {isItemExpanded && (
                                <div id={itemDetailsId} className="space-y-6 border-t border-border bg-surface-muted/20 p-5 sm:p-6">
                                  <label className={labelClassName}>
                                    عنوان المحتوى
                                    <input className={inputClassName} value={item.title} onChange={(event) => updateSelectedItem((current) => ({ ...current, title: event.target.value }))} />
                                  </label>
                                  <label className={labelClassName}>
                                    الخلاصة
                                    <textarea rows={4} className={inputClassName} value={item.summary ?? ""} onChange={(event) => updateSelectedItem((current) => ({ ...current, summary: event.target.value }))} />
                                  </label>
                                  <label className={labelClassName}>
                                    أنشطة وتمارين، نشاط في كل سطر
                                    <textarea rows={5} className={inputClassName} value={item.activities.join("\n")} onChange={(event) => updateSelectedItem((current) => ({ ...current, activities: event.target.value.split("\n") }))} />
                                  </label>

                                  <section className="space-y-3 rounded-md border border-border bg-surface p-4 sm:p-5">
                                    <div className="flex items-center justify-between gap-4">
                                      <h3 className="inline-flex items-center gap-2 text-lg font-semibold"><ImagePlus size={19} aria-hidden="true" /> الصور</h3>
                                      <button type="button" aria-label="إضافة صورة" title="إضافة صورة" onClick={() => updateSelectedItem((current) => ({ ...current, images: [...current.images, { src: "", alt: "" }] }))} className={controlButton}>
                                        <Plus size={19} aria-hidden="true" />
                                      </button>
                                    </div>
                                    <div className="divide-y divide-border rounded-md border border-border bg-background px-4">
                                      {item.images.map((image, index) => (
                                        <div key={`${item.id}-image-${index}`} className="grid gap-4 py-4 sm:grid-cols-[minmax(14rem,2fr)_minmax(12rem,1fr)_auto] sm:items-end">
                                          <label className={labelClassName}>
                                            مسار الصورة أو رابطها
                                            <input className={inputClassName} value={image.src} placeholder="/myClass/images/... أو https://..." onChange={(event) => updateSelectedItem((current) => ({ ...current, images: current.images.map((entry, currentIndex) => currentIndex === index ? { ...entry, src: event.target.value } : entry) }))} />
                                          </label>
                                          <label className={labelClassName}>
                                            وصف الصورة
                                            <input className={inputClassName} value={image.alt} onChange={(event) => updateSelectedItem((current) => ({ ...current, images: current.images.map((entry, currentIndex) => currentIndex === index ? { ...entry, alt: event.target.value } : entry) }))} />
                                          </label>
                                          <button type="button" aria-label="حذف الصورة" title="حذف الصورة" onClick={() => updateSelectedItem((current) => ({ ...current, images: current.images.filter((_, currentIndex) => currentIndex !== index) }))} className={dangerButton}>
                                            <Trash2 size={18} aria-hidden="true" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </section>

                                  <section className="space-y-3 rounded-md border border-border bg-surface p-4 sm:p-5">
                                    <div className="flex items-center justify-between gap-4">
                                      <h3 className="inline-flex items-center gap-2 text-lg font-semibold"><Video size={19} aria-hidden="true" /> الفيديوهات</h3>
                                      <button type="button" aria-label="إضافة فيديو" title="إضافة فيديو" onClick={() => updateSelectedItem((current) => ({ ...current, videos: [...current.videos, { url: "", title: "" }] }))} className={controlButton}>
                                        <Plus size={19} aria-hidden="true" />
                                      </button>
                                    </div>
                                    <div className="divide-y divide-border rounded-md border border-border bg-background px-4">
                                      {item.videos.map((video, index) => (
                                        <div key={`${item.id}-video-${index}`} className="grid gap-4 py-4 sm:grid-cols-[minmax(14rem,2fr)_minmax(12rem,1fr)_auto] sm:items-end">
                                          <label className={labelClassName}>
                                            رابط الفيديو
                                            <input type="url" className={inputClassName} value={video.url} placeholder="https://youtu.be/..." onChange={(event) => updateSelectedItem((current) => ({ ...current, videos: current.videos.map((entry, currentIndex) => currentIndex === index ? { ...entry, url: event.target.value } : entry) }))} />
                                          </label>
                                          <label className={labelClassName}>
                                            عنوان الفيديو
                                            <input className={inputClassName} value={video.title ?? ""} onChange={(event) => updateSelectedItem((current) => ({ ...current, videos: current.videos.map((entry, currentIndex) => currentIndex === index ? { ...entry, title: event.target.value } : entry) }))} />
                                          </label>
                                          <button type="button" aria-label="حذف الفيديو" title="حذف الفيديو" onClick={() => updateSelectedItem((current) => ({ ...current, videos: current.videos.filter((_, currentIndex) => currentIndex !== index) }))} className={dangerButton}>
                                            <Trash2 size={18} aria-hidden="true" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </section>
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>

                      <button type="button" onClick={() => { setSelectedLessonId(lesson.id); addLessonItem(); }} aria-label="إضافة محتوى" title="إضافة محتوى" disabled={busy} className={controlButton}>
                        <Plus size={19} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {!busy && notice?.type === "success" && (
        <p className="sr-only" aria-live="polite"><Check aria-hidden="true" /> {notice.text}</p>
      )}
    </main>
  );
}