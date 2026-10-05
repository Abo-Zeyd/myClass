import { BookOpen, GraduationCap, Home } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full max-w-full overflow-x-hidden border-b border-border/80 bg-surface/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 min-w-0 max-w-6xl flex-col gap-2 px-3 py-2 sm:min-h-20 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 text-foreground transition-colors hover:text-primary"
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 sm:size-12">
            <GraduationCap size={26} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-base font-black leading-tight text-primary transition-colors group-hover:text-accent sm:text-xl">
              قسم السنة الرابعة
            </span>
            <span className="block truncate text-[11px] font-bold text-muted-foreground sm:text-xs">
              الأستاذ: عز الدين عويسي
            </span>
          </div>
        </Link>

        <nav
          aria-label="روابط التنقل الرئيسية"
          className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-border/80 bg-background/70 p-1 text-sm font-bold shadow-inner shadow-black/5 sm:w-auto sm:min-w-64 sm:text-base"
        >
          <Link
            href="/"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-foreground transition-all hover:bg-primary hover:text-white active:scale-95"
          >
            <Home size={18} aria-hidden="true" />
            <span>الرئيسية</span>
          </Link>
          <Link
            href="/lessons"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-foreground transition-all hover:bg-primary hover:text-white active:scale-95"
          >
            <BookOpen size={18} aria-hidden="true" />
            <span>الدروس</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
