export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans" dir="rtl">
      {/* الترويسة / الهيدر */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              قسم السنة الرابعة
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              الأستاذ: عز الدين عويسي
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-900">
            التعليم الابتدائي
          </span>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">
        {/* بطاقة الترحيب */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-snug">
              أهلاً بكم في الفضاء التعليمي لقسم السنة الرابعة
            </h2>
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
              منصة مخصصة لتلاميذ وأولياء أمور قسم السنة الرابعة، تجدون فيها ملخصات الدروس اليومية، الواجبات المنزلية، والأنشطة الداعمة لنتعلم ونتفوق معاً.
            </p>
          </div>
          {/* لمسة جمالية في الخلفية */}
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* أقسام المنصة السريعة */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* بطاقة الدروس */}
          <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold mb-4">
              📚
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              ملخصات الدروس
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              مراجعات مبسطة لدروس اللغة العربية، الرياضيات، التاريخ والجغرافيا، والتربية العلمية.
            </p>
          </div>

          {/* بطاقة الواجبات */}
          <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold mb-4">
              📝
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              الواجبات والتطبيقات
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              تمارين أسبوعية ومهام منزلية تدريبية لمتابعة مستوى التحصيل الدراسي خطوة بخطوة.
            </p>
          </div>

          {/* بطاقة الإعلانات */}
          <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold mb-4">
              📢
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              إعلانات وتوجيهات
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              مواعيد الاختبارات، رزنامة العطل، وإرشادات هامة موجهة لأولياء الأمور الكرام.
            </p>
          </div>
        </section>
      </main>

      {/* التذييل / الفوتر */}
      <footer className="mt-16 border-t border-zinc-200 bg-white py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <div className="max-w-5xl mx-auto px-6 space-y-2">
          <p>© {new Date().getFullYear()} قسم السنة الرابعة - الأستاذ عز الدين عويسي. جميع الحقوق محفوظة.</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">منصة تعليمية لدعم وتوجيه تلاميذ التعليم الابتدائي</p>
        </div>
      </footer>
    </div>
  );
}