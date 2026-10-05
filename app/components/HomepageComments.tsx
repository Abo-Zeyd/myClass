"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MessageSquare, Send } from "lucide-react";
import {
  loadHomepageComments,
  submitHomepageComment,
} from "../homepage-comments/actions";
import type { HomepageComment } from "../../lib/content-db";

function formatCommentDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("ar-DZ", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function HomepageComments() {
  const [comments, setComments] = useState<HomepageComment[]>([]);
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void loadHomepageComments().then((result) => {
      if (!active) return;
      if (result.ok) setComments(result.value);
      else setMessage(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const result = await submitHomepageComment({ body, website });

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
    <section
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"
      aria-labelledby="homepage-comments-title"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/30 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <span className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white" aria-hidden="true">
            <MessageSquare size={21} />
          </span>
          <div className="min-w-0">
            <h2 id="homepage-comments-title" className="text-lg sm:text-xl font-bold text-foreground truncate">تعليقات الزوار</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">شاركنا رأيك أو اترك كلمة طيبة.</p>
          </div>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-bold text-primary shrink-0">
          {comments.length} تعليق
        </span>
      </header>

      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            التعليق
            <textarea
              required
              maxLength={1000}
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-1 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
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
            <p role="status" className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
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

        <div className="max-h-80 space-y-3 overflow-y-auto overscroll-contain border-t border-border pt-4 lg:border-r lg:border-t-0 lg:pr-5 lg:pt-0" aria-label="قائمة تعليقات الزوار">
          {loading ? (
            <p className="text-sm text-muted-foreground">جارٍ تحميل التعليقات...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد تعليقات بعد.</p>
          ) : (
            comments.map((comment) => (
              <article key={comment.id} className="border-b border-border/70 pb-3 last:border-0">
                <header className="mb-1 flex justify-end">
                  <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
                    {formatCommentDate(comment.createdAt)}
                  </time>
                </header>
                <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-foreground">{comment.body}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}