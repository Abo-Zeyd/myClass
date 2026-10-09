import { ArrowRightCircle, Calendar, ClipboardList, ExternalLink } from 'lucide-react';
import type { Assignment } from '../../lib/content-db';
import { getAssignmentStatus } from '../assignment-status';
import SectionTitleCard from './SectionTitleCard';

const dateFormatter = new Intl.DateTimeFormat('ar-DZ', {
  timeZone: 'Africa/Algiers',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function formatDate(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(value.getTime()) ? date : dateFormatter.format(value);
}

function getSubmissionTime(date: string) {
  const value = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value;
}

export default function AssignmentsSection({
  assignments,
  todayAt,
  tomorrowDate,
}: {
  assignments: Assignment[];
  todayAt: number;
  tomorrowDate: string;
}) {
  const sortedAssignments = [...assignments].sort(
    (a, b) => getSubmissionTime(a.submissionDate) - getSubmissionTime(b.submissionDate)
  );
  const newestAssignmentId = assignments[0]?.id;

  return (
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
          {sortedAssignments.map((assignment) => {
            const status = getAssignmentStatus(
              assignment.completed === true,
              assignment.submissionDate
            );
            const submissionDateClasses =
              status === 'completed'
                ? 'border-success/30 bg-success-light text-success ring-1 ring-success/20'
                : status === 'overdue'
                  ? 'border-error/30 bg-error-light text-error ring-1 ring-error/20'
                  : 'border-secondary/50 bg-secondary/10 text-primary ring-1 ring-secondary/20';
            const assignedAt = Date.parse(`${assignment.assignedDate}T00:00:00Z`);
            const assignmentAge = todayAt - assignedAt;
            const isNewAssignment = assignmentAge >= 0 && assignmentAge <= 24 * 60 * 60 * 1000;
            const isDueTomorrow =
              !assignment.completed && assignment.submissionDate === tomorrowDate;

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
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status === 'completed' ? 'border border-success/30 bg-success-light text-success' : 'border border-error/30 bg-error-light text-error'}`}
                      >
                        {status === 'completed'
                          ? 'منتهي'
                          : status === 'overdue'
                            ? 'متأخر'
                            : 'مطلوب'}
                      </span>
                      {assignment.id === newestAssignmentId && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          الأحدث
                        </span>
                      )}
                    </div>
                    <p className="break-words text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
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
                  <time
                    dateTime={assignment.submissionDate}
                    className={`inline-flex max-w-full flex-wrap items-center justify-center rounded-xl border px-3 py-1.5 text-center text-[11px] font-bold leading-5 shadow-sm transition-colors sm:px-4 sm:text-xs ${submissionDateClasses} ${isDueTomorrow ? 'tomorrow-deadline-pulse' : ''}`}
                  >
                    {formatDate(assignment.submissionDate)}
                  </time>
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
  );
}
