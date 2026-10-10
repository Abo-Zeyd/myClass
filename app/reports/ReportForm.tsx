'use client';

import { Bug, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { submitBugReport } from './actions';
import { BUG_REPORT_CATEGORIES, DEFAULT_BUG_REPORT_CATEGORY } from './constants';

const inputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-3 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';
const labelClassName = 'grid gap-2 text-sm font-medium text-foreground';

export default function ReportForm() {
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<string>(DEFAULT_BUG_REPORT_CATEGORY);
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const remaining = 2000 - body.length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const result = await submitBugReport({
      displayName,
      category,
      body,
      website,
    });

    if (result.ok) {
      setBody('');
      setDisplayName('');
      setCategory(DEFAULT_BUG_REPORT_CATEGORY);
      setFeedback({ type: 'success', text: 'تم إرسال بلاغك، شكراً لك. سيُراجع في أقرب وقت.' });
    } else {
      setFeedback({ type: 'error', text: result.error });
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          نوع المشكلة
          <select
            className={inputClassName}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {BUG_REPORT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClassName}>
          اسمك (اختياري)
          <input
            className={inputClassName}
            maxLength={60}
            value={displayName}
            placeholder="اتركه فارغاً إن تفضّل"
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
      </div>

      <label className={labelClassName}>
        وصف الخطأ
        <textarea
          required
          rows={6}
          maxLength={2000}
          value={body}
          placeholder="اشرح المشكلة بأكبر قدر من التفاصيل: أين ظهرت؟ وما الذي حدث بالضبط؟"
          onChange={(event) => setBody(event.target.value)}
          className={`${inputClassName} resize-y leading-7`}
        />
        <span className={`text-xs ${remaining < 200 ? 'text-error' : 'text-muted-foreground'}`}>
          {remaining} حرف متبقٍ
        </span>
      </label>

      {/* فخّ للبوتات */}
      <label aria-hidden="true" className="sr-only">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${
            feedback?.type === 'error' ? 'text-error' : 'text-muted-foreground'
          }`}
        >
          {feedback?.text ?? 'لا تنشر بيانات شخصية في نص البلاغ.'}
        </p>
        <button
          type="submit"
          disabled={submitting || body.trim().length === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} aria-hidden="true" />
          {submitting ? 'جارٍ الإرسال...' : 'إرسال البلاغ'}
        </button>
      </div>

      <p className="flex items-start gap-2 rounded-md border border-border bg-surface-muted/40 px-4 py-3 text-xs leading-6 text-muted-foreground">
        <Bug size={15} className="mt-1 shrink-0" aria-hidden="true" />
        تُرفق روابط الصفحات تلقائياً مع بلاغك لتسهيل تحديد مكان الخطأ.
      </p>
    </form>
  );
}
