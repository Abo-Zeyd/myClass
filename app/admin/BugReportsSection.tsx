'use client';

import { Bug, ChevronDown, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { BugReport, BugReportStatus } from '../../lib/content-db';
import { removeBugReport, saveBugReport } from './actions';

const STATUS_META: Record<BugReportStatus, { label: string; badge: string }> = {
  pending: { label: 'جديد', badge: 'bg-error-light text-error' },
  reviewing: { label: 'قيد المراجعة', badge: 'bg-warning-light text-warning' },
  resolved: { label: 'تم الحل', badge: 'bg-success-light text-success' },
  ignored: { label: 'متجاهل', badge: 'bg-surface-muted text-muted-foreground' },
};

const CATEGORY_LABELS: Record<string, string> = {
  content: 'خطأ في المحتوى',
  link: 'رابط لا يعمل',
  display: 'مشكلة في العرض',
  loading: 'بطء أو تعذّر التحميل',
  other: 'أخرى',
};

const primaryButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const dangerButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md text-error transition-colors hover:bg-error-light disabled:cursor-not-allowed disabled:opacity-50';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function BugReportsSection({
  reports,
  onChange,
}: {
  reports: BugReport[];
  onChange: (reports: BugReport[]) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function patchReport(id: string, patch: Partial<BugReport>) {
    onChange(reports.map((report) => (report.id === id ? { ...report, ...patch } : report)));
  }

  async function persist(report: BugReport) {
    setBusy(true);
    setError('');
    try {
      await saveBugReport(report.id, report.status, report.adminNote);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر حفظ البلاغ.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(report: BugReport) {
    if (!window.confirm('هل تريد حذف هذا البلاغ نهائياً؟')) return;
    setBusy(true);
    setError('');
    try {
      await removeBugReport(report.id);
      onChange(reports.filter((entry) => entry.id !== report.id));
      setExpandedId((current) => (current === report.id ? null : current));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر حذف البلاغ.');
    } finally {
      setBusy(false);
    }
  }

  if (reports.length === 0) {
    return (
      <section role="tabpanel" aria-label="إدارة بلاغات الأخطاء" className="space-y-4">
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-surface-muted">
            <Bug size={30} className="text-muted-foreground/40" aria-hidden="true" />
          </span>
          <p className="text-base font-bold text-muted-foreground">لا توجد بلاغات مسجلة حالياً.</p>
        </div>
      </section>
    );
  }

  return (
    <section role="tabpanel" aria-label="إدارة بلاغات الأخطاء" className="space-y-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold leading-snug">بلاغات الأخطاء</h2>
        <span className="rounded-full border border-error/20 bg-error-light px-4 py-1.5 text-sm font-bold text-error">
          {reports.length} بلاغ
        </span>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-error/25 bg-error-light px-5 py-4 text-base text-error"
        >
          {error}
        </p>
      )}

      <div className="space-y-4">
        {reports.map((report) => {
          const isExpanded = expandedId === report.id;
          const statusMeta = STATUS_META[report.status];

          return (
            <article
              key={report.id}
              className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`${report.id}-details`}
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="flex min-h-14 min-w-0 flex-1 items-center justify-between gap-3 px-4 text-right transition-colors hover:bg-surface-muted/40 sm:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-base font-semibold text-foreground">
                      {report.body}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {CATEGORY_LABELS[report.category] ?? 'أخرى'} · {report.displayName || 'زائر'}
                      {report.pageUrl ? ` · ${report.pageUrl}` : ''}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusMeta.badge}`}
                    >
                      {statusMeta.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-primary transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div
                id={`${report.id}-details`}
                hidden={!isExpanded}
                className="grid gap-4 border-t border-border bg-surface-muted/25 p-5"
              >
                <p className="whitespace-pre-line rounded-md border border-border bg-surface p-4 text-base leading-7 text-foreground">
                  {report.body}
                </p>

                <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-start">
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    حالة البلاغ
                    <select
                      className="min-h-11 rounded-md border border-border bg-surface px-3 text-base text-foreground outline-none focus:border-primary"
                      value={report.status}
                      onChange={(event) =>
                        patchReport(report.id, { status: event.target.value as BugReportStatus })
                      }
                    >
                      {(Object.keys(STATUS_META) as BugReportStatus[]).map((value) => (
                        <option key={value} value={value}>
                          {STATUS_META[value].label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    ملاحظة الأستاذ (داخلية)
                    <textarea
                      rows={2}
                      maxLength={2000}
                      className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-base leading-7 text-foreground outline-none focus:border-primary"
                      value={report.adminNote}
                      onChange={(event) =>
                        patchReport(report.id, { adminNote: event.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void persist(report)}
                    disabled={busy}
                    aria-label="حفظ البلاغ"
                    title="حفظ البلاغ"
                    className={primaryButton}
                  >
                    <Save size={19} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(report)}
                    disabled={busy}
                    aria-label="حذف البلاغ"
                    title="حذف البلاغ"
                    className={dangerButton}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
