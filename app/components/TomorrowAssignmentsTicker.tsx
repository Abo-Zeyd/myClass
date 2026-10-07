'use client';

import { ChevronLeft, ChevronRight, ClipboardList, ExternalLink, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

type Assignment = {
  id: string;
  name: string;
  link?: string;
};

export default function TomorrowAssignmentsTicker({ assignments }: { assignments: Assignment[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (assignments.length < 2 || isPaused || isHovered) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % assignments.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [assignments.length, isHovered, isPaused]);

  const assignment = assignments[activeIndex % assignments.length];

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + assignments.length) % assignments.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % assignments.length);
  }

  return (
    <section
      aria-label="واجبات الغد"
      className="flex min-h-16 w-full max-w-full overflow-hidden items-center gap-3 rounded-lg border border-secondary/25 bg-secondary/5 px-3 py-3 sm:gap-4 sm:px-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-bold text-white">
        <ClipboardList size={17} aria-hidden="true" />
        <span>واجبات الغد</span>
      </span>
      {assignment ? (
        <div
          key={assignment.id}
          aria-live="polite"
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <p className="min-w-0 flex-1 text-sm font-semibold leading-7 text-foreground sm:text-base">
            {assignment.name}
          </p>
          {assignment.link && (
            <a
              href={assignment.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`فتح رابط الواجب: ${assignment.name}`}
              title="عرض الواجب"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10"
            >
              <ExternalLink size={17} aria-hidden="true" />
            </a>
          )}
        </div>
      ) : (
        <p
          aria-live="polite"
          className="min-w-0 flex-1 text-sm font-semibold leading-7 text-muted-foreground sm:text-base"
        >
          لا توجد واجبات مطلوبة للغد.
        </p>
      )}
      {assignments.length > 1 && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="الواجب السابق"
            title="الواجب السابق"
            className="flex size-9 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10"
          >
            <ChevronRight size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={
              isPaused ? 'تشغيل التنقل التلقائي للواجبات' : 'إيقاف التنقل التلقائي للواجبات'
            }
            title={isPaused ? 'تشغيل' : 'إيقاف مؤقت'}
            className="flex size-9 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10"
          >
            {isPaused ? (
              <Play size={16} aria-hidden="true" />
            ) : (
              <Pause size={16} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="الواجب التالي"
            title="الواجب التالي"
            className="flex size-9 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10"
          >
            <ChevronLeft size={19} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
