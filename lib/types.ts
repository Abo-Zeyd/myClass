/**
 * Centralized Type Definitions
 *
 * This file contains all shared types used across the application.
 * Import from here instead of duplicating type definitions.
 */

/* ==========================================================================
   Content Types (from Supabase/Database)
   ========================================================================== */

export interface Assignment {
  id: string;
  name: string;
  assignedDate: string; // ISO date string (YYYY-MM-DD)
  submissionDate: string; // ISO date string (YYYY-MM-DD)
  link?: string;
  completed: boolean;
}

export interface SupportingActivity {
  id: string;
  name: string;
  link?: string;
  completed: boolean;
}

export interface Announcement {
  id: string;
  message: string;
  active: boolean;
}

export interface HomepageSlide {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

/* ==========================================================================
   Lesson Types
   ========================================================================== */

export interface LessonImage {
  src: string;
  alt: string;
}

export interface LessonVideo {
  url: string;
  title?: string;
}

export interface LessonPdf {
  url: string;
  title?: string;
}

export interface LessonItem {
  id: string;
  title: string;
  summary?: string;
  activities?: string[];
  images?: LessonImage[];
  videos?: LessonVideo[];
  pdfs?: LessonPdf[];
}

export interface Lesson {
  id: string;
  title: string;
  items: LessonItem[];
}

/* ==========================================================================
   Subject Configuration
   ========================================================================== */

export const subjectFiles: Record<string, string> = {
  "islamic-education": "islamic-education.json",
  arabic: "arabic.json",
  mathematics: "mathematics.json",
  history: "history.json",
  geography: "geography.json",
  "civic-education": "civic-education.json",
  science: "science.json",
  memorization: "memorization.json",
} as const;

export type SubjectId = keyof typeof subjectFiles;

/* ==========================================================================
   Admin/Action Types (for Server Actions)
   ========================================================================== */

export interface AdminAssignment {
  id: string;
  name: string;
  assignedDate: string;
  submissionDate: string;
  link?: string;
  completed: boolean;
}

export interface AdminSupportingActivity {
  id: string;
  name: string;
  link?: string;
  completed: boolean;
}

export interface AdminLessonItem {
  id: string;
  title: string;
  summary?: string;
  activities: string[];
  images: { src: string; alt: string }[];
  videos: { url: string; title?: string }[];
  pdfs: { url: string; title?: string }[];
}

export interface AdminLesson {
  id: string;
  title: string;
  items: AdminLessonItem[];
}

/* ==========================================================================
   Utility Types
   ========================================================================== */

export type AssignmentStatus = "completed" | "pending" | "overdue";

export interface DateRange {
  start: string;
  end: string;
}

/* ==========================================================================
   Component Props Types
   ========================================================================== */

export interface LessonItemCardProps {
  item: LessonItem;
  lessonTitle: string;
  contentId: string;
  anchorBaseId: string;
  navigationTargetId: string | null;
  onClearNavigationTarget: () => void;
  isCollapsible: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

/* ==========================================================================
   Google Drive Types
   ========================================================================== */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
}