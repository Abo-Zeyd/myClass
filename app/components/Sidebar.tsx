export const subjects = [
  { id: "islamic-education", name: "التربية الإسلامية", icon: "🕌" },
  { id: "arabic", name: "اللغة العربية", icon: "📖" },
  { id: "mathematics", name: "الرياضيات", icon: "📐" },
  { id: "history", name: "التاريخ", icon: "🏛️" },
  { id: "geography", name: "الجغرافيا", icon: "🌍" },
  { id: "civic-education", name: "التربية المدنية", icon: "⚖️" },
  { id: "science", name: "التربية العلمية", icon: "🔬" },
  { id: "memorization", name: "المحفوظات", icon: "📜" },
];

type SidebarProps = {
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
};

export default function Sidebar({ selectedSubjectId, onSelectSubject }: SidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-surface border border-border rounded-xl p-4 shadow-sm shrink-0">
      <h3 className="font-bold text-base mb-3 text-foreground border-b border-border pb-2">
        مواد السنة الرابعة
      </h3>
      <ul className="space-y-1">
        {subjects.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={selectedSubjectId === item.id}
              onClick={() => onSelectSubject(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-right ${
                selectedSubjectId === item.id
                  ? "bg-surface-muted text-primary"
                  : "text-foreground hover:bg-surface-muted/60 hover:text-primary"
              }`}
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