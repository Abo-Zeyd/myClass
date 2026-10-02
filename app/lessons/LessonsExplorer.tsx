"use client";

import { useEffect, useState } from "react";
import { ChevronDown, BookOpen, Layers, Info } from "lucide-react";
import LessonItemCard, { type LessonItem } from "../components/LessonItemCard";
import Sidebar, { subjects } from "../components/Sidebar";


type Lesson = {
  id: string;
  title: string;
  items: LessonItem[];
};

type SubjectLessons = {
  lessons: Lesson[];
};

type SubjectId = (typeof subjects)[number]["id"];

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
    window.addEventListener("hashchange", openSectionFromHash);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("hashchange", openSectionFromHash);
    };
  }, [lessonsBySubject]);

  useEffect(() => {
    if (!navigationTargetId) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(navigationTargetId)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col items-start gap-6 md:flex-row">
        <Sidebar
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={selectSubject}
        />

        <main className="min-h-[45rem] w-full flex-1 rounded-2xl border border-border bg-surface p-4 shadow-md sm:p-8">
          <header className="mb-8 border-b border-border pb-6">
            <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
              {selectedSubject ? (
                <>
                  <span className="p-2 bg-primary/10 rounded-xl text-primary">
                    <BookOpen size={24} />
                  </span>
                  دروس {selectedSubject.name}
                </>
              ) : (
                <>
                  <span className="p-2 bg-surface-muted rounded-xl text-muted-foreground">
                    <Layers size={24} />
                  </span>
                  استكشاف الدروس
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
                  <section key={lesson.id} className="overflow-hidden rounded-xl border border-border bg-background transition-all hover:shadow-sm">
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
                        className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-right font-bold transition-colors ${
                          isExpanded ? "bg-primary text-white" : "text-foreground hover:bg-surface-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isExpanded ? "text-white/80" : "text-primary/60"}>
                            <BookOpen size={18} />
                          </span>
                          <span>{lesson.title}</span>
                        </div>
                        <ChevronDown 
                          size={20} 
                          className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "opacity-50"}`} 
                        />
                      </button>
                    </h2>


                    {isExpanded && (
                      <div
                        id={contentId}
                        className="space-y-3 px-3 pb-5 pt-2"
                      >
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
                            onToggle={() =>
                              {
                                setExpandedCardId(
                                  expandedCardId === item.id ? null : item.id,
                                );
                                setNavigationTargetId(null);
                              }
                            }
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