const subjects = [
  { name: "التربية الإسلامية", icon: "🕌" },
  { name: "اللغة العربية", icon: "📖" },
  { name: "الرياضيات", icon: "📐" },
  { name: "التاريخ", icon: "🏛️" },
  { name: "الجغرافيا", icon: "🌍" },
  { name: "التربية المدنية", icon: "⚖️" },
  { name: "التربية العلمية", icon: "🔬" },
  { name: "المحفوظات", icon: "📜" },
];

export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 bg-surface border border-border rounded-xl p-4 shadow-sm shrink-0">
      <h3 className="font-bold text-base mb-3 text-foreground border-b border-border pb-2">
        مواد السنة الرابعة
      </h3>
      <ul className="space-y-1">
        {subjects.map((item, index) => (
          <li key={index}>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-surface-muted/60 hover:text-primary font-medium transition-all text-right"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}