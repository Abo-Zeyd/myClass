'use client';

import { ArrowUpRight, DatabaseArrowDown } from 'lucide-react';
import { useState } from 'react';
import { triggerDatabaseBackup } from './backup-actions';

type BackupNotice = {
  type: 'success' | 'error';
  message: string;
};

export default function DatabaseBackupPanel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionsUrl, setActionsUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<BackupNotice | null>(null);

  async function startBackup() {
    setIsSubmitting(true);
    setActionsUrl(null);
    setNotice(null);

    try {
      const result = await triggerDatabaseBackup();
      setActionsUrl(result.actionsUrl);
      setNotice({
        type: 'success',
        message: 'بدأ إنشاء النسخة. افتح GitHub Actions لمتابعة اكتمالها وتنزيلها.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'تعذر تشغيل النسخة الاحتياطية.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="mb-6 rounded-lg border border-border bg-surface p-5 shadow-sm"
      aria-labelledby="database-backup-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <DatabaseArrowDown size={23} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="database-backup-title" className="font-bold text-foreground">
              نسخة احتياطية لقاعدة البيانات
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              ينشئ ملفات الأدوار والمخطط والبيانات، ويحفظها كنسخة خاصة في مستودع GitHub المخصص.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actionsUrl && (
            <a
              href={actionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
            >
              <span>متابعة التنزيل</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
          <button
            type="button"
            onClick={() => void startBackup()}
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            <DatabaseArrowDown size={17} aria-hidden="true" />
            {isSubmitting ? 'جارٍ بدء النسخ...' : 'إنشاء نسخة احتياطية'}
          </button>
        </div>
      </div>
      {notice && (
        <p
          className={`mt-4 rounded-md border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-green-700/25 bg-green-50 text-green-900' : 'border-red-700/25 bg-red-50 text-red-900'}`}
          role={notice.type === 'error' ? 'alert' : 'status'}
        >
          {notice.message}
        </p>
      )}
    </section>
  );
}
