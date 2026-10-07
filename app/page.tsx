import {
  ArrowRightCircle,
  Calendar,
  ClipboardList,
  ExternalLink,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import {
  getAnnouncements,
  getAssignments,
  getHomepageSlides,
  getLatestVideos,
  getSupportingActivities,
  incrementVisitorCount,
} from '../lib/content-db';
import { getAssignmentStatus } from './assignment-status';
import AnnouncementTicker from './components/AnnouncementTicker';
import HomepageComments from './components/HomepageComments';
import HomepageSlider from './components/HomepageSlider';
import LatestVideosSlider from './components/LatestVideosSlider';
import TomorrowAssignmentsTicker from './components/TomorrowAssignmentsTicker';

function formatDate(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'long' }).format(value);
}

function getCurrentTime() {
  return Date.now();
}

function getTomorrowInAlgiers() {
  const dateParts = new Intl.DateTimeFormat('en', {
    timeZone: 'Africa/Algiers',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(getCurrentTime()));
  const part = (type: 'year' | 'month' | 'day') =>
    dateParts.find((value) => value.type === type)?.value ?? '';
  const algiersToday = `${part('year')}-${part('month')}-${part('day')}`;
  const tomorrow = new Date(`${algiersToday}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

type SectionTitleCardProps = {
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  tone?: 'primary' | 'secondary';
  id: string;
};

function SectionTitleCard({
  title,
  description,
  badge,
  icon: Icon,
  tone = 'primary',
  id,
}: SectionTitleCardProps) {
  const toneClasses =
    tone === 'secondary'
      ? 'bg-secondary text-white shadow-secondary/20'
      : 'bg-primary text-white shadow-primary/20';
  const badgeClasses =
    tone === 'secondary'
      ? 'border-secondary/20 bg-secondary/10 text-secondary'
      : 'border-primary/20 bg-primary/10 text-primary';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/60 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-lg ${toneClasses}`}
          aria-hidden="true"
        >
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <h2 id={id} className="truncate text-lg font-black text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
            {description}
          </p>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold sm:text-sm ${badgeClasses}`}
      >
        {badge}
      </span>
    </header>
  );
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    await incrementVisitorCount();
  } catch (error) {
    console.error('تعذر تسجيل زيارة الموقع:', error);
  }

  const [
    allAssignments,
    supportingActivities,
    announcements,
    homepageSlides,
    latestVideos,
  ] = await Promise.all([
    getAssignments(),
    getSupportingActivities(),
    getAnnouncements(),
    getHomepageSlides(),
    getLatestVideos(),
  ]);

  const assignments = [...allAssignments].sort((a, b) => {
    const dateA = new Date(`${a.assignedDate}T00:00:00Z`).getTime();
    const dateB = new Date(`${b.assignedDate}T00:00:00Z`).getTime();
    return dateB - dateA;
  });
  const today = new Date(getCurrentTime()).toISOString().slice(0, 10);
  const todayAt = Date.parse(`${today}T00:00:00Z`);
  const tomorrowInAlgiers = getTomorrowInAlgiers();
  const tomorrowAssignments = assignments.filter(
    (assignment) => assignment.completed !== true && assignment.submissionDate === tomorrowInAlgiers
  );

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-background text-foreground font-sans"
      dir="rtl"
    >
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 overflow-x-hidden px-4 py-6 sm:gap-10 sm:px-6 sm:py-10">
        <section className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-accent p-6 text-white shadow-2xl transition-all hover:shadow-primary/10 sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-pattern opacity-20 transition-opacity group-hover:opacity-30" />
          <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={16} aria-hidden="true" />
              <span>فضاء التعليم الابتدائي</span>
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">
              أهلاً بكم في الفضاء التعليمي لقسم السنة الرابعة
            </h1>
            <p className="text-sm font-medium leading-relaxed text-surface-muted/90 sm:text-base">
              منصة مخصصة للتلاميذ وأولياء الأمور، تجدون فيها ملخصات الدروس اليومية، الواجبات
              المنزلية، والأنشطة الداعمة للتعلم والمراجعة.
            </p>
          </div>
        </section>

        <AnnouncementTicker
          announcements={announcements.filter((announcement) => announcement.active)}
        />

        <TomorrowAssignmentsTicker assignments={tomorrowAssignments} />

        <section
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
          aria-labelledby="assignments-title"
        >
          <SectionTitleCard
            id="assignments-title"
            title="الواجبات المنزلية"
            description="تابع آخر المهام والواجبات المدرسية"
            badge={`${assignments.length} واجبات`}
            icon={ClipboardList}
          />

          <div className="hidden grid-cols-1 border-b border-border/50 bg-surface-muted/20 px-6 py-4 text-sm font-bold uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_160px_160px] md:gap-6">
            <div className="flex items-center gap-2">
              <span>اسم الواجب</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Calendar size={14} aria-hidden="true" />
              <span>تاريخ التكليف</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Calendar size={14} aria-hidden="true" />
              <span>آخر أجل للتسليم</span>
            </div>
          </div>

          {assignments.length > 0 ? (
            <ul className="content-list-scroll assignment-list-scroll divide-y divide-border/60 overflow-y-auto overscroll-contain">
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
                    className="group grid grid-cols-1 gap-3 px-4 py-4 transition-all hover:bg-primary/[0.02] sm:px-6 sm:py-5 md:grid-cols-[minmax(0,1fr)_160px_160px] md:items-center md:gap-6"
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary shadow-sm transition-transform group-hover:scale-110 sm:size-10">
                        <ArrowRightCircle size={18} aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status === 'completed' ? 'border border-green-200 bg-green-100 text-green-700' : 'border border-red-200 bg-red-100 text-red-700'}`}
                          >
                            {status === 'completed'
                              ? 'منتهي'
                              : status === 'overdue'
                                ? 'متأخر'
                                : 'مطلوب'}
                          </span>
                          {index === 0 && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              الأحدث
                            </span>
                          )}
                        </div>
                        <p className="truncate text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
                          {assignment.name}
                        </p>
                      </div>
                      {isNewAssignment && (
                        <span className="new-assignment-badge shrink-0 rounded-full border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-foreground shadow-sm shadow-secondary/30">
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
                          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary shadow-sm transition-all hover:bg-secondary hover:text-white sm:size-10"
                        >
                          <ExternalLink aria-hidden="true" size={17} />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground sm:text-center sm:text-sm">
                      <span className="mb-0.5 block text-[10px] font-bold uppercase text-accent sm:hidden">
                        تاريخ التكليف
                      </span>
                      <span className="font-medium">{formatDate(assignment.assignedDate)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground sm:text-center sm:text-sm">
                      <span className="mb-0.5 block text-[10px] font-bold uppercase text-accent sm:hidden">
                        آخر أجل للتسليم
                      </span>
                      <span className="font-medium">{formatDate(assignment.submissionDate)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-surface-muted">
                <ClipboardList size={32} className="text-muted-foreground/40" aria-hidden="true" />
              </div>
              <p className="text-base font-medium text-muted-foreground">
                لا توجد واجبات مسجلة حالياً. استمتع بوقتك!
              </p>
            </div>
          )}
        </section>

        <section
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
          aria-labelledby="supporting-activities-title"
        >
          <SectionTitleCard
            id="supporting-activities-title"
            title="أنشطة داعمة"
            description="أنشطة إضافية للمراجعة والتدرب"
            badge={`${supportingActivities.length} أنشطة`}
            icon={Sparkles}
            tone="secondary"
          />

          {supportingActivities.length > 0 ? (
            <ul className="content-list-scroll max-h-none divide-y divide-border/60 overflow-y-auto overscroll-contain sm:max-h-[42rem]">
              {supportingActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-4 transition-colors hover:bg-surface-muted/5 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-5"
                >
                  <ArrowRightCircle
                    size={18}
                    className="shrink-0 text-secondary/60"
                    aria-hidden="true"
                  />
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${activity.completed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}
                  >
                    {activity.completed ? 'منجز' : 'للتدرب'}
                  </span>
                  <p className="order-last w-full min-w-0 text-base font-bold leading-tight text-foreground sm:order-none sm:flex-1 sm:text-lg">
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
                <Sparkles size={38} className="text-muted-foreground/40" aria-hidden="true" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                لا توجد أنشطة داعمة مسجلة حالياً.
              </p>
            </div>
          )}
        </section>

        <HomepageSlider slides={homepageSlides.filter((slide) => slide.active)} />

        {latestVideos.length > 0 && <LatestVideosSlider videos={latestVideos} />}

        {/* {latestMindMaps.length > 0 && <LatestMindMapsSlider maps={latestMindMaps} />} */}

        <HomepageComments />
      </main>

      <footer className="mt-16 border-t border-border bg-surface py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-5xl space-y-2 px-6">
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
