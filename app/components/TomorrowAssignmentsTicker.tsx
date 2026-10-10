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
      className="flex w-full max-w-full flex-col gap-2 overflow-hidden rounded-lg border border-secondary/25 bg-secondary/5 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* الصف ١: الشارة — صف كامل في الأعلى على الجوال، ومدمجة مع العنوان على الكمبيوتر */}
      <span className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-bold text-white sm:w-auto sm:justify-start">
        <ClipboardList size={17} aria-hidden="true" />
        <span>واجبات الغد</span>
      </span>

      {/* الصف ٢: عنوان الواجب — بدون أي أزرار جانبية */}
      <div
        key={assignment?.id}
        aria-live="polite"
        className="min-w-0 border-secondary/25 pb-2 sm:flex-1 sm:border-0 sm:pb-0"
      >
        {assignment ? (
          <p className="min-w-0 text-center text-sm font-semibold leading-7 text-foreground sm:text-start sm:text-base">
            {assignment.name}
          </p>
        ) : (
          <p className="min-w-0 text-center text-sm font-semibold leading-7 text-muted-foreground sm:text-start sm:text-base">
            لا توجد واجبات مطلوبة للغد.
          </p>
        )}
      </div>

      {/* الصف ٣: أزرار التنقل وزر فتح الرابط — صف موحّد أسفل البطاقة */}
      {(assignments.length > 1 || Boolean(assignment?.link)) && (
        <div className="flex shrink-0 items-center justify-center gap-1 border-t border-secondary/25 pt-2 sm:border-0 sm:pt-0">
          {assignments.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                aria-label="الواجب السابق"
                title="الواجب السابق"
                className="flex size-10 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10"
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
                className="flex size-10 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10"
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
                className="flex size-10 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10"
              >
                <ChevronLeft size={19} aria-hidden="true" />
              </button>
            </>
          )}

          {assignment?.link && (
            <a
              href={assignment.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`فتح رابط الواجب: ${assignment.name}`}
              title="عرض الواجب"
              className="flex size-10 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10"
            >
              <ExternalLink size={18} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
