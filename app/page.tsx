import { ArrowRightCircle, Calendar, ClipboardList, ExternalLink, Sparkles } from 'lucide-react';
import {
  getAnnouncements,
  getAssignments,
  getHomepageSlides,
  getLatestVideos,
  getSupportingActivities,
} from '../lib/content-db';
import { getAssignmentStatus } from './assignment-status';
import AnnouncementTicker from './components/AnnouncementTicker';
import HomepageComments from './components/HomepageComments';
import HomepageSlider from './components/HomepageSlider';
import LatestVideosSlider from './components/LatestVideosSlider';

function formatDate(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'long' }).format(value);
}

function getCurrentTime() {
  return Date.now();
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [allAssignments, supportingActivities, announcements, homepageSlides, latestVideos] =
    await Promise.all([
      getAssignments(),
      getSupportingActivities(),
      getAnnouncements(),
      getHomepageSlides(),
      getLatestVideos(),
    ]);

  // ترتيب الواجبات بحسب التاريخ (من الأحدث إلى الأقدم)
  const assignments = [...allAssignments].sort((a, b) => {
    const dateA = new Date(`${a.assignedDate}T00:00:00Z`).getTime();
    const dateB = new Date(`${b.assignedDate}T00:00:00Z`).getTime();
    return dateB - dateA;
  });
  const today = new Date(getCurrentTime()).toISOString().slice(0, 10);
  const todayAt = Date.parse(`${today}T00:00:00Z`);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-16 flex flex-col gap-8 sm:gap-16 animate-in fade-in duration-700">
        {/* بطاقة الترحيب */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-accent p-10 sm:p-16 text-white shadow-2xl transition-all hover:shadow-primary/10 group">
          <div className="absolute inset-0 bg-pattern pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-2">
              <Sparkles size={16} />
              <span>فضاء التعليم الابتدائي</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              أهلاً بكم في الفضاء التعليمي لقسم السنة الرابعة
            </h2>
            <p className="text-surface-muted/90 text-lg sm:text-xl leading-relaxed font-medium">
              منصة مخصصة لتلاميذ وأولياء أمور قسم السنة الرابعة، تجدون فيها ملخصات الدروس اليومية،
              الواجبات المنزلية، والأنشطة الداعمة لنتعلم ونتفوق معاً.
            </p>
          </div>
          {/* لمسات جمالية في الخلفية */}
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </section>

        <AnnouncementTicker
          announcements={announcements.filter((announcement) => announcement.active)}
        />

        <section
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
          aria-labelledby="assignments-title"
        >
          <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-muted/30 px-6 py-6">
            <div className="flex items-center gap-4">
              <span
                className="flex size-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
                aria-hidden="true"
              >
                <ClipboardList size={24} />
              </span>
              <div>
                <h2 id="assignments-title" className="text-xl font-bold text-foreground">
                  الواجبات المنزلية
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  تابع آخر المهام والواجبات المدرسية
                </p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary border border-primary/20">
              {assignments.length} واجبات
            </span>
          </header>

          <div className="hidden grid-cols-1 bg-surface-muted/20 px-6 py-4 text-sm font-bold text-muted-foreground tracking-wide sm:grid sm:grid-cols-[minmax(0,1fr)_180px_180px] sm:gap-6 uppercase border-b border-border/50">
            <div className="flex items-center gap-2">
              <span>اسم الواجب</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Calendar size={14} />
              <span>تاريخ التكليف</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Calendar size={14} />
              <span>آخر أجل للتسليم</span>
            </div>
          </div>

          {assignments.length > 0 ? (
            <ul className="content-list-scroll assignment-list-scroll overflow-y-auto overscroll-contain divide-y divide-border/60">
              {assignments.map((assignment, index) => {
                const status = getAssignmentStatus(
                  assignment.completed === true,
                  assignment.submissionDate
                );
                const assignedAt = Date.parse(`${assignment.assignedDate}T00:00:00Z`);
                const assignmentAge = todayAt - assignedAt;
                const isNewAssignment = assignmentAge >= 0 && assignmentAge <= 24 * 60 * 60 * 1000;

                return (
                  <li
                    key={assignment.id}
                    className="grid grid-cols-1 gap-4 px-6 py-6 transition-all hover:bg-primary/[0.02] sm:grid-cols-[minmax(0,1fr)_180px_180px] sm:items-center sm:gap-6 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-surface-muted flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                        <ArrowRightCircle size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}
                          >
                            {status === 'completed'
                              ? 'منتهي'
                              : status === 'overdue'
                                ? 'متأخر'
                                : 'مطلوب'}
                          </span>
                          {index === 0 && (
                            <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                              الأحدث
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors truncate">
                          {assignment.name}
                        </p>
                      </div>
                      {isNewAssignment && (
                        <span className="new-assignment-badge shrink-0 rounded-full border border-primary/20 px-2.5 py-1 text-xs font-bold text-foreground shadow-sm shadow-secondary/30">
                          جديد
                        </span>
                      )}
                      {assignment.link && (
                        <a
                          href={assignment.link}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`فتح رابط الواجب: ${assignment.name}`}
                          title="عرض الملف"
                          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-all hover:bg-secondary hover:text-white shadow-sm"
                        >
                          <ExternalLink aria-hidden="true" size={18} />
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-center">
                      <span className="mb-1 block text-[10px] font-bold text-accent sm:hidden uppercase">
                        تاريخ التكليف
                      </span>
                      <span className="font-medium">{formatDate(assignment.assignedDate)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-center">
                      <span className="mb-1 block text-[10px] font-bold text-accent sm:hidden uppercase">
                        آخر أجل للتسليم
                      </span>
                      <span className="font-medium">{formatDate(assignment.submissionDate)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="size-20 rounded-full bg-surface-muted flex items-center justify-center mb-4">
                <ClipboardList size={40} className="text-muted-foreground/40" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                لا توجد واجبات مسجلة حاليا. استمتع بوقتك!
              </p>
            </div>
          )}
        </section>

        <section
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
          aria-labelledby="supporting-activities-title"
        >
          <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-muted/30 px-6 py-6">
            <div className="flex items-center gap-4">
              <span
                className="flex size-12 items-center justify-center rounded-xl bg-secondary text-white shadow-lg shadow-secondary/20"
                aria-hidden="true"
              >
                <Sparkles size={23} />
              </span>
              <div>
                <h2 id="supporting-activities-title" className="text-xl font-bold text-foreground">
                  أنشطة داعمة
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  أنشطة إضافية للمراجعة والتدرب
                </p>
              </div>
            </div>
            <span className="rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-sm font-bold text-secondary">
              {supportingActivities.length} أنشطة
            </span>
          </header>

          {supportingActivities.length > 0 ? (
            <ul className="content-list-scroll max-h-[42rem] overflow-y-auto overscroll-contain divide-y divide-border/60">
              {supportingActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-surface-muted/5"
                >
                  <ArrowRightCircle size={18} className="shrink-0 text-secondary/60" />
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${activity.completed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}
                  >
                    {activity.completed ? 'منجز' : 'للتدرب'}
                  </span>
                  <p className="min-w-0 flex-1 font-bold text-lg leading-tight text-foreground">
                    {activity.name}
                  </p>
                  {activity.link && (
                    <a
                      href={activity.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`فتح رابط النشاط: ${activity.name}`}
                      title="عرض النشاط"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-all hover:bg-secondary hover:text-white"
                    >
                      <ExternalLink aria-hidden="true" size={18} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-surface-muted">
                <Sparkles size={38} className="text-muted-foreground/40" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                لا توجد أنشطة داعمة مسجلة حاليا.
              </p>
            </div>
          )}
        </section>

        <HomepageSlider slides={homepageSlides.filter((slide) => slide.active)} />

        {latestVideos.length > 0 && <LatestVideosSlider videos={latestVideos} />}

        <HomepageComments />
      </main>

      {/* التذييل / الفوتر */}
      <footer className="mt-16 border-t border-border bg-surface py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-5xl mx-auto px-6 space-y-2">
          <p>
            © {new Date().getFullYear()} قسم السنة الرابعة - الأستاذ عز الدين عويسي. جميع الحقوق
            محفوظة.
          </p>
          <p className="text-xs text-muted-foreground">
            منصة تعليمية لدعم وتوجيه تلاميذ التعليم الابتدائي
          </p>
        </div>
      </footer>
    </div>
  );
}
