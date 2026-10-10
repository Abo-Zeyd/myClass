'use client';

import {
  Bell,
  BookOpen,
  Bug,
  Check,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  ImagePlus,
  LogOut,
  Megaphone,
  MessageSquare,
  Plus,
  Save,
  Trash2,
  Video,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  AdminNotification,
  BugReport,
  HomepageComment,
  ManagedLessonComment,
} from '../../lib/content-db';
import { getAssignmentStatus } from '../assignment-status';
import {
  loadAdminNotifications,
  loadAssignments,
  loadBugReports,
  loadHomepageCommentsForAdmin,
  loadLessonCommentsForAdmin,
  loadLessons,
  loadSupportingActivities,
  loadUnreadNotificationCount,
  loadVisitorCount,
  logout,
  markNotificationsRead,
  removeHomepageComment,
  removeLessonComment,
  saveAssignments,
  saveHomepageComment,
  saveLessonComment,
  saveLessons,
  saveSupportingActivities,
} from './actions';
import BugReportsSection from './BugReportsSection';
import DatabaseBackupPanel from './DatabaseBackupPanel';
import HomepageContentManager from './HomepageContentManager';

type Assignment = {
  id: string;
  name: string;
  assignedDate: string;
  submissionDate: string;
  link?: string;
  completed?: boolean;
};

type SupportingActivity = {
  id: string;
  name: string;
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

const subjects = [
  { id: 'islamic-education', name: 'التربية الإسلامية' },
  { id: 'arabic', name: 'اللغة العربية' },
  { id: 'mathematics', name: 'الرياضيات' },
  { id: 'history', name: 'التاريخ' },
  { id: 'geography', name: 'الجغرافيا' },
  { id: 'civic-education', name: 'التربية المدنية' },
  { id: 'science', name: 'التربية العلمية' },
  { id: 'memorization', name: 'المحفوظات' },
];

const inputClassName =
  'w-full rounded-md border border-border bg-surface px-3 py-3 text-base font-normal leading-7 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
const labelClassName = 'grid gap-2 text-sm font-medium text-foreground';

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function groupLessonComments(comments: ManagedLessonComment[]) {
  const groups = new Map<
    string,
    {
      subjectId: string;
      subjectTitle: string;
      lessonId: string;
      lessonTitle: string;
      itemId: string;
      itemTitle: string;
      comments: ManagedLessonComment[];
    }
  >();

  for (const comment of comments) {
    const key = JSON.stringify([comment.subjectId, comment.lessonId, comment.itemId]);
    const group = groups.get(key) ?? {
      subjectId: comment.subjectId,
      subjectTitle: comment.subjectTitle,
      lessonId: comment.lessonId,
      lessonTitle: comment.lessonTitle,
      itemId: comment.itemId,
      itemTitle: comment.itemTitle,
      comments: [],
    };
    group.comments.push(comment);
    groups.set(key, group);
  }

  return [...groups.values()];
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    | 'assignments'
    | 'supportingActivities'
    | 'homepageContent'
    | 'homepageComments'
    | 'lessonComments'
    | 'lessons'
    | 'bugReports'
  >('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [homepageComments, setHomepageComments] = useState<HomepageComment[]>([]);
  const [lessonComments, setLessonComments] = useState<ManagedLessonComment[]>([]);
  const [lessonCommentSubject, setLessonCommentSubject] = useState('all');
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [supportingActivities, setSupportingActivities] = useState<SupportingActivity[]>([]);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState('arabic');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [selectedHomepageCommentId, setSelectedHomepageCommentId] = useState<string | null>(null);

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);

  useEffect(() => {
    let active = true;

    Promise.all([
      loadAssignments(),
      loadSupportingActivities(),
      loadLessons('arabic'),
      loadHomepageCommentsForAdmin(),
      loadLessonCommentsForAdmin(),
      loadUnreadNotificationCount(),
      loadVisitorCount(),
      loadBugReports(),
      loadAdminNotifications(),
    ])
      .then(
        ([
          loadedAssignments,
          loadedActivities,
          loadedLessons,
          loadedComments,
          loadedLessonComments,
          unreadCount,
          loadedVisitorCount,
          loadedReports,
          loadedNotifications,
        ]) => {
          if (!active) return;
          setAssignments(loadedAssignments);
          setSupportingActivities(loadedActivities);
          setLessons(loadedLessons);
          setHomepageComments(loadedComments);
          setLessonComments(loadedLessonComments);
          setUnreadNotificationCount(unreadCount);
          setVisitorCount(loadedVisitorCount);
          setBugReports(loadedReports);
          setNotifications(loadedNotifications);
        }
      )
      .catch((error: unknown) => {
        if (active)
          setNotice({
            type: 'error',
            text: error instanceof Error ? error.message : 'تعذر تحميل البيانات.',
          });
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const refreshUnreadCount = async () => {
      try {
        const count = await loadUnreadNotificationCount();
        if (active) setUnreadNotificationCount(count);
      } catch (error) {
        if (active) {
          setNotice({
            type: 'error',
            text: error instanceof Error ? error.message : 'تعذر تحديث التنبيهات.',
          });
        }
      }
    };
    const timer = window.setInterval(refreshUnreadCount, 30_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'homepageComments' || !selectedHomepageCommentId) return;
    const frame = window.requestAnimationFrame(() => {
      const comment = document.getElementById(`homepage-comment-${selectedHomepageCommentId}`);
      comment?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      comment?.focus({ preventScroll: true });
      setSelectedHomepageCommentId(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, selectedHomepageCommentId]);

  async function toggleNotifications() {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }

    setNotificationsBusy(true);
    setNotice(null);
    try {
      // آخر 10 تنبيهات (تعليقات رئيسية + دروس + بلاغات)
      const loaded = await loadAdminNotifications();
      setNotifications(loaded);

      // تُعلّم كمقروءة فقط — تبقى في القائمة ولا تُحذف
      const unreadIds = loaded
        .filter((notification) => notification.readAt === null)
        .map((notification) => notification.id);

      if (unreadIds.length > 0) {
        await markNotificationsRead(unreadIds);
        setNotifications((current) =>
          current.map((notification) =>
            unreadIds.includes(notification.id)
              ? { ...notification, readAt: new Date().toISOString() }
              : notification
          )
        );
      }

      setUnreadNotificationCount(await loadUnreadNotificationCount());
      setNotificationsOpen(true);
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر تحميل التنبيهات.',
      });
    } finally {
      setNotificationsBusy(false);
    }
  }

  /** الانتقال للقسم المناسب حسب نوع التنبيه */
  function openNotification(notification: AdminNotification) {
    setNotificationsOpen(false);

    if (notification.sourceType === 'bug_report') {
      setActiveTab('bugReports');
      return;
    }

    setSelectedHomepageCommentId(notification.sourceId);
    setActiveTab(
      notification.sourceType === 'lesson_comment' ? 'lessonComments' : 'homepageComments'
    );
  }

  function updateAssignment(id: string, field: keyof Assignment, value: string) {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id ? { ...assignment, [field]: value } : assignment
      )
    );
  }

  function updateAssignmentCompletion(id: string, completed: boolean) {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id ? { ...assignment, completed } : assignment
      )
    );
  }

  function updateSupportingActivity(
    id: string,
    field: keyof SupportingActivity,
    value: string | boolean
  ) {
    setSupportingActivities((current) =>
      current.map((activity) => (activity.id === id ? { ...activity, [field]: value } : activity))
    );
  }

  function updateLessonTitle(value: string) {
    setLessons((current) =>
      current.map((lesson) =>
        lesson.id === selectedLessonId ? { ...lesson, title: value } : lesson
      )
    );
  }

  function updateSelectedItem(update: (item: LessonItem) => LessonItem) {
    setLessons((current) =>
      current.map((lesson) =>
        lesson.id === selectedLessonId
          ? {
              ...lesson,
              items: lesson.items.map((item) => (item.id === selectedItemId ? update(item) : item)),
            }
          : lesson
      )
    );
  }

  async function changeSubject(nextSubjectId: string) {
    setSubjectId(nextSubjectId);
    setSelectedLessonId('');
    setSelectedItemId('');
    setBusy(true);
    setNotice(null);

    try {
      const loadedLessons = await loadLessons(nextSubjectId);
      setLessons(loadedLessons);
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر تحميل الدروس.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function persistAssignments() {
    setBusy(true);
    setNotice(null);
    try {
      await saveAssignments(assignments);
      setNotice({ type: 'success', text: 'تم حفظ الواجبات في Supabase.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حفظ الواجبات.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function persistSupportingActivities() {
    setBusy(true);
    setNotice(null);
    try {
      await saveSupportingActivities(supportingActivities);
      setNotice({ type: 'success', text: 'تم حفظ الأنشطة الداعمة.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حفظ الأنشطة الداعمة.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function persistHomepageComment(comment: HomepageComment) {
    setBusy(true);
    setNotice(null);
    try {
      await saveHomepageComment(comment.id, comment.displayName, comment.body);
      setNotice({ type: 'success', text: 'تم حفظ التعديل على التعليق.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حفظ التعليق.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function deleteHomepageComment(id: string) {
    if (!window.confirm('هل تريد حذف هذا التعليق نهائياً؟')) return;
    setBusy(true);
    setNotice(null);
    try {
      await removeHomepageComment(id);
      setHomepageComments((current) => current.filter((comment) => comment.id !== id));
      setNotice({ type: 'success', text: 'تم حذف التعليق.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حذف التعليق.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function persistLessonComment(comment: ManagedLessonComment) {
    setBusy(true);
    setNotice(null);
    try {
      await saveLessonComment(comment.id, comment.displayName, comment.body);
      setNotice({ type: 'success', text: 'تم حفظ التعديل على تعليق الدرس.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حفظ التعليق.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function deleteLessonCommentById(id: string) {
    if (!window.confirm('هل تريد حذف تعليق الدرس نهائياً؟')) return;
    setBusy(true);
    setNotice(null);
    try {
      await removeLessonComment(id);
      setLessonComments((current) => current.filter((comment) => comment.id !== id));
      setNotice({ type: 'success', text: 'تم حذف تعليق الدرس.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حذف التعليق.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function persistLessons() {
    setBusy(true);
    setNotice(null);
    try {
      await saveLessons(subjectId, lessons);
      setNotice({ type: 'success', text: 'تم حفظ دروس المادة في Supabase.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حفظ الدروس.',
      });
    } finally {
      setBusy(false);
    }
  }

  function addAssignment() {
    const assignment = {
      id: newId('homework'),
      name: '',
      assignedDate: '',
      submissionDate: '',
      link: '',
      completed: false,
    };
    setAssignments((current) => [assignment, ...current]);
    setExpandedAssignmentId(assignment.id);
  }

  function addSupportingActivity() {
    const activity = {
      id: newId('support'),
      name: '',
      link: '',
      completed: false,
    };
    setSupportingActivities((current) => [activity, ...current]);
    setExpandedActivityId(activity.id);
  }

  function addLesson() {
    const lesson = { id: newId('lesson'), title: 'درس جديد', items: [] };
    setLessons((current) => [...current, lesson]);
    setSelectedLessonId(lesson.id);
    setSelectedItemId('');
  }

  function addLessonItem() {
    if (!selectedLesson) return;
    const item: LessonItem = {
      id: newId('item'),
      title: 'محتوى جديد',
      summary: '',
      activities: [],
      images: [],
      videos: [],
      pdfs: [],
    };
    setLessons((current) =>
      current.map((lesson) =>
        lesson.id === selectedLessonId ? { ...lesson, items: [...lesson.items, item] } : lesson
      )
    );
    setSelectedItemId(item.id);
  }

  const controlButton =
    'inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50';
  const primaryButton =
    'inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
  const dangerButton =
    'inline-flex size-11 shrink-0 items-center justify-center rounded-md text-error transition-colors hover:bg-error-light disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <main
      className="admin-dashboard mx-auto w-full max-w-6xl px-4 py-8 text-base leading-relaxed sm:px-6"
      dir="rtl"
    >
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="mb-1 text-sm font-semibold text-primary">إدارة المحتوى</p>
          <h1 className="text-3xl font-extrabold leading-tight text-foreground">لوحة المحتوى</h1>
        </div>
        <div className="flex items-center gap-4">
          {busy && <span className="text-sm text-muted-foreground">جارٍ العمل...</span>}
          <div className="relative">
            <button
              type="button"
              aria-label={
                unreadNotificationCount > 0
                  ? `تنبيهات، ${unreadNotificationCount} جديدة`
                  : 'التنبيهات'
              }
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              title="التنبيهات الجديدة"
              disabled={notificationsBusy}
              onClick={() => void toggleNotifications()}
              className="relative inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:cursor-wait disabled:opacity-60"
            >
              <Bell size={19} aria-hidden="true" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[11px] font-bold leading-none text-white">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <section
                aria-label="التنبيهات"
                className="absolute left-0 top-full z-30 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
              >
                <h2 className="border-b border-border px-4 py-3 text-sm font-bold text-foreground">
                  آخر التنبيهات
                </h2>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => openNotification(notification)}
                        className={`block w-full border-b border-border px-4 py-3 text-right transition-colors last:border-b-0 hover:bg-surface-muted ${
                          notification.readAt === null ? 'bg-primary/[0.04]' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {notification.sourceType === 'bug_report' ? (
                              <Bug size={11} aria-hidden="true" />
                            ) : (
                              <MessageSquare size={11} aria-hidden="true" />
                            )}
                            {notification.sourceType === 'bug_report'
                              ? 'بلاغ'
                              : notification.sourceType === 'lesson_comment'
                                ? 'درس'
                                : 'رئيسية'}
                          </span>
                          {notification.readAt === null && (
                            <span
                              className="size-2 shrink-0 rounded-full bg-error"
                              aria-label="غير مقروء"
                            />
                          )}
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                            {notification.title}
                          </span>
                        </span>
                        <span className="mt-1 block line-clamp-2 text-sm text-muted-foreground">
                          {notification.body}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat('ar-DZ', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(notification.createdAt))}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      لا توجد تنبيهات.
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
          <form action={logout}>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-surface-muted"
              type="submit"
            >
              <LogOut size={17} aria-hidden="true" />
              خروج
            </button>
          </form>
        </div>
      </header>

      <section
        className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm"
        aria-label="إحصائيات الموقع"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Eye size={24} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-muted-foreground">إجمالي زيارات الموقع</p>
          <p className="text-2xl font-extrabold text-foreground">
            {visitorCount.toLocaleString('ar-DZ')}
          </p>
        </div>
      </section>
      <DatabaseBackupPanel />
      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav
          className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-muted/60 p-2 lg:sticky lg:top-4 lg:flex lg:flex-col lg:self-start"
          role="tablist"
          aria-label="أقسام لوحة التحكم"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'homepageContent'}
            onClick={() => setActiveTab('homepageContent')}
            className={`flex min-h-12 w-full items-center justify-start gap-3 rounded-md px-4 text-sm font-bold transition-colors ${activeTab === 'homepageContent' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
          >
            <Megaphone size={17} aria-hidden="true" /> التنبيهات والصور
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'supportingActivities'}
            onClick={() => setActiveTab('supportingActivities')}
            className={`flex min-h-12 w-full items-center justify-start gap-3 rounded-md px-4 text-sm font-bold transition-colors ${activeTab === 'supportingActivities' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
          >
            <Check size={17} aria-hidden="true" /> الأنشطة الداعمة
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'assignments'}
            onClick={() => setActiveTab('assignments')}
            className={`flex min-h-12 w-full items-center justify-start gap-3 rounded-md px-4 text-sm font-bold transition-colors ${activeTab === 'assignments' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
          >
            <ClipboardList size={17} aria-hidden="true" /> الواجبات
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'lessons'}
            onClick={() => setActiveTab('lessons')}
            className={`flex min-h-12 w-full items-center justify-start gap-3 rounded-md px-4 text-sm font-bold transition-colors ${activeTab === 'lessons' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
          >
            <BookOpen size={17} aria-hidden="true" /> الدروس
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'homepageComments'}
            onClick={() => setActiveTab('homepageComments')}
            className={`flex min-h-12 w-full items-center justify-start gap-3 rounded-md px-4 text-sm font-bold transition-colors ${activeTab === 'homepageComments' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
          >
            <MessageSquare size={17} aria-hidden="true" /> تعليقات الصفحة الرئيسية
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'lessonComments'}
            onClick={() => setActiveTab('lessonComments')}
            className={`flex min-h-12 w-full items-center justify-start gap-3 rounded-md px-4 text-sm font-bold transition-colors ${activeTab === 'lessonComments' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
          >
            <MessageSquare size={17} aria-hidden="true" /> تعليقات الدروس
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'bugReports'}
            onClick={() => setActiveTab('bugReports')}
            className={`flex min-h-12 w-full items-center justify-start gap-3 rounded-md px-4 text-sm font-bold transition-colors ${activeTab === 'bugReports' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
          >
            <Bug size={17} aria-hidden="true" /> بلاغات الأخطاء
            {bugReports.filter((report) => report.status === 'pending').length > 0 && (
              <span className="ms-auto rounded-full bg-error px-2 py-0.5 text-[11px] font-bold text-white">
                {bugReports.filter((report) => report.status === 'pending').length}
              </span>
            )}
          </button>
        </nav>

        <div className="min-w-0">
          {notice && (
            <p
              role="status"
              className={`mb-6 rounded-md border px-5 py-4 text-base ${notice.type === 'success' ? 'border-success/25 bg-success-light text-success' : 'border-error/25 bg-error-light text-error'}`}
            >
              {notice.text}
            </p>
          )}

          {activeTab === 'assignments' ? (
            <section role="tabpanel" aria-label="إدارة الواجبات">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-bold leading-snug">الواجبات المنزلية</h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addAssignment}
                    aria-label="إضافة واجب"
                    title="إضافة واجب"
                    className={controlButton}
                  >
                    <Plus size={19} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void persistAssignments()}
                    aria-label="حفظ الواجبات"
                    title="حفظ الواجبات"
                    disabled={busy}
                    className={primaryButton}
                  >
                    <Save size={19} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const isExpanded = expandedAssignmentId === assignment.id;
                  const detailsId = `${assignment.id}-details`;
                  const status = getAssignmentStatus(
                    assignment.completed === true,
                    assignment.submissionDate
                  );

                  return (
                    <article
                      key={assignment.id}
                      className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        onClick={() => setExpandedAssignmentId(isExpanded ? null : assignment.id)}
                        className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-right text-lg font-semibold text-foreground transition-colors hover:bg-surface-muted/40"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {assignment.name || 'واجب جديد'}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status === 'completed' ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}
                        >
                          {status === 'completed'
                            ? 'تم الإنجاز'
                            : status === 'overdue'
                              ? 'لم يتم - متأخر'
                              : 'لم يتم'}
                        </span>
                        <ChevronDown
                          className={`size-5 shrink-0 text-primary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                      <div
                        id={detailsId}
                        hidden={!isExpanded}
                        className="grid gap-5 border-t border-border bg-surface-muted/25 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,2fr)_1fr_1fr_minmax(14rem,2fr)] lg:items-end"
                      >
                        <label className={labelClassName}>
                          اسم الواجب
                          <input
                            className={inputClassName}
                            value={assignment.name}
                            onChange={(event) =>
                              updateAssignment(assignment.id, 'name', event.target.value)
                            }
                          />
                        </label>
                        <label className={labelClassName}>
                          تاريخ التكليف
                          <input
                            type="date"
                            className={inputClassName}
                            value={assignment.assignedDate}
                            onChange={(event) =>
                              updateAssignment(assignment.id, 'assignedDate', event.target.value)
                            }
                          />
                        </label>
                        <label className={labelClassName}>
                          تاريخ التقديم
                          <input
                            type="date"
                            className={inputClassName}
                            value={assignment.submissionDate}
                            onChange={(event) =>
                              updateAssignment(assignment.id, 'submissionDate', event.target.value)
                            }
                          />
                        </label>
                        <label className={labelClassName}>
                          رابط الواجب
                          <input
                            type="url"
                            className={inputClassName}
                            value={assignment.link ?? ''}
                            placeholder="https://..."
                            onChange={(event) =>
                              updateAssignment(assignment.id, 'link', event.target.value)
                            }
                          />
                        </label>
                        <label className="inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:border-success/40 hover:bg-success-light/60 sm:col-span-2 lg:col-span-3">
                          <input
                            type="checkbox"
                            className="size-5 shrink-0 accent-success"
                            checked={assignment.completed === true}
                            onChange={(event) =>
                              updateAssignmentCompletion(assignment.id, event.target.checked)
                            }
                          />
                          تم الإنجاز
                        </label>
                        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                          <button
                            type="button"
                            aria-label={`حفظ الواجب ${assignment.name || 'الجديد'}`}
                            title="حفظ الواجب"
                            onClick={() => void persistAssignments()}
                            disabled={busy}
                            className={primaryButton}
                          >
                            <Save size={19} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`حذف الواجب ${assignment.name || 'الجديد'}`}
                            title="حذف الواجب"
                            onClick={() => {
                              setAssignments((current) =>
                                current.filter((entry) => entry.id !== assignment.id)
                              );
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
                {assignments.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">لا توجد واجبات.</p>
                )}
              </div>
            </section>
          ) : activeTab === 'supportingActivities' ? (
            <section role="tabpanel" aria-label="إدارة الأنشطة الداعمة">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-bold leading-snug">الأنشطة الداعمة</h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addSupportingActivity}
                    aria-label="إضافة نشاط داعم"
                    title="إضافة نشاط داعم"
                    className={controlButton}
                  >
                    <Plus size={19} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void persistSupportingActivities()}
                    aria-label="حفظ الأنشطة الداعمة"
                    title="حفظ الأنشطة الداعمة"
                    disabled={busy}
                    className={primaryButton}
                  >
                    <Save size={19} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {supportingActivities.map((activity) => {
                  const isExpanded = expandedActivityId === activity.id;
                  const detailsId = `${activity.id}-details`;

                  return (
                    <article
                      key={activity.id}
                      className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
                        className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-right text-lg font-semibold text-foreground transition-colors hover:bg-surface-muted/40"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {activity.name || 'نشاط جديد'}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${activity.completed ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}
                        >
                          {activity.completed ? 'تم الإنجاز' : 'للتدرب'}
                        </span>
                        <ChevronDown
                          className={`size-5 shrink-0 text-primary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                      <div
                        id={detailsId}
                        hidden={!isExpanded}
                        className="grid gap-5 border-t border-border bg-surface-muted/25 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,2fr)_minmax(14rem,2fr)_auto] lg:items-end"
                      >
                        <label className={labelClassName}>
                          اسم النشاط
                          <input
                            className={inputClassName}
                            value={activity.name}
                            onChange={(event) =>
                              updateSupportingActivity(activity.id, 'name', event.target.value)
                            }
                          />
                        </label>
                        <label className={labelClassName}>
                          رابط النشاط
                          <input
                            type="url"
                            className={inputClassName}
                            value={activity.link ?? ''}
                            placeholder="https://..."
                            onChange={(event) =>
                              updateSupportingActivity(activity.id, 'link', event.target.value)
                            }
                          />
                        </label>
                        <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground">
                          <input
                            type="checkbox"
                            className="size-5 accent-green-700"
                            checked={activity.completed}
                            onChange={(event) =>
                              updateSupportingActivity(
                                activity.id,
                                'completed',
                                event.target.checked
                              )
                            }
                          />
                          تم الإنجاز
                        </label>
                        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                          <button
                            type="button"
                            aria-label={`حفظ النشاط ${activity.name || 'الجديد'}`}
                            title="حفظ النشاط"
                            onClick={() => void persistSupportingActivities()}
                            disabled={busy}
                            className={primaryButton}
                          >
                            <Save size={19} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`حذف النشاط ${activity.name || 'الجديد'}`}
                            title="حذف النشاط"
                            onClick={() => {
                              setSupportingActivities((current) =>
                                current.filter((entry) => entry.id !== activity.id)
                              );
                              setExpandedActivityId(null);
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
                {supportingActivities.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    لا توجد أنشطة داعمة.
                  </p>
                )}
              </div>
            </section>
          ) : activeTab === 'homepageContent' ? (
            <HomepageContentManager />
          ) : activeTab === 'homepageComments' ? (
            <section role="tabpanel" aria-label="إدارة تعليقات الصفحة الرئيسية">
              <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h2 className="inline-flex items-center gap-2 text-xl font-bold leading-snug">
                  <MessageSquare size={20} aria-hidden="true" /> تعليقات الصفحة الرئيسية
                </h2>
                <span className="text-sm text-muted-foreground">
                  {homepageComments.length} تعليق
                </span>
              </header>
              <div className="max-h-168 divide-y divide-border overflow-y-auto overscroll-contain border-y border-border">
                {homepageComments.map((comment) => (
                  <article
                    key={comment.id}
                    id={`homepage-comment-${comment.id}`}
                    tabIndex={-1}
                    className="scroll-mt-6 grid gap-4 py-5 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[minmax(12rem,1fr)_minmax(16rem,2fr)_auto] sm:items-end"
                  >
                    <label className={labelClassName}>
                      الاسم
                      <input
                        className={inputClassName}
                        maxLength={60}
                        value={comment.displayName}
                        onChange={(event) =>
                          setHomepageComments((current) =>
                            current.map((entry) =>
                              entry.id === comment.id
                                ? { ...entry, displayName: event.target.value }
                                : entry
                            )
                          )
                        }
                      />
                    </label>
                    <label className={labelClassName}>
                      التعليق
                      <textarea
                        rows={2}
                        maxLength={1000}
                        className={inputClassName}
                        value={comment.body}
                        onChange={(event) =>
                          setHomepageComments((current) =>
                            current.map((entry) =>
                              entry.id === comment.id
                                ? { ...entry, body: event.target.value }
                                : entry
                            )
                          )
                        }
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`حفظ تعليق ${comment.displayName}`}
                        title="حفظ التعديل"
                        disabled={busy}
                        onClick={() => void persistHomepageComment(comment)}
                        className={primaryButton}
                      >
                        <Save size={19} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`حذف تعليق ${comment.displayName}`}
                        title="حذف التعليق"
                        disabled={busy}
                        onClick={() => void deleteHomepageComment(comment.id)}
                        className={dangerButton}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground sm:col-span-3">
                      {new Intl.DateTimeFormat('ar-DZ', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(comment.createdAt))}
                    </p>
                  </article>
                ))}
                {homepageComments.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    لا توجد تعليقات حتى الآن.
                  </p>
                )}
              </div>
            </section>
          ) : activeTab === 'lessonComments' ? (
            <section role="tabpanel" aria-label="إدارة تعليقات الدروس">
              <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="inline-flex items-center gap-2 text-xl font-bold leading-snug">
                    <MessageSquare size={20} aria-hidden="true" /> تعليقات الدروس
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    مرتبة حسب المادة ثم الدرس ومحتواه.
                  </p>
                </div>
                <label className={labelClassName}>
                  المادة
                  <select
                    className={inputClassName}
                    value={lessonCommentSubject}
                    onChange={(event) => setLessonCommentSubject(event.target.value)}
                  >
                    <option value="all">كل المواد</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </label>
              </header>

              <div className="max-h-168 space-y-3 overflow-y-auto overscroll-contain">
                {groupLessonComments(
                  lessonComments.filter(
                    (comment) =>
                      lessonCommentSubject === 'all' || comment.subjectId === lessonCommentSubject
                  )
                ).map((group) => (
                  <details
                    key={`${group.subjectId}-${group.lessonId}-${group.itemId}`}
                    className="overflow-hidden rounded-md border border-border bg-surface"
                  >
                    <summary className="cursor-pointer list-none px-4 py-3 transition-colors hover:bg-surface-muted/40">
                      <span className="block text-sm font-semibold text-foreground">
                        {group.subjectTitle} / {group.lessonTitle}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{group.itemTitle}</span>
                        <span>{group.comments.length} تعليق</span>
                      </span>
                    </summary>
                    <div className="divide-y divide-border border-t border-border px-4">
                      {group.comments.map((comment) => (
                        <article
                          key={comment.id}
                          className="grid gap-4 py-4 sm:grid-cols-[minmax(10rem,1fr)_minmax(14rem,2fr)_auto] sm:items-end"
                        >
                          <label className={labelClassName}>
                            الاسم
                            <input
                              className={inputClassName}
                              maxLength={60}
                              value={comment.displayName}
                              onChange={(event) =>
                                setLessonComments((current) =>
                                  current.map((entry) =>
                                    entry.id === comment.id
                                      ? { ...entry, displayName: event.target.value }
                                      : entry
                                  )
                                )
                              }
                            />
                          </label>
                          <label className={labelClassName}>
                            التعليق
                            <textarea
                              rows={2}
                              maxLength={1000}
                              className={inputClassName}
                              value={comment.body}
                              onChange={(event) =>
                                setLessonComments((current) =>
                                  current.map((entry) =>
                                    entry.id === comment.id
                                      ? { ...entry, body: event.target.value }
                                      : entry
                                  )
                                )
                              }
                            />
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`حفظ تعليق ${comment.displayName}`}
                              title="حفظ التعديل"
                              disabled={busy}
                              onClick={() => void persistLessonComment(comment)}
                              className={primaryButton}
                            >
                              <Save size={19} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              aria-label={`حذف تعليق ${comment.displayName}`}
                              title="حذف التعليق"
                              disabled={busy}
                              onClick={() => void deleteLessonCommentById(comment.id)}
                              className={dangerButton}
                            >
                              <Trash2 size={18} aria-hidden="true" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground sm:col-span-3">
                            {new Intl.DateTimeFormat('ar-DZ', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(comment.createdAt))}
                            {comment.status !== 'approved' && (
                              <span className="mr-2">
                                · {comment.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                              </span>
                            )}
                          </p>
                        </article>
                      ))}
                    </div>
                  </details>
                ))}
                {lessonComments.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    لا توجد تعليقات دروس حتى الآن.
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section role="tabpanel" aria-label="إدارة الدروس">
              <div className="mb-6 grid gap-4 border-b border-border pb-6 sm:grid-cols-[minmax(14rem,1fr)_auto_auto] sm:items-end">
                <label className={labelClassName}>
                  المادة
                  <select
                    className={inputClassName}
                    value={subjectId}
                    disabled={busy}
                    onChange={(event) => void changeSubject(event.target.value)}
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={addLesson}
                  aria-label="إضافة درس"
                  title="إضافة درس"
                  disabled={busy}
                  className={controlButton}
                >
                  <Plus size={19} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void persistLessons()}
                  aria-label="حفظ المادة"
                  title="حفظ المادة"
                  disabled={busy}
                  className={primaryButton}
                >
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
              ) : activeTab === 'bugReports' ? (
                <BugReportsSection reports={bugReports} onChange={setBugReports} />
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson) => {
                    const isLessonExpanded = selectedLessonId === lesson.id;
                    const lessonDetailsId = `${lesson.id}-admin-details`;

                    return (
                      <article
                        key={lesson.id}
                        className="overflow-hidden rounded-md border border-border bg-surface"
                      >
                        <button
                          type="button"
                          aria-expanded={isLessonExpanded}
                          aria-controls={lessonDetailsId}
                          onClick={() => {
                            setSelectedLessonId(isLessonExpanded ? '' : lesson.id);
                            setSelectedItemId('');
                          }}
                          className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-4 text-right text-lg font-semibold text-foreground transition-colors hover:bg-surface-muted/40"
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {lesson.title || 'درس جديد'}
                          </span>
                          <ChevronDown
                            className={`size-5 shrink-0 text-primary transition-transform ${isLessonExpanded ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                        <div
                          id={lessonDetailsId}
                          hidden={!isLessonExpanded}
                          className="space-y-6 border-t border-border bg-surface-muted/25 p-5 sm:p-6"
                        >
                          <div className="flex flex-wrap items-end gap-4">
                            <label className={`${labelClassName} min-w-64 flex-1`}>
                              عنوان الدرس
                              <input
                                className={inputClassName}
                                value={lesson.title}
                                onChange={(event) => {
                                  setSelectedLessonId(lesson.id);
                                  updateLessonTitle(event.target.value);
                                }}
                              />
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => void persistLessons()}
                                aria-label={`حفظ الدرس ${lesson.title}`}
                                title="حفظ الدرس"
                                disabled={busy}
                                className={primaryButton}
                              >
                                <Save size={19} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                aria-label={`حذف الدرس ${lesson.title}`}
                                title="حذف الدرس"
                                onClick={() => {
                                  setLessons((current) =>
                                    current.filter((entry) => entry.id !== lesson.id)
                                  );
                                  setSelectedLessonId('');
                                  setSelectedItemId('');
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
                                <article
                                  key={item.id}
                                  className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm"
                                >
                                  <div className="flex items-center gap-2 p-1.5">
                                    <button
                                      type="button"
                                      aria-expanded={isItemExpanded}
                                      aria-controls={itemDetailsId}
                                      onClick={() => {
                                        setSelectedLessonId(lesson.id);
                                        setSelectedItemId(isItemExpanded ? '' : item.id);
                                      }}
                                      className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-4 py-3 text-right text-base font-semibold text-foreground transition-colors hover:bg-surface-muted/35"
                                    >
                                      <span className="min-w-0 flex-1 truncate">
                                        {item.title || 'محتوى جديد'}
                                      </span>
                                      <ChevronDown
                                        className={`size-4 shrink-0 text-primary transition-transform ${isItemExpanded ? 'rotate-180' : ''}`}
                                        aria-hidden="true"
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`حفظ المحتوى ${item.title || 'الجديد'}`}
                                      title="حفظ المحتوى"
                                      onClick={() => void persistLessons()}
                                      disabled={busy}
                                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
                                    >
                                      <Save size={18} aria-hidden="true" />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`حذف المحتوى ${item.title || 'الجديد'}`}
                                      title="حذف المحتوى"
                                      onClick={() => {
                                        setLessons((current) =>
                                          current.map((entry) =>
                                            entry.id === lesson.id
                                              ? {
                                                  ...entry,
                                                  items: entry.items.filter(
                                                    (lessonItem) => lessonItem.id !== item.id
                                                  ),
                                                }
                                              : entry
                                          )
                                        );
                                        if (selectedItemId === item.id) setSelectedItemId('');
                                      }}
                                      className={`${dangerButton} size-10`}
                                    >
                                      <Trash2 size={16} aria-hidden="true" />
                                    </button>
                                  </div>
                                  {isItemExpanded && (
                                    <div
                                      id={itemDetailsId}
                                      className="space-y-6 border-t border-border bg-surface-muted/20 p-5 sm:p-6"
                                    >
                                      <label className={labelClassName}>
                                        عنوان المحتوى
                                        <input
                                          className={inputClassName}
                                          value={item.title}
                                          onChange={(event) =>
                                            updateSelectedItem((current) => ({
                                              ...current,
                                              title: event.target.value,
                                            }))
                                          }
                                        />
                                      </label>
                                      <label className={labelClassName}>
                                        الخلاصة
                                        <textarea
                                          rows={4}
                                          className={inputClassName}
                                          value={item.summary ?? ''}
                                          onChange={(event) =>
                                            updateSelectedItem((current) => ({
                                              ...current,
                                              summary: event.target.value,
                                            }))
                                          }
                                        />
                                      </label>
                                      <label className={labelClassName}>
                                        أنشطة وتمارين، نشاط في كل سطر
                                        <textarea
                                          rows={5}
                                          className={inputClassName}
                                          value={item.activities.join('\n')}
                                          onChange={(event) =>
                                            updateSelectedItem((current) => ({
                                              ...current,
                                              activities: event.target.value.split('\n'),
                                            }))
                                          }
                                        />
                                      </label>

                                      <section className="space-y-3 rounded-md border border-border bg-surface p-4 sm:p-5">
                                        <div className="flex items-center justify-between gap-4">
                                          <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                                            <ImagePlus size={19} aria-hidden="true" /> الصور
                                          </h3>
                                          <button
                                            type="button"
                                            aria-label="إضافة صورة"
                                            title="إضافة صورة"
                                            onClick={() =>
                                              updateSelectedItem((current) => ({
                                                ...current,
                                                images: [...current.images, { src: '', alt: '' }],
                                              }))
                                            }
                                            className={controlButton}
                                          >
                                            <Plus size={19} aria-hidden="true" />
                                          </button>
                                        </div>
                                        <div className="divide-y divide-border rounded-md border border-border bg-background px-4">
                                          {item.images.map((image, index) => (
                                            <div
                                              key={`${item.id}-image-${index}`}
                                              className="grid gap-4 py-4 sm:grid-cols-[minmax(14rem,2fr)_minmax(12rem,1fr)_auto] sm:items-end"
                                            >
                                              <label className={labelClassName}>
                                                مسار الصورة أو رابطها
                                                <input
                                                  className={inputClassName}
                                                  value={image.src}
                                                  placeholder="/myClass/images/... أو https://..."
                                                  onChange={(event) =>
                                                    updateSelectedItem((current) => ({
                                                      ...current,
                                                      images: current.images.map(
                                                        (entry, currentIndex) =>
                                                          currentIndex === index
                                                            ? { ...entry, src: event.target.value }
                                                            : entry
                                                      ),
                                                    }))
                                                  }
                                                />
                                              </label>
                                              <div className={labelClassName}>
                                                <label
                                                  htmlFor={`${item.id}-image-category-${index}`}
                                                >
                                                  التصنيف (اختياري)
                                                </label>
                                                <select
                                                  id={`${item.id}-image-category-${index}`}
                                                  className={inputClassName}
                                                  value={
                                                    image.alt === 'خريطة ذهنية' ? 'mind-map' : ''
                                                  }
                                                  onChange={(event) => {
                                                    const value = event.target.value;
                                                    updateSelectedItem((current) => ({
                                                      ...current,
                                                      images: current.images.map(
                                                        (entry, currentIndex) =>
                                                          currentIndex === index
                                                            ? {
                                                                ...entry,
                                                                alt:
                                                                  value === 'mind-map'
                                                                    ? 'خريطة ذهنية'
                                                                    : '',
                                                              }
                                                            : entry
                                                      ),
                                                    }));
                                                  }}
                                                >
                                                  <option value="">بدون تصنيف</option>
                                                  <option value="mind-map">خريطة ذهنية</option>
                                                </select>
                                                <label
                                                  htmlFor={`${item.id}-image-description-${index}`}
                                                >
                                                  أو اكتب وصفاً مخصصاً
                                                </label>
                                                <input
                                                  id={`${item.id}-image-description-${index}`}
                                                  className={inputClassName}
                                                  value={image.alt}
                                                  placeholder="وصف الصورة"
                                                  onChange={(event) =>
                                                    updateSelectedItem((current) => ({
                                                      ...current,
                                                      images: current.images.map(
                                                        (entry, currentIndex) =>
                                                          currentIndex === index
                                                            ? { ...entry, alt: event.target.value }
                                                            : entry
                                                      ),
                                                    }))
                                                  }
                                                />
                                              </div>
                                              <button
                                                type="button"
                                                aria-label="حذف الصورة"
                                                title="حذف الصورة"
                                                onClick={() =>
                                                  updateSelectedItem((current) => ({
                                                    ...current,
                                                    images: current.images.filter(
                                                      (_, currentIndex) => currentIndex !== index
                                                    ),
                                                  }))
                                                }
                                                className={dangerButton}
                                              >
                                                <Trash2 size={18} aria-hidden="true" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </section>

                                      <section className="space-y-3 rounded-md border border-border bg-surface p-4 sm:p-5">
                                        <div className="flex items-center justify-between gap-4">
                                          <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                                            <Video size={19} aria-hidden="true" /> الفيديوهات
                                          </h3>
                                          <button
                                            type="button"
                                            aria-label="إضافة فيديو"
                                            title="إضافة فيديو"
                                            onClick={() =>
                                              updateSelectedItem((current) => ({
                                                ...current,
                                                videos: [...current.videos, { url: '', title: '' }],
                                              }))
                                            }
                                            className={controlButton}
                                          >
                                            <Plus size={19} aria-hidden="true" />
                                          </button>
                                        </div>
                                        <div className="divide-y divide-border rounded-md border border-border bg-background px-4">
                                          {item.videos.map((video, index) => (
                                            <div
                                              key={`${item.id}-video-${index}`}
                                              className="grid gap-4 py-4 sm:grid-cols-[minmax(14rem,2fr)_minmax(12rem,1fr)_auto] sm:items-end"
                                            >
                                              <label className={labelClassName}>
                                                رابط الفيديو
                                                <input
                                                  type="url"
                                                  className={inputClassName}
                                                  value={video.url}
                                                  placeholder="https://youtu.be/..."
                                                  onChange={(event) =>
                                                    updateSelectedItem((current) => ({
                                                      ...current,
                                                      videos: current.videos.map(
                                                        (entry, currentIndex) =>
                                                          currentIndex === index
                                                            ? { ...entry, url: event.target.value }
                                                            : entry
                                                      ),
                                                    }))
                                                  }
                                                />
                                              </label>
                                              <label className={labelClassName}>
                                                عنوان الفيديو
                                                <input
                                                  className={inputClassName}
                                                  value={video.title ?? ''}
                                                  onChange={(event) =>
                                                    updateSelectedItem((current) => ({
                                                      ...current,
                                                      videos: current.videos.map(
                                                        (entry, currentIndex) =>
                                                          currentIndex === index
                                                            ? {
                                                                ...entry,
                                                                title: event.target.value,
                                                              }
                                                            : entry
                                                      ),
                                                    }))
                                                  }
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                aria-label="حذف الفيديو"
                                                title="حذف الفيديو"
                                                onClick={() =>
                                                  updateSelectedItem((current) => ({
                                                    ...current,
                                                    videos: current.videos.filter(
                                                      (_, currentIndex) => currentIndex !== index
                                                    ),
                                                  }))
                                                }
                                                className={dangerButton}
                                              >
                                                <Trash2 size={18} aria-hidden="true" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </section>

                                      <section className="space-y-3 rounded-md border border-border bg-surface p-4 sm:p-5">
                                        <div className="flex items-center justify-between gap-4">
                                          <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                                            <FileText size={19} aria-hidden="true" /> ملفات PDF
                                          </h3>
                                          <button
                                            type="button"
                                            aria-label="إضافة ملف PDF"
                                            title="إضافة ملف PDF"
                                            onClick={() =>
                                              updateSelectedItem((current) => ({
                                                ...current,
                                                pdfs: [...current.pdfs, { url: '', title: '' }],
                                              }))
                                            }
                                            className={controlButton}
                                          >
                                            <Plus size={19} aria-hidden="true" />
                                          </button>
                                        </div>
                                        <div className="divide-y divide-border rounded-md border border-border bg-background px-4">
                                          {item.pdfs.map((pdf, index) => (
                                            <div
                                              key={`${item.id}-pdf-${index}`}
                                              className="grid gap-4 py-4 sm:grid-cols-[minmax(14rem,2fr)_minmax(12rem,1fr)_auto] sm:items-end"
                                            >
                                              <label className={labelClassName}>
                                                رابط ملف PDF
                                                <input
                                                  type="url"
                                                  className={inputClassName}
                                                  value={pdf.url}
                                                  placeholder="https://..."
                                                  onChange={(event) =>
                                                    updateSelectedItem((current) => ({
                                                      ...current,
                                                      pdfs: current.pdfs.map(
                                                        (entry, currentIndex) =>
                                                          currentIndex === index
                                                            ? { ...entry, url: event.target.value }
                                                            : entry
                                                      ),
                                                    }))
                                                  }
                                                />
                                              </label>
                                              <label className={labelClassName}>
                                                اسم الملف
                                                <input
                                                  className={inputClassName}
                                                  value={pdf.title ?? ''}
                                                  onChange={(event) =>
                                                    updateSelectedItem((current) => ({
                                                      ...current,
                                                      pdfs: current.pdfs.map(
                                                        (entry, currentIndex) =>
                                                          currentIndex === index
                                                            ? {
                                                                ...entry,
                                                                title: event.target.value,
                                                              }
                                                            : entry
                                                      ),
                                                    }))
                                                  }
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                aria-label="حذف ملف PDF"
                                                title="حذف ملف PDF"
                                                onClick={() =>
                                                  updateSelectedItem((current) => ({
                                                    ...current,
                                                    pdfs: current.pdfs.filter(
                                                      (_, currentIndex) => currentIndex !== index
                                                    ),
                                                  }))
                                                }
                                                className={dangerButton}
                                              >
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

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              addLessonItem();
                            }}
                            aria-label="إضافة محتوى"
                            title="إضافة محتوى"
                            disabled={busy}
                            className={controlButton}
                          >
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

          {!busy && notice?.type === 'success' && (
            <p className="sr-only" aria-live="polite">
              <Check aria-hidden="true" /> {notice.text}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
