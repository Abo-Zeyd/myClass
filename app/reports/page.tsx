import { Bug, ClipboardList, Lightbulb } from 'lucide-react';
import type { Metadata } from 'next';
import ReportForm from './ReportForm';

export const metadata: Metadata = {
  title: 'الإبلاغ عن الأخطاء - قسم السنة الرابعة',
  description: 'أبلغنا عن أي خطأ في المحتوى أو الروابط أو عرض الموقع',
};

export const dynamic = 'force-dynamic';

const TIPS = [
  'اكتب اسم الصفحة أو الدرس الذي وجدت فيه الخطأ.',
  'اذكر النص أو الرابط الصحيح إن كنت تعرفه.',
  'إن كان الخطأ في صورة أو ملف، صف ما ظهر لك بالضبط.',
];

export default async function ReportsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex items-start gap-4">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-error/10 text-error"
          aria-hidden="true"
        >
          <Bug size={26} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-black leading-tight text-foreground sm:text-3xl">
            الإبلاغ عن الأخطاء
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
            ساعدنا في تحسين الموقع بإبلاغك عن أي خطأ في المحتوى أو الروابط أو العرض.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="report-form-title"
        className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
      >
        <header className="flex items-center gap-3 border-b border-border bg-surface-muted/30 px-4 py-4 sm:px-6">
          <ClipboardList size={20} className="shrink-0 text-primary" aria-hidden="true" />
          <h2 id="report-form-title" className="text-lg font-bold text-foreground">
            تفاصيل البلاغ
          </h2>
        </header>

        <div className="p-4 sm:p-6">
          <ReportForm />
        </div>
      </section>

      <section
        aria-labelledby="report-tips-title"
        className="rounded-2xl border border-secondary/25 bg-secondary/5 p-4 sm:p-6"
      >
        <h2
          id="report-tips-title"
          className="mb-3 flex items-center gap-2 text-base font-bold text-secondary"
        >
          <Lightbulb size={19} aria-hidden="true" />
          نصائح تساعدنا على حل المشكلة بسرعة
        </h2>
        <ul className="list-inside list-disc space-y-2 ps-1 text-sm leading-7 text-foreground marker:text-secondary">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
