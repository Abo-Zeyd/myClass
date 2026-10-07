'use server';

import { isAdminAuthenticated } from '../../lib/admin-auth';

export async function triggerDatabaseBackup() {
  if (!(await isAdminAuthenticated())) {
    throw new Error('انتهت جلسة الإدارة. سجّل الدخول مجدداً.');
  }

  const repository = process.env.GITHUB_BACKUP_REPOSITORY?.trim();
  const token = process.env.GITHUB_BACKUP_TOKEN?.trim();
  const ref = process.env.GITHUB_BACKUP_REF?.trim() || 'main';

  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error('أضف GITHUB_BACKUP_REPOSITORY بصيغة المالك/المستودع الخاص في إعدادات Vercel.');
  }
  if (!token) {
    throw new Error('أضف GITHUB_BACKUP_TOKEN بصلاحية Actions: write على مستودع النسخ الخاص.');
  }
  if (ref.length > 250 || /\s/.test(ref)) {
    throw new Error('قيمة GITHUB_BACKUP_REF غير صالحة.');
  }

  const response = await fetch(
    `https://api.github.com/repos/${repository}/actions/workflows/backup-database.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'fourth-grade-section-admin',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref }),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('رفض GitHub تشغيل النسخة. تحقق من صلاحية Actions: write للرمز.');
    }
    if (response.status === 404 || response.status === 422) {
      throw new Error(
        'لم يعثر GitHub على سير العمل أو الفرع. تأكد من إعداد المستودع الخاص ونسخ ملف workflow إليه.'
      );
    }
    throw new Error(`تعذر تشغيل النسخة الاحتياطية عبر GitHub (HTTP ${response.status}).`);
  }

  return {
    actionsUrl: `https://github.com/${repository}/actions/workflows/backup-database.yml`,
  };
}
