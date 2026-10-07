'use client';

import { BookOpen, ChevronDown, Info, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import LessonItemCard, { type LessonItem } from '../components/LessonItemCard';
import Sidebar, { subjects } from '../components/Sidebar';

type Lesson = {
  id: string;
  title: string;
  items: LessonItem[];
};

type SubjectLessons = {
  lessons: Lesson[];
};

type SubjectId = (typeof subjects)[number]['id'];

type LessonsExplorerProps = {
  lessonsBySubject: Record<SubjectId, SubjectLessons>;
};

export default function LessonsExplorer({ lessonsBySubject }: LessonsExplorerProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [navigationTargetId, setNavigationTargetId] = useState<string | null>(null);

  useEffect(() => {
    function openSectionFromHash() {
      const params = new URLSearchParams(window.location.search);
      const requestedSubjectId = params.get('subject');
      const requestedLessonId = params.get('lesson');

      if (requestedSubjectId && requestedLessonId) {
        const subject = subjects.find((candidate) => candidate.id === requestedSubjectId);
        const lesson = subject
          ? lessonsBySubject[subject.id]?.lessons.find(
              (candidate) => candidate.id === requestedLessonId
            )
          : null;

        if (subject && lesson) {
          const targetId = `lesson-${subject.id}-${lesson.id}`;
          setSelectedSubjectId(subject.id);
          setExpandedLessonId(lesson.id);
          setNavigationTargetId(targetId);
          return;
        }
      }

      const anchorId = window.location.hash.slice(1);
      if (!anchorId) return;

      for (const subject of subjects) {
        for (const lesson of lessonsBySubject[subject.id]?.lessons ?? []) {
          for (const item of lesson.items) {
            const anchorBaseId = `${subject.id}-${lesson.id}-${item.id}`;
            const sectionIds = [
              item.summary ? `${anchorBaseId}-summary` : null,
              item.activities?.length ? `${anchorBaseId}-activities` : null,
              ...(item.images ?? []).map((_, index) => `${anchorBaseId}-image-${index}`),
              ...(item.pdfs ?? []).map((_, index) => `${anchorBaseId}-pdf-${index}`),
            ];

            if (!sectionIds.includes(anchorId)) continue;

            setSelectedSubjectId(subject.id);
            setExpandedLessonId(lesson.id);
            setExpandedCardId(item.id);
            setNavigationTargetId(anchorId);
            return;
          }
        }
      }
    }

    openSectionFromHash();
    const initialFrame = window.requestAnimationFrame(openSectionFromHash);
    window.addEventListener('hashchange', openSectionFromHash);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener('hashchange', openSectionFromHash);
    };
  }, [lessonsBySubject]);

  useEffect(() => {
    if (!navigationTargetId) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(navigationTargetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [expandedCardId, expandedLessonId, navigationTargetId, selectedSubjectId]);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
  const lessons = selectedSubjectId ? lessonsBySubject[selectedSubjectId].lessons : [];

  function selectSubject(subjectId: SubjectId) {
    setSelectedSubjectId(subjectId);
    setExpandedLessonId(null);
    setExpandedCardId(null);
  }

  return (
    <div className="mx-auto max-w-6xl w-full max-w-full px-3 py-4 sm:px-6 sm:py-8 overflow-x-hidden">
      <div className="flex w-full min-w-0 max-w-full flex-col items-start gap-4 sm:gap-5 md:flex-row">
        <Sidebar selectedSubjectId={selectedSubjectId} onSelectSubject={selectSubject} />

        <main className="min-h-[24rem] w-full min-w-0 flex-1 rounded-2xl border border-border bg-surface p-3.5 shadow-md sm:min-h-[45rem] sm:p-8">
          <header className="mb-5 rounded-2xl border border-border bg-background/70 p-4 shadow-sm sm:mb-8 sm:p-5">
            <h1 className="flex min-w-0 items-center gap-2 text-xl font-black text-foreground sm:gap-3 sm:text-2xl">
              {selectedSubject ? (
                <>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                    <BookOpen size={23} />
                  </span>
                  <span className="truncate">دروس {selectedSubject.name}</span>
                </>
              ) : (
                <>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-muted-foreground shadow-inner">
                    <Layers size={23} />
                  </span>
                  <span className="truncate">استكشاف الدروس</span>
                </>
              )}
            </h1>
          </header>

          {!selectedSubject ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-20 rounded-full bg-surface-muted flex items-center justify-center mb-6">
                <Info size={40} className="text-muted-foreground/30" />
              </div>
              <p className="text-lg font-bold text-muted-foreground max-w-xs mx-auto">
                اختر مادة من القائمة الجانبية لعرض الدروس والملخصات المتاحة
              </p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border px-4 py-16 text-center">
              <p className="text-lg font-bold text-muted-foreground">
                لا توجد دروس مضافة لهذه المادة حالياً.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => {
                const isExpanded = expandedLessonId === lesson.id;
                const hasContent = lesson.items.length > 0;
                const contentId = `${selectedSubject.id}-${lesson.id}-content`;

                return (
                  <section
                    id={`lesson-${selectedSubject.id}-${lesson.id}`}
                    key={lesson.id}
                    className="overflow-hidden rounded-2xl border border-border bg-background transition-all hover:shadow-md"
                  >
                    <h2>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={contentId}
                        onClick={() => {
                          setExpandedLessonId(isExpanded ? null : lesson.id);
                          setExpandedCardId(null);
                          setNavigationTargetId(null);
                        }}
                        className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-right font-bold transition-colors sm:px-5 ${
                          isExpanded
                            ? 'bg-primary text-white'
                            : 'bg-surface text-foreground hover:bg-surface-muted/50'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${isExpanded ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'}`}
                          >
                            <BookOpen size={18} />
                          </span>
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'opacity-50'}`}
                        />
                      </button>
                    </h2>

                    {isExpanded && (
                      <div id={contentId} className="space-y-3 px-3 pb-5 pt-2">
                        {lesson.items.map((item) => (
                          <LessonItemCard
                            key={item.id}
                            item={item}
                            lessonTitle={lesson.title}
                            subjectId={selectedSubject.id}
                            lessonId={lesson.id}
                            contentId={`${selectedSubject.id}-${lesson.id}-${item.id}-content`}
                            anchorBaseId={`${selectedSubject.id}-${lesson.id}-${item.id}`}
                            navigationTargetId={navigationTargetId}
                            onClearNavigationTarget={() => setNavigationTargetId(null)}
                            isCollapsible={lesson.items.length > 1}
                            isExpanded={expandedCardId === item.id}
                            onToggle={() => {
                              setExpandedCardId(expandedCardId === item.id ? null : item.id);
                              setNavigationTargetId(null);
                            }}
                          />
                        ))}

                        {!hasContent && (
                          <p className="text-sm text-muted-foreground">
                            لم يضف محتوى لهذا الدرس بعد.
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
