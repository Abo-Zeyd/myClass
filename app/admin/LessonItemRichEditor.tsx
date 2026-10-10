'use client';

import { Plus, Trash2 } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

type LessonItemRichEditorProps = {
  itemId: string;
  summary: string;
  activities: string[];
  onSummaryChange: (value: string) => void;
  onActivitiesChange: (value: string[]) => void;
};

/**
 * محرّر منسّق لمحتوى الدرس.
 *
 * كل نشاط هو كتلة مستقلة في مصفوفة `activities`، لذلك لكلٍّ منها محرّر
 * خاص به. هذا يحافظ على الأسطر الفارغة داخل النشاط (وهي تحدد فاصل الفقرات)
 * ولا تظهر مشكلة فقد التنسيق عند الحفظ.
 */
export default function LessonItemRichEditor({
  itemId,
  summary,
  activities,
  onSummaryChange,
  onActivitiesChange,
}: LessonItemRichEditorProps) {
  const iconButton =
    'inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50';
  const addButton =
    'inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90';

  function updateActivity(index: number, value: string) {
    const next = [...activities];
    next[index] = value;
    onActivitiesChange(next);
  }

  function addActivity() {
    onActivitiesChange([...activities, '']);
  }

  function removeActivity(index: number) {
    onActivitiesChange(activities.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveActivity(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= activities.length) return;
    const next = [...activities];
    const current = next[index] ?? '';
    const shifted = next[target] ?? '';
    next[index] = shifted;
    next[target] = current;
    onActivitiesChange(next);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <span className="text-sm font-medium text-foreground">الخلاصة</span>
        <RichTextEditor
          id={`${itemId}-summary-editor`}
          value={summary}
          onChange={onSummaryChange}
          placeholder="اكتب خلاصة الدرس... استخدم الأدوات أعلاه للتنسيق وإدراج الصور"
          rows={6}
          maxLength={10000}
          ariaLabel="خلاصة الدرس"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            الأنشطة والتمارين
            <span className="ms-2 text-xs text-muted-foreground">
              كل نشاط في محرّر مستقل — يدعم التنسيق والصور
            </span>
          </span>
          <button
            type="button"
            onClick={addActivity}
            aria-label="إضافة نشاط"
            title="إضافة نشاط"
            className={addButton}
          >
            <Plus size={19} aria-hidden="true" />
          </button>
        </div>

        {activities.length === 0 ? (
          <p className="rounded-md border-2 border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            لا توجد أنشطة. اضغط + لإضافة نشاط.
          </p>
        ) : (
          <ol className="space-y-3">
            {activities.map((activity, index) => (
              <li key={`${itemId}-activity-${index}`} className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    النشاط {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveActivity(index, -1)}
                      disabled={index === 0}
                      aria-label={`نقل النشاط ${index + 1} للأعلى`}
                      title="للأعلى"
                      className={`${iconButton} size-9`}
                    >
                      <span aria-hidden="true" className="text-base leading-none">
                        ↑
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveActivity(index, 1)}
                      disabled={index === activities.length - 1}
                      aria-label={`نقل النشاط ${index + 1} للأسفل`}
                      title="للأسفل"
                      className={`${iconButton} size-9`}
                    >
                      <span aria-hidden="true" className="text-base leading-none">
                        ↓
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      aria-label={`حذف النشاط ${index + 1}`}
                      title="حذف النشاط"
                      className={`${iconButton} size-9 text-error hover:bg-error-light`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <RichTextEditor
                  id={`${itemId}-activity-${index}-editor`}
                  value={activity}
                  onChange={(value) => updateActivity(index, value)}
                  placeholder={`النشاط ${index + 1} — اكتب النص أو استخدم الأدوات، أو أدرج صورة`}
                  rows={3}
                  maxLength={2000}
                  ariaLabel={`النشاط ${index + 1}`}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
