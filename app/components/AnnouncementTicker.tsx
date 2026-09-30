"use client";

import { BellRing, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  message: string;
};

export default function AnnouncementTicker({ announcements }: { announcements: Announcement[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (announcements.length < 2 || isPaused || isHovered) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % announcements.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [announcements.length, isHovered, isPaused]);

  if (announcements.length === 0) return null;

  const announcement = announcements[activeIndex % announcements.length];

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + announcements.length) % announcements.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % announcements.length);
  }

  return (
    <section
      aria-label="تنبيهات القسم"
      className="flex min-h-16 items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3 sm:gap-4 sm:px-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-bold text-white">
        <BellRing size={17} aria-hidden="true" />
        <span>تنبيه</span>
      </span>
      <p key={announcement.id} aria-live="polite" className="min-w-0 flex-1 text-sm font-semibold leading-7 text-foreground sm:text-base">
        {announcement.message}
      </p>
      {announcements.length > 1 && (
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={showPrevious} aria-label="التنبيه السابق" title="التنبيه السابق" className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10">
            <ChevronRight size={19} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? "تشغيل التنبيهات تلقائياً" : "إيقاف التنبيهات مؤقتاً"} title={isPaused ? "تشغيل" : "إيقاف مؤقت"} className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10">
            {isPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>
          <button type="button" onClick={showNext} aria-label="التنبيه التالي" title="التنبيه التالي" className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10">
            <ChevronLeft size={19} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}