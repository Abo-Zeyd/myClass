import { 
  Library, 
  BookText, 
  Calculator, 
  History as HistoryIcon, 
  Map, 
  Scale, 
  FlaskConical, 
  ScrollText,
  ChevronLeft
} from "lucide-react";

export const subjects = [
  { id: "islamic-education", name: "التربية الإسلامية", icon: Library },
  { id: "arabic", name: "اللغة العربية", icon: BookText },

  { id: "mathematics", name: "الرياضيات", icon: Calculator },
  { id: "history", name: "التاريخ", icon: HistoryIcon },
  { id: "geography", name: "الجغرافيا", icon: Map },
  { id: "civic-education", name: "التربية المدنية", icon: Scale },
  { id: "science", name: "التربية العلمية", icon: FlaskConical },
  { id: "memorization", name: "المحفوظات", icon: ScrollText },
] as const;

type SidebarProps = {
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: typeof subjects[number]["id"]) => void;
};

export default function Sidebar({ selectedSubjectId, onSelectSubject }: SidebarProps) {
  return (
    <aside className="w-full md:w-72 bg-surface border border-border rounded-2xl p-5 shadow-md shrink-0">
      <h3 className="font-extrabold text-lg mb-5 text-foreground flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
        مواد السنة الرابعة
      </h3>
      <ul className="space-y-2">
        {subjects.map((item) => {
          const Icon = item.icon;
          const isActive = selectedSubjectId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectSubject(item.id)}
                className={`w-full flex items-center justify-between group px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-right ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-foreground hover:bg-surface-muted hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? "text-white" : "text-primary/70 group-hover:text-primary"} />
                  <span>{item.name}</span>
                </div>
                <ChevronLeft size={16} className={`transition-transform ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}