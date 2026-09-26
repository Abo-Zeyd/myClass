"use client";

import { useEffect, useState } from "react";
import arabicLessons from "../../data/lessons/arabic.json";
import civicEducationLessons from "../../data/lessons/civic-education.json";
import geographyLessons from "../../data/lessons/geography.json";
import historyLessons from "../../data/lessons/history.json";
import islamicEducationLessons from "../../data/lessons/islamic-education.json";
import mathematicsLessons from "../../data/lessons/mathematics.json";
import memorizationLessons from "../../data/lessons/memorization.json";
import scienceLessons from "../../data/lessons/science.json";
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

const lessonsBySubject: Record<SubjectId, SubjectLessons> = {
  "islamic-education": islamicEducationLessons,
  arabic: arabicLessons,
  mathematics: mathematicsLessons,
  history: historyLessons,
  geography: geographyLessons,
  "civic-education": civicEducationLessons,
  science: scienceLessons,
  memorization: memorizationLessons,
};

export default function LessonsPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [navigationTargetId, setNavigationTargetId] = useState<string | null>(null);

  useEffect(() => {
    function openSectionFromHash() {
      const anchorId = window.location.hash.slice(1);
      if (!anchorId) return;

      for (const subject of subjects) {
        for (const lesson of lessonsBySubject[subject.id].lessons) {
          for (const item of lesson.items) {
            const anchorBaseId = `${subject.id}-${lesson.id}-${item.id}`;
            const sectionIds = [
              item.summary ? `${anchorBaseId}-summary` : null,
              item.activities?.length ? `${anchorBaseId}-activities` : null,
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
    window.addEventListener("hashchange", openSectionFromHash);
    return () => window.removeEventListener("hashchange", openSectionFromHash);
  }, []);

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

        <main className="min-h-112.5 w-full flex-1 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="mb-5 text-xl font-bold text-foreground">
            {selectedSubject ? `دروس ${selectedSubject.name}` : "الدروس"}
          </h1>

          {!selectedSubject ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              اختر مادة من القائمة لعرض دروسها.
            </p>
          ) : lessons.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              لا توجد دروس مضافة لهذه المادة حالياً.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {lessons.map((lesson) => {
                const isExpanded = expandedLessonId === lesson.id;
                const hasContent = lesson.items.length > 0;
                const contentId = `${selectedSubject.id}-${lesson.id}-content`;

                return (
                  <section key={lesson.id} className="py-2 first:pt-0 last:pb-0">
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
                        className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-4 text-right font-semibold text-foreground transition-colors hover:bg-surface-muted/50"
                      >
                        <span>{lesson.title}</span>
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-lg text-primary"
                        >
                          {isExpanded ? "−" : "+"}
                        </span>
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