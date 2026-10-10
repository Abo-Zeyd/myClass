'use client';

import {
  AlignCenter,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Type,
  Underline,
} from 'lucide-react';
import { useCallback, useRef } from 'react';

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  ariaLabel?: string;
};

type WrapAction = {
  label: string;
  icon: typeof Bold;
  before: string;
  after: string;
  placeholder: string;
};

type BlockAction = {
  label: string;
  icon: typeof Bold;
  prefix: string;
  block?: boolean;
};

const WRAP_ACTIONS: WrapAction[] = [
  { label: 'عريض', icon: Bold, before: '**', after: '**', placeholder: 'نص عريض' },
  { label: 'مائل', icon: Italic, before: '_', after: '_', placeholder: 'نص مائل' },
  { label: 'تسطير', icon: Underline, before: '__', after: '__', placeholder: 'نص مسطر' },
  { label: 'رابط', icon: Link2, before: '[', after: '](https://)', placeholder: 'نص الرابط' },
  {
    label: 'خط عريض جداً',
    icon: Bold,
    before: '***',
    after: '***',
    placeholder: 'نص بخط عريض جداً',
  },
];

/** أحجام الخط المتاحة كبادئة سطرية */
const FONT_SIZE_PREFIXES = ['# ', '## ', '### '] as const;
const FONT_SIZE_LABELS = ['صغير', 'متوسط', 'كبير'] as const;

const BLOCK_ACTIONS: BlockAction[] = [
  { label: 'عنوان رئيسي', icon: Heading2, prefix: '## ' },
  { label: 'عنوان فرعي', icon: Heading3, prefix: '### ' },
  { label: 'قائمة نقطية', icon: List, prefix: '- ', block: true },
  { label: 'قائمة مرقمة', icon: ListOrdered, prefix: '1. ', block: true },
  { label: 'اقتباس', icon: Quote, prefix: '> ' },
];

const ALIGN_ACTIONS: BlockAction[] = [
  { label: 'توسيط', icon: AlignCenter, prefix: '::: ', block: true },
  { label: 'محاذاة لليمين', icon: AlignRight, prefix: '!!! ', block: true },
];

/** إدراج صورة في سطر مستقل: ![الوصف](الرابط) */
const IMAGE_TEMPLATE = '\n![وصف الصورة](https://drive.google.com/file/d/.../view)\n';

export default function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  rows = 6,
  maxLength = 5000,
  ariaLabel,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** يحدّث النص ويعيد ضبط مؤشر التركيز داخل那块 النص المحدد */
  const applyChange = useCallback(
    (nextValue: string, selectionStart: number, selectionEnd: number) => {
      onChange(nextValue.slice(0, maxLength));
      window.requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        textarea.setSelectionRange(selectionStart, selectionEnd);
      });
    },
    [maxLength, onChange]
  );

  const applyWrap = useCallback(
    (action: WrapAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd) || action.placeholder;
      const nextValue =
        value.slice(0, selectionStart) +
        action.before +
        selected +
        action.after +
        value.slice(selectionEnd);

      applyChange(
        nextValue,
        selectionStart + action.before.length,
        selectionStart + action.before.length + selected.length
      );
    },
    [applyChange, value]
  );

  /** إدراج قالب صورة في سطر مستقل عند موضع المؤشر */
  const applyImage = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const nextValue = value.slice(0, selectionStart) + IMAGE_TEMPLATE + value.slice(selectionEnd);

    const cursor = selectionStart + IMAGE_TEMPLATE.length;
    applyChange(nextValue, cursor, cursor);
  }, [applyChange, value]);

  /** تطبيق بادئة سطرية (للخط أو الحجم) على السطر الحالي */
  const applyLinePrefix = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart } = textarea;
      const lineStart = value.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1;
      const lineEndIndex = value.indexOf('\n', selectionStart);
      const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
      const currentLine = value.slice(lineStart, lineEnd);

      // إزالة البادئة إن كانت موجودة مسبقاً (تبديل)
      const replacement = currentLine.startsWith(prefix)
        ? currentLine.slice(prefix.length)
        : `${prefix}${currentLine}`;

      applyChange(
        value.slice(0, lineStart) + replacement + value.slice(lineEnd),
        lineStart + replacement.length,
        lineStart + replacement.length
      );
    },
    [applyChange, value]
  );

  const applyBlock = useCallback(
    (action: BlockAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart } = textarea;
      const lineStart = value.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1;
      const lineEndIndex = value.indexOf('\n', selectionStart);
      const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
      const currentLine = value.slice(lineStart, lineEnd);

      const shouldRemove = Boolean(action.block) && currentLine.startsWith(action.prefix);
      const replacement = shouldRemove
        ? currentLine.slice(action.prefix.length)
        : `${action.prefix}${currentLine}`;

      applyChange(
        value.slice(0, lineStart) + replacement + value.slice(lineEnd),
        lineStart + replacement.length,
        lineStart + replacement.length
      );
    },
    [applyChange, value]
  );

  /** قوائم منسدلة للخط والحجم */
  const selectClassName =
    'h-9 rounded-md border border-border bg-surface px-2 text-xs font-bold text-primary outline-none transition-colors hover:bg-surface-muted focus:border-primary';

  const FONT_FAMILIES = [
    { value: '', label: 'الخط التلقائي' },
    { value: 'naskh', label: 'نسخ' },
    { value: 'sans', label: 'Sans' },
  ] as const;

  /** بادئة سطرية للخط: ~اسم~ */
  const FONT_PREFIX = '~';

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <div
        className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-muted/40 px-2 py-1.5"
        role="toolbar"
        aria-label="أدوات تنسيق النص"
        aria-controls={id}
      >
        {/* الخط والحجم */}
        <label className="flex items-center gap-1">
          <Type size={14} className="shrink-0 text-primary" aria-hidden="true" />
          <select
            aria-label="نوع الخط"
            title="نوع الخط"
            className={selectClassName}
            defaultValue=""
            onChange={(event) => {
              const family = event.target.value;
              if (!family) return;
              applyLinePrefix(`${FONT_PREFIX}${family}${FONT_PREFIX} `);
              event.target.value = '';
            }}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </label>

        <select
          aria-label="حجم الخط"
          title="حجم الخط"
          className={selectClassName}
          defaultValue=""
          onChange={(event) => {
            const index = FONT_SIZE_PREFIXES.indexOf(
              event.target.value as (typeof FONT_SIZE_PREFIXES)[number]
            );
            const prefix = FONT_SIZE_PREFIXES[index];
            if (index === -1 || !prefix) return;
            applyLinePrefix(prefix);
            event.target.value = '';
          }}
        >
          <option value="">الحجم</option>
          {FONT_SIZE_PREFIXES.map((prefix, index) => (
            <option key={prefix} value={prefix}>
              {FONT_SIZE_LABELS[index]}
            </option>
          ))}
        </select>

        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />

        {BLOCK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => applyBlock(action)}
              title={action.label}
              aria-label={action.label}
              className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
            >
              <Icon size={17} aria-hidden="true" />
            </button>
          );
        })}

        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />

        {ALIGN_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => applyBlock(action)}
              title={action.label}
              aria-label={action.label}
              className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
            >
              <Icon size={17} aria-hidden="true" />
            </button>
          );
        })}

        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />

        {WRAP_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => applyWrap(action)}
              title={action.label}
              aria-label={action.label}
              className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
            >
              <Icon size={17} aria-hidden="true" />
            </button>
          );
        })}

        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />

        <button
          type="button"
          onClick={applyImage}
          title="إدراج صورة"
          aria-label="إدراج صورة"
          className="flex size-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-muted"
        >
          <ImagePlus size={17} aria-hidden="true" />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full resize-y border-0 bg-surface px-3 py-3 text-base font-normal leading-8 text-foreground outline-none"
      />
    </div>
  );
}
