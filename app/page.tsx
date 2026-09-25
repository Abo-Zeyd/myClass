type Assignment = {
  id: number;
  name: string;
  assignedDate: string;
  submissionDate: string;
};

const assignments: Assignment[] = [
  {
    id: 1,
    name: "حل تمارين الرياضيات، صفحة 12",
    assignedDate: "22 سبتمبر 2026",
    submissionDate: "27 سبتمبر 2026",
  },
  {
    id: 2,
    name: "قراءة النص والإجابة عن الأسئلة",
    assignedDate: "23 سبتمبر 2026",
    submissionDate: "28 سبتمبر 2026",
  },
  {
    id: 3,
    name: "كتابة فقرة قصيرة في اللغة العربية",
    assignedDate: "24 سبتمبر 2026",
    submissionDate: "29 سبتمبر 2026",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">
      

      {/* المحتوى الرئيسي */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">
        {/* بطاقة الترحيب */}
        <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-accent p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-snug">
              أهلاً بكم في الفضاء التعليمي لقسم السنة الرابعة
            </h2>
            <p className="text-surface-muted text-base sm:text-lg leading-relaxed">
              منصة مخصصة لتلاميذ وأولياء أمور قسم السنة الرابعة، تجدون فيها ملخصات الدروس اليومية، الواجبات المنزلية، والأنشطة الداعمة لنتعلم ونتفوق معاً.
            </p>
          </div>
          {/* لمسة جمالية في الخلفية */}
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm" aria-labelledby="assignments-title">
          <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-surface-muted text-xl text-primary" aria-hidden="true">
                📝
              </span>
              <h2 id="assignments-title" className="text-lg font-bold text-foreground">
                الواجبات المطلوبة
              </h2>
            </div>
            <span className="rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold text-primary">
              {assignments.length}
            </span>
          </header>

          <div className="hidden grid-cols-1 bg-background px-5 py-3 text-sm font-semibold text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_160px_160px] sm:gap-6">
            <span>اسم الواجب</span>
            <span>تاريخ التكليف</span>
            <span>تاريخ التقديم</span>
          </div>

          {assignments.length > 0 ? (
            <ul className="divide-y divide-border">
              {assignments.map((assignment) => (
                <li key={assignment.id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_160px_160px] sm:items-center sm:gap-6">
                  <p className="font-semibold text-foreground">{assignment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="mb-1 block text-xs font-medium sm:hidden">تاريخ التكليف</span>
                    {assignment.assignedDate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="mb-1 block text-xs font-medium sm:hidden">تاريخ التقديم</span>
                    {assignment.submissionDate}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              لا توجد واجبات مسجلة حاليا.
            </p>
          )}
        </section>
      </main>

      {/* التذييل / الفوتر */}
      <footer className="mt-16 border-t border-border bg-surface py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-5xl mx-auto px-6 space-y-2">
          <p>© {new Date().getFullYear()} قسم السنة الرابعة - الأستاذ عز الدين عويسي. جميع الحقوق محفوظة.</p>
          <p className="text-xs text-muted-foreground">منصة تعليمية لدعم وتوجيه تلاميذ التعليم الابتدائي</p>
        </div>
      </footer>
    </div>
  );
}