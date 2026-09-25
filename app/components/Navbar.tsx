import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-3 items-center">
        {/* الطرف الأيمن: فارغ للحفاظ على توازن وتوسيط المنتصف بدقة */}
        <div className="hidden sm:block" />

        {/* المنتصف: روابط التنقل */}
        <nav className="col-span-3 sm:col-span-1 flex items-center justify-center gap-4 text-base font-semibold">
          <Link
            href="/"
            className="px-4 py-1.5 rounded-lg text-foreground hover:text-primary hover:bg-surface-muted/60 transition-colors"
          >
            الرئيسية
          </Link>
          <Link
            href="/lessons"
            className="px-4 py-1.5 rounded-lg text-foreground hover:text-primary hover:bg-surface-muted/60 transition-colors"
          >
            الدروس
          </Link>
        </nav>

        {/* أقصى اليسار: عنوان الموقع واسم الأستاذ */}
        <div className="hidden sm:flex justify-end">
          <Link href="/" className="flex flex-col items-end text-left">
            <span className="text-lg font-bold text-primary">
              قسم السنة الرابعة
            </span>
            <span className="text-xs text-muted-foreground">
              الأستاذ: عز الدين عويسي
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}