import { BookOpen, Bug, FileVideo, GraduationCap, Home } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full max-w-full overflow-x-hidden border-b border-border bg-surface/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-16 min-w-0 max-w-6xl flex-col gap-1 px-3 py-2 sm:h-20 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
        <div className="flex w-full min-w-0 items-center justify-center gap-2 sm:w-auto sm:justify-start sm:gap-4">
          <div className="hidden size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner sm:flex">
            <GraduationCap size={28} />
          </div>
          <Link href="/" className="group flex min-w-0 flex-col">
            <span className="truncate text-base font-black leading-tight text-primary transition-colors group-hover:text-accent sm:text-xl">
              قسم السنة الرابعة
            </span>
            <span className="truncate text-[10px] font-bold uppercase tracking-tight text-muted-foreground sm:text-[11px]">
              الأستاذ: عز الدين عويسي
            </span>
          </Link>
        </div>

        <nav
          aria-label="روابط التنقل الرئيسية"
          className="flex w-full shrink-0 items-center justify-center gap-1 border-t border-border/60 pt-1 text-xs font-bold sm:w-auto sm:justify-start sm:gap-3 sm:border-0 sm:pt-0 sm:text-base"
        >
          <Link
            href="/"
            className="flex min-h-11 items-center gap-1 rounded-xl px-2 py-2 text-foreground transition-all hover:bg-primary/5 hover:text-primary active:scale-95 sm:gap-2 sm:px-4"
          >
            <Home size={18} className="text-primary/70 sm:size-5" />
            <span>الرئيسية</span>
          </Link>
          <Link
            href="/lessons"
            className="flex min-h-11 items-center gap-1 rounded-xl px-2 py-2 text-foreground transition-all hover:bg-primary/5 hover:text-primary active:scale-95 sm:gap-2 sm:px-4"
          >
            <BookOpen size={18} className="text-primary/70 sm:size-5" />
            <span>الدروس</span>
          </Link>
          <Link
            href="/videos"
            className="flex min-h-11 items-center gap-1 rounded-xl px-2 py-2 text-foreground transition-all hover:bg-primary/5 hover:text-primary active:scale-95 sm:gap-2 sm:px-4"
          >
            <FileVideo size={18} className="text-primary/70 sm:size-5" />
            <span>فيديوهات</span>
          </Link>
          <Link
            href="/reports"
            className="flex min-h-11 items-center gap-1 rounded-xl bg-error px-3 py-2 text-white shadow-sm transition-all hover:brightness-110 active:scale-95 sm:gap-2 sm:px-4"
          >
            <Bug size={18} className="shrink-0 sm:size-5" aria-hidden="true" />
            <span>تبليغ</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
