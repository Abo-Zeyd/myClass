import Link from "next/link";
import { Home, BookOpen, GraduationCap } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-50 shadow-sm w-full max-w-full overflow-x-hidden">
      <div className="mx-auto flex h-16 min-w-0 max-w-6xl items-center justify-between px-3 sm:h-20 sm:px-6">
        {/* جهة اليمين: الشعار واسم الأستاذ */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
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

        {/* جهة اليسار: روابط التنقل */}
        <nav className="flex shrink-0 items-center gap-1 text-xs font-bold sm:gap-3 sm:text-base">
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
        </nav>
      </div>
    </header>
  );
}