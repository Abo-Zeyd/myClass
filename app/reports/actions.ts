'use server';

import { headers } from 'next/headers';
import { insertBugReport, type BugReport } from '../../lib/content-db';
import { BUG_REPORT_CATEGORIES, type BugReportCategory } from './constants';

type ActionResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** حماية من الإرسال المتكرر — نفس نمط تعليقات الصفحة الرئيسية */
const attemptsByAddress = new Map<string, number[]>();
const rateLimitWindowMs = 60_000;
const maxReportsPerWindow = 3;

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
}

function isKnownCategory(value: unknown): value is BugReportCategory {
  return BUG_REPORT_CATEGORIES.some((category) => category.value === value);
}

async function isRateLimited() {
  const requestHeaders = await headers();
  const address =
    requestHeaders.get('x-real-ip') ??
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const now = Date.now();
  const recentAttempts = (attemptsByAddress.get(address) ?? []).filter(
    (timestamp) => now - timestamp < rateLimitWindowMs
  );

  if (recentAttempts.length >= maxReportsPerWindow) {
    attemptsByAddress.set(address, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  attemptsByAddress.set(address, recentAttempts);

  // تنظيف دوري حتى لا يتضخم الخريطة
  if (attemptsByAddress.size > 5000) {
    for (const [key, timestamps] of attemptsByAddress) {
      if (timestamps.every((timestamp) => now - timestamp >= rateLimitWindowMs)) {
        attemptsByAddress.delete(key);
      }
    }
  }
  return false;
}

export async function submitBugReport(input: unknown): Promise<ActionResult<BugReport>> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, error: 'بيانات البلاغ غير صالحة.' };
  }

  const values = input as Record<string, unknown>;

  // فخّ للبوتات — حقل مخفي لا يملؤه المستخدم الحقيقي
  if (typeof values.website === 'string' && values.website.trim()) {
    return { ok: false, error: 'تعذر إرسال البلاغ.' };
  }

  const body = normalizeText(values.body, 2000);
  if (!body) {
    return { ok: false, error: 'اكتب وصفاً للخطأ بين 1 و 2000 حرف.' };
  }

  const displayName = normalizeText(values.displayName, 60) ?? 'زائر';
  // يُلتقط تلقائياً من الصفحة التي جاء منها البلاغ
  const pageUrl = normalizeText(values.pageUrl, 500) ?? '';
  const category = isKnownCategory(values.category) ? values.category : 'other';

  if (await isRateLimited()) {
    return { ok: false, error: 'أرسلت بلاغات كثيرة. حاول مجدداً بعد دقيقة.' };
  }

  let resolvedPageUrl = pageUrl;
  if (!resolvedPageUrl) {
    const requestHeaders = await headers();
    const referer = requestHeaders.get('referer') ?? '';
    if (referer) {
      try {
        const parsed = new URL(referer);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          resolvedPageUrl = `${parsed.pathname}${parsed.search}`;
        }
      } catch {
        resolvedPageUrl = '';
      }
    }
  }

  try {
    const report = await insertBugReport({
      displayName,
      category,
      body,
      pageUrl: resolvedPageUrl,
    });
    return { ok: true, value: report };
  } catch {
    return { ok: false, error: 'تعذر إرسال البلاغ حالياً. حاول لاحقاً.' };
  }
}
