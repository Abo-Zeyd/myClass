"use client";

import { FormEvent, useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import {
  loadLessonComments,
  submitLessonComment,
} from "../lessons/comments-actions";
import type { LessonComment } from "../../lib/content-db";

type LessonCommentsProps = {
  subjectId: string;
  lessonId: string;
  itemId: string;
};

function formatCommentDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("ar-DZ", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function LessonComments({ subjectId, lessonId, itemId }: LessonCommentsProps) {
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void loadLessonComments(subjectId, lessonId, itemId).then((result) => {
      if (!active) return;
      if (result.ok) setComments(result.value);
      else setMessage(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [itemId, lessonId, subjectId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const result = await submitLessonComment({
      subjectId,
      lessonId,
      itemId,
      displayName,
      body,
      website,
    });

    if (result.ok) {
      setComments((current) => [result.value, ...current].slice(0, 100));
      setBody("");
      setWebsite("");
      setMessage("تم إرسال تعليقك.");
    } else {
      setMessage(result.error);
    }

    setSubmitting(false);
  }

  return (
    <section className="min-w-0 border-t border-border pt-4" aria-labelledby={`${itemId}-comments-title`}>
      <h4 id={`${itemId}-comments-title`} className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageSquare size={17} aria-hidden="true" />
        التعليقات <span className="text-muted-foreground">({comments.length})</span>
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_2fr]">
          <label className="block text-sm font-medium text-foreground">
            الاسم
            <input
              required
              maxLength={60}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              autoComplete="name"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            التعليق
            <textarea
              required
              maxLength={1000}
              rows={2}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-1 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <label aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            <Send size={16} aria-hidden="true" />
            {submitting ? "جارٍ الإرسال..." : "إرسال التعليق"}
          </button>
        </div>
      </form>

      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto overscroll-contain border-t border-border pt-3" aria-label="قائمة التعليقات">
        {loading ? (
          <p className="text-sm text-muted-foreground">جارٍ تحميل التعليقات...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد تعليقات بعد.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="border-b border-border/70 pb-3 last:border-0">
              <header className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h5 className="text-sm font-semibold text-foreground">{comment.displayName}</h5>
                <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
                  {formatCommentDate(comment.createdAt)}
                </time>
              </header>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-foreground">{comment.body}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}