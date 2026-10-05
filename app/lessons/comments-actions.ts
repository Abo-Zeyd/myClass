"use server";

import { headers } from "next/headers";
import {
  getLessonComments as readLessonComments,
  insertLessonComment,
  lessonItemExists,
  type LessonComment,
} from "../../lib/content-db";

type ActionResult<T> = { ok: true; value: T } | { ok: false; error: string };

const attemptsByAddress = new Map<string, number[]>();
const rateLimitWindowMs = 60_000;
const maxCommentsPerWindow = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validReference(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 120;
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length <= maxLength
    ? value.trim()
    : null;
}

async function isRateLimited() {
  const requestHeaders = await headers();
  const address =
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const now = Date.now();
  const recentAttempts = (attemptsByAddress.get(address) ?? []).filter(
    (timestamp) => now - timestamp < rateLimitWindowMs,
  );

  if (recentAttempts.length >= maxCommentsPerWindow) {
    attemptsByAddress.set(address, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  attemptsByAddress.set(address, recentAttempts);
  return false;
}

export async function loadLessonComments(
  subjectId: string,
  lessonId: string,
  itemId: string,
): Promise<ActionResult<LessonComment[]>> {
  if (![subjectId, lessonId, itemId].every(validReference)) {
    return { ok: false, error: "تعذر تحميل التعليقات." };
  }

  try {
    return {
      ok: true,
      value: await readLessonComments(subjectId, lessonId, itemId),
    };
  } catch {
    return { ok: false, error: "تعذر تحميل التعليقات حالياً." };
  }
}

export async function submitLessonComment(input: unknown): Promise<ActionResult<LessonComment>> {
  if (!isRecord(input)) return { ok: false, error: "بيانات التعليق غير صالحة." };
  if (typeof input.website === "string" && input.website.trim()) {
    return { ok: false, error: "تعذر إرسال التعليق." };
  }

  const { subjectId, lessonId, itemId } = input;
  const body = normalizeText(input.body, 1000);

  if (!validReference(subjectId) || !validReference(lessonId) || !validReference(itemId)) {
    return { ok: false, error: "بطاقة الدرس غير صالحة." };
  }
  if (!body) {
    return { ok: false, error: "أدخل التعليق." };
  }
  if (await isRateLimited()) {
    return { ok: false, error: "أرسلت تعليقات كثيرة. حاول مجدداً بعد دقيقة." };
  }

  try {
    if (!(await lessonItemExists(subjectId, lessonId, itemId))) {
      return { ok: false, error: "بطاقة الدرس غير موجودة." };
    }
    const comment = await insertLessonComment(
      subjectId,
      lessonId,
      itemId,
      "زائر",
      body,
    );
    return { ok: true, value: comment };
  } catch {
    return { ok: false, error: "تعذر إرسال التعليق حالياً." };
  }
}