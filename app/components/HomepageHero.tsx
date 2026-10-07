import { Sparkles } from 'lucide-react';

export default function HomepageHero() {
  return (
    <section className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-accent p-6 text-white shadow-2xl transition-all hover:shadow-primary/10 sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-pattern opacity-20 transition-opacity group-hover:opacity-30" />
      <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
          <Sparkles size={16} aria-hidden="true" />
          <span>فضاء التعليم الابتدائي</span>
        </div>
        <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">
          أهلاً بكم في الفضاء التعليمي لقسم السنة الرابعة
        </h1>
        <p className="text-sm font-medium leading-relaxed text-surface-muted/90 sm:text-base">
          منصة مخصصة للتلاميذ وأولياء الأمور، تجدون فيها ملخصات الدروس اليومية، الواجبات المنزلية،
          والأنشطة الداعمة للتعلم والمراجعة.
        </p>
      </div>
    </section>
  );
}
