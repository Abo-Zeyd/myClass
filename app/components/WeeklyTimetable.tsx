import { CalendarDays, Clock3, PersonStanding } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type Weekday = 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
type Period = 'morning' | 'evening';

/** فئات المواد للألوان الديناميكية */
type SubjectCategory =
  | 'islamic-education'
  | 'arabic'
  | 'mathematics'
  | 'french'
  | 'english'
  | 'science'
  | 'history-geography'
  | 'civic-education'
  | 'physical-education'
  | 'arts'
  | 'memorization';

/** خلية حصة واحدة */
type LessonCell = {
  /** اسم المادة */
  subject: string;
  /** فئة المادة للون الديناميكي */
  category: SubjectCategory;
  /** عدد الحصص (30 دقيقة لكل حصة) */
  span: number;
  /** عدد الأعمدة المدمجة (يُحسب تلقائياً من span) */
  colSpan?: number;
};

type TimetableDay = {
  day: Weekday;
  morning: LessonCell[];
  evening: LessonCell[];
};

type PeriodConfig = {
  id: Period;
  title: string;
  time: string;
  slotCount: number;
};

// ============================================================================
// Constants
// ============================================================================

// Column count is now dynamic per period via period.slotCount
export const timetableSlideTitle = 'التوزيع الزمني للالسنة الرابعة ابتدائي';

// ============================================================================
// Timetable Periods Configuration
// ============================================================================

export const TIMETABLE_PERIODS_CONFIG: PeriodConfig[] = [
  {
    id: 'morning',
    title: 'الفترة الصباحية',
    time: '08:00 - 10:30',
    slotCount: 5,
  },
  {
    id: 'evening',
    title: 'الفترة المسائية',
    time: '13:00 - 15:00',
    slotCount: 4,
  },
];

// ============================================================================
// Subject Color Mapping (Dynamic via Category)
// ============================================================================

const DEFAULT_COLORS = {
  bg: 'bg-slate-50',
  text: 'text-slate-700',
  border: 'border-slate-200',
};

const SUBJECT_COLORS: Record<SubjectCategory, { bg: string; text: string; border: string }> = {
  'islamic-education': DEFAULT_COLORS,
  arabic: DEFAULT_COLORS,
  mathematics: DEFAULT_COLORS,
  french: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
  },
  english: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  science: DEFAULT_COLORS,
  'history-geography': DEFAULT_COLORS,
  'civic-education': DEFAULT_COLORS,
  'physical-education': {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  arts: DEFAULT_COLORS,
  memorization: DEFAULT_COLORS,
};

// ============================================================================
// Timetable Data
// ============================================================================

const timetable: TimetableDay[] = [
  {
    day: 'الأحد',
    morning: [
      { subject: 'ت. إسلامية', category: 'islamic-education', span: 1 },
      { subject: 'قراءة وأداء وفهم', category: 'arabic', span: 2 },
      { subject: 'فهم المنطوق', category: 'arabic', span: 1 },
      { subject: 'تعبير شفوي', category: 'arabic', span: 1 },
    ],
    evening: [
      { subject: 'تربية بدنية', category: 'physical-education', span: 3 },
      { subject: 'ت. علمية', category: 'science', span: 1 },
    ],
  },
  {
    day: 'الإثنين',
    morning: [
      { subject: 'لغة إنجليزية', category: 'english', span: 2 },
      { subject: 'ت. مدنية', category: 'civic-education', span: 1 },
      { subject: 'رياضيات', category: 'mathematics', span: 2 },
    ],
    evening: [
      { subject: 'الإنتاج الشفوي', category: 'arabic', span: 1 },
      { subject: 'رياضيات', category: 'mathematics', span: 1 },
      { subject: 'قراءة (دراسة الظاهرة النحوية)', category: 'arabic', span: 2 },
    ],
  },
  {
    day: 'الثلاثاء',
    morning: [
      { subject: 'ت. إسلامية', category: 'islamic-education', span: 1 },
      { subject: 'رياضيات', category: 'mathematics', span: 2 },
      { subject: 'تاريخ', category: 'history-geography', span: 1 },
      { subject: 'مطالعة', category: 'arabic', span: 1 },
    ],
    evening: [
      { subject: 'رياضيات', category: 'mathematics', span: 1 },
      { subject: 'تربية فنية', category: 'arts', span: 1 },
      { subject: 'لغة فرنسية', category: 'french', span: 2 },
    ],
  },
  {
    day: 'الأربعاء',
    morning: [
      { subject: 'لغة إنجليزية', category: 'english', span: 2 },
      { subject: 'ت. إسلامية', category: 'islamic-education', span: 1 },
      { subject: 'قراءة (دراسة الظاهرة الإملائية / الصرفية)', category: 'arabic', span: 2 },
    ],
    evening: [
      { subject: 'ت. إسلامية', category: 'islamic-education', span: 1 },
      { subject: 'جغرافيا', category: 'history-geography', span: 1 },
      { subject: 'محفوظات', category: 'memorization', span: 1 },
      { subject: 'ت. علمية', category: 'science', span: 1 },
    ],
  },
  {
    day: 'الخميس',
    morning: [
      { subject: 'ت. إسلامية', category: 'islamic-education', span: 1 },
      { subject: 'رياضيات', category: 'mathematics', span: 2 },
      { subject: 'لغة فرنسية', category: 'french', span: 2 },
    ],
    evening: [
      { subject: 'رياضيات', category: 'mathematics', span: 1 },
      { subject: 'تربية فنية', category: 'arts', span: 1 },
      { subject: 'الإنتاج الكتابي', category: 'arabic', span: 2 },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * تحويل خلايا الحصص إلى خلايا مع colSpan وتخطي الـ slots المحجوزة
 * مثال: إذا شغلت المادة حصتين (span=2)، تأخذ colSpan=2 ونتخطي الـ slot التالي
 */
function expandCells(cells: LessonCell[]): (LessonCell & { skip?: boolean })[] {
  const result: (LessonCell & { skip?: boolean })[] = [];

  for (const cell of cells) {
    result.push({ ...cell, colSpan: cell.span });
    // تخطي الـ slots المحجوزة (span - 1 خلايا)
    for (let i = 1; i < cell.span; i++) {
      result.push({ subject: '', category: cell.category, span: 0, skip: true });
    }
  }

  return result;
}

// ============================================================================
// Component
// ============================================================================

function renderLessonCell(cell: LessonCell, key: string) {
  const colors = SUBJECT_COLORS[cell.category];
  const isPhysicalEducation = cell.category === 'physical-education';
  const colSpan = cell.colSpan ?? cell.span ?? 1;

  return (
    <td key={key} colSpan={colSpan} className="h-full p-0.5 align-middle">
      <div
        className={`flex min-h-14 h-full flex-col items-center justify-center gap-1 rounded-md border px-1 py-1.5 text-center text-[10px] font-bold leading-tight sm:text-xs ${colors.bg} ${colors.text} ${colors.border}`}
      >
        {isPhysicalEducation && (
          <PersonStanding size={20} className="shrink-0" aria-hidden="true" />
        )}
        <span className="wrap-break-word">{cell.subject}</span>
        <span className="inline-flex items-center gap-1 font-semibold opacity-80">
          <span>{cell.span * 30} د</span>
          <Clock3 size={12} aria-hidden="true" />
        </span>
      </div>
    </td>
  );
}

function PeriodTable({ period }: { period: PeriodConfig }) {
  const expandedDays = timetable.map((day) => ({
    day: day.day,
    cells: expandCells(day[period.id]),
  }));

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-sm sm:p-1.5">
      <table
        className="w-full table-fixed border-separate border-spacing-1"
        aria-label={`${timetableSlideTitle} - ${period.title}`}
      >
        <caption className="sr-only">
          {timetableSlideTitle}، {period.title} {period.time}
        </caption>
        <colgroup>
          <col className="w-11 sm:w-14" />
          {Array.from({ length: period.slotCount }, (_, index) => (
            <col key={index} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th
              scope="col"
              className="rounded-md bg-surface-muted px-1 py-2 text-center text-[10px] font-black text-primary sm:text-xs"
            >
              <span className="flex flex-col items-center justify-center gap-1">
                <CalendarDays size={16} aria-hidden="true" />
                <span>الأيام</span>
              </span>
            </th>
            <th
              scope="colgroup"
              colSpan={period.slotCount}
              className="rounded-md bg-primary px-1.5 py-2 text-center text-white"
            >
              <span className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[10px] font-black leading-snug sm:text-xs md:text-sm">
                <Clock3 size={15} aria-hidden="true" />
                <span>{period.title}</span>
                <span className="font-semibold opacity-90">({period.time})</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {expandedDays.map(({ day, cells }) => (
            <tr key={day}>
              <th
                scope="row"
                className="rounded-md bg-primary px-1 py-2 text-center text-[10px] font-black text-white sm:text-xs"
              >
                {day}
              </th>
              {cells.map((cell, index) =>
                cell.skip ? null : renderLessonCell(cell, `${day}-${period.id}-${index}`)
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WeeklyTimetable() {
  return (
    <section dir="rtl" aria-label={timetableSlideTitle} className="w-full min-w-0 p-1 sm:p-2">
      <div className="grid min-w-0 grid-cols-1 gap-2 lg:grid-cols-2">
        {TIMETABLE_PERIODS_CONFIG.map((period) => (
          <PeriodTable key={period.id} period={period} />
        ))}
      </div>
    </section>
  );
}
