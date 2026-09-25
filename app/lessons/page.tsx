import Sidebar from "../components/Sidebar";

export default function LessonsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* الشريط الجانبي للمواد */}
        <Sidebar />

        {/* مساحة عرض الدروس */}
        <main className="flex-1 w-full bg-surface border border-border rounded-xl p-6 shadow-sm min-h-112.5">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            محتوى الدروس
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            اختر إحدى المواد من القائمة الجانبية لعرض الدروس والملخصات والأنشطة المتعلقة بها.
          </p>
        </main>
      </div>
    </div>
  );
}