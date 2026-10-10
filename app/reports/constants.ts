/**
 * ثوابت صفحة البلاغات.
 *
 * يجب أن تكون في ملف منفصل عن "actions.ts" لأن Next.js يشترط أن تكون
 * كل التصديرات من ملف server action دوال async. تصدير ثابت من هناك
 * يجعله مرجعاً غير صالح على العميل (فشل .map وقت التشغيل).
 */

export const BUG_REPORT_CATEGORIES = [
  { value: 'content', label: 'خطأ في المحتوى' },
  { value: 'link', label: 'رابط لا يعمل' },
  { value: 'display', label: 'مشكلة في العرض' },
  { value: 'loading', label: 'بطء أو تعذّر التحميل' },
  { value: 'other', label: 'أخرى' },
] as const;

export type BugReportCategory = (typeof BUG_REPORT_CATEGORIES)[number]['value'];

export const DEFAULT_BUG_REPORT_CATEGORY: BugReportCategory = 'content';
