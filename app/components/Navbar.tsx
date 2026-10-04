import Link from "next/link";
import { Home, BookOpen, GraduationCap } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-50 shadow-sm w-full max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between min-w-0">
        {/* جهة اليمين: الشعار واسم الأستاذ */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <GraduationCap size={28} />
          </div>
          <Link href="/" className="flex flex-col group">
            <span className="text-xl font-black text-primary group-hover:text-accent transition-colors leading-tight">
              قسم السنة الرابعة
            </span>
            <span className="text-[11px] font-bold text-muted-foreground tracking-tight uppercase">
              الأستاذ: عز الدين عويسي
            </span>
          </Link>
        </div>

        {/* جهة اليسار: روابط التنقل */}
        <nav className="flex items-center gap-3 text-base font-bold">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-foreground hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
          >
            <Home size={20} className="text-primary/70" />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
          <Link
            href="/lessons"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-foreground hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
          >
            <BookOpen size={20} className="text-primary/70" />
            <span className="hidden sm:inline">الدروس</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}