"use server";

import { headers } from "next/headers";
import {
  getHomepageComments,
  insertHomepageComment,
  type HomepageComment,
} from "../../lib/content-db";

type ActionResult<T> = { ok: true; value: T } | { ok: false; error: string };

const attemptsByAddress = new Map<string, number[]>();
const rateLimitWindowMs = 60_000;
const maxCommentsPerWindow = 3;

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
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
  if (attemptsByAddress.size > 5000) {
    for (const [key, timestamps] of attemptsByAddress) {
      if (timestamps.every((timestamp) => now - timestamp >= rateLimitWindowMs)) {
        attemptsByAddress.delete(key);
      }
    }
  }
  return false;
}

export async function loadHomepageComments(): Promise<ActionResult<HomepageComment[]>> {
  try {
    return { ok: true, value: await getHomepageComments() };
  } catch {
    return { ok: false, error: "تعذر تحميل التعليقات حالياً." };
  }
}

export async function submitHomepageComment(input: unknown): Promise<ActionResult<HomepageComment>> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "بيانات التعليق غير صالحة." };
  }

  const values = input as Record<string, unknown>;
  if (typeof values.website === "string" && values.website.trim()) {
    return { ok: false, error: "تعذر إرسال التعليق." };
  }

  const body = normalizeText(values.body, 1000);
  if (!body) {
    return { ok: false, error: "أدخل التعليق ضمن الحد المسموح." };
  }
  if (await isRateLimited()) {
    return { ok: false, error: "أرسلت تعليقات كثيرة. حاول مجدداً بعد دقيقة." };
  }

  try {
    const comment = await insertHomepageComment("زائر", body);
    return { ok: true, value: comment };
  } catch {
    return { ok: false, error: "تعذر إرسال التعليق حالياً." };
  }
}