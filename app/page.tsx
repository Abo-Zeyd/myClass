import {
  getAnnouncements,
  getAssignments,
  getHomepageSlides,
  getLatestVideos,
  getSupportingActivities,
  incrementVisitorCount,
} from '../lib/content-db';
import AnnouncementTicker from './components/AnnouncementTicker';
import AssignmentsSection from './components/AssignmentsSection';
import HomepageComments from './components/HomepageComments';
import HomepageFooter from './components/HomepageFooter';
import HomepageHero from './components/HomepageHero';
import HomepageSlider from './components/HomepageSlider';
import LatestVideosSlider from './components/LatestVideosSlider';
import SupportingActivitiesSection from './components/SupportingActivitiesSection';
import TomorrowAssignmentsTicker from './components/TomorrowAssignmentsTicker';
import WeeklyTimetable from './components/WeeklyTimetable';

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

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    await incrementVisitorCount();
  } catch (error) {
    console.error('تعذر تسجيل زيارة الموقع:', error);
  }

  const [allAssignments, supportingActivities, announcements, homepageSlides, latestVideos] =
    await Promise.all([
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
        <HomepageHero />

        <AnnouncementTicker
          announcements={announcements.filter((announcement) => announcement.active)}
        />

        <TomorrowAssignmentsTicker assignments={tomorrowAssignments} />

        <AssignmentsSection
          assignments={assignments}
          todayAt={todayAt}
          tomorrowDate={tomorrowInAlgiers}
        />

        <SupportingActivitiesSection activities={supportingActivities} />

        <section aria-labelledby="timetable-title" className="flex flex-col gap-4">
          <div>
            <h2 id="timetable-title" className="text-xl font-bold text-foreground">
              التوزيع الزمني
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              جدول الحصص الأسبوعي للفترة الصباحية والمسائية
            </p>
          </div>
          <WeeklyTimetable />
        </section>

        <HomepageSlider slides={homepageSlides.filter((slide) => slide.active)} />

        {latestVideos.length > 0 && <LatestVideosSlider videos={latestVideos} showAllVideosLink />}

        {/* {latestMindMaps.length > 0 && <LatestMindMapsSlider maps={latestMindMaps} />} */}

        <HomepageComments />
      </main>

      <HomepageFooter year={new Date().getFullYear()} />
    </div>
  );
}
