import { FileVideo } from 'lucide-react';
import { getAllLessons } from '../../lib/content-db';
import LatestVideosSlider, { type LatestVideoSlide } from '../components/LatestVideosSlider';
import { subjects } from '../components/Sidebar';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  const lessonsBySubject = await getAllLessons();
  const subjectVideos = subjects
    .map((subject) => {
      const videos = (lessonsBySubject[subject.id]?.lessons ?? []).flatMap((lesson) =>
        lesson.items.flatMap((item) =>
          item.videos.map((video, index): LatestVideoSlide => ({
            id: JSON.stringify([subject.id, lesson.id, item.id, index, video.url]),
            subjectId: subject.id,
            lessonId: lesson.id,
            title: video.title || item.title || lesson.title,
            url: video.url,
            lessonTitle: [lesson.title, item.title].filter(Boolean).join(' • '),
          }))
        )
      );

      return { subject, videos };
    })
    .filter(({ videos }) => videos.length > 0);
  const totalVideos = subjectVideos.reduce((total, { videos }) => total + videos.length, 0);

  return (
    <main dir="rtl" className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
      <header className="mb-5 rounded-2xl border border-border bg-surface p-4 shadow-md sm:mb-8 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 sm:size-12">
              <FileVideo size={23} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-foreground sm:text-2xl">
                فيديوهات حسب المادة
              </h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                شاهد فيديوهات الدروس مرتبة حسب المواد الدراسية
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary">
            {totalVideos} فيديو
          </span>
        </div>
      </header>

      {subjectVideos.length > 0 ? (
        <div className="space-y-6 sm:space-y-8">
          {subjectVideos.map(({ subject, videos }) => (
            <LatestVideosSlider
              key={subject.id}
              videos={videos}
              title={`فيديوهات ${subject.name}`}
              description={`مقاطع تعليمية من دروس مادة ${subject.name}`}
              headingId={`videos-heading-${subject.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-border bg-surface px-4 py-16 text-center sm:py-20">
          <FileVideo
            size={40}
            className="mx-auto mb-4 text-muted-foreground/40"
            aria-hidden="true"
          />
          <p className="text-base font-bold text-muted-foreground sm:text-lg">
            لا توجد فيديوهات مضافة حالياً.
          </p>
        </div>
      )}
    </main>
  );
}
