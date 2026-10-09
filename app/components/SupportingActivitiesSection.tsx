import { ArrowRightCircle, ExternalLink, Sparkles } from 'lucide-react';
import type { SupportingActivity } from '../../lib/content-db';
import SectionTitleCard from './SectionTitleCard';

export default function SupportingActivitiesSection({
  activities,
}: {
  activities: SupportingActivity[];
}) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
      aria-labelledby="supporting-activities-title"
    >
      <SectionTitleCard
        id="supporting-activities-title"
        title="أنشطة داعمة"
        description="أنشطة إضافية للمراجعة والتدرب"
        badge={`${activities.length} أنشطة`}
        icon={Sparkles}
        tone="secondary"
      />

      {activities.length > 0 ? (
        <ul className="content-list-scroll max-h-none divide-y divide-border/60 overflow-y-auto overscroll-contain sm:max-h-[42rem]">
          {activities.map((activity) => (
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
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${activity.completed ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}
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
  );
}
