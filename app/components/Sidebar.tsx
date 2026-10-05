import {
  BookText,
  Calculator,
  ChevronLeft,
  FlaskConical,
  History as HistoryIcon,
  Library,
  Map,
  Scale,
  ScrollText,
} from 'lucide-react';

export const subjects = [
  { id: 'islamic-education', name: 'التربية الإسلامية', icon: Library },
  { id: 'arabic', name: 'اللغة العربية', icon: BookText },

  { id: 'mathematics', name: 'الرياضيات', icon: Calculator },
  { id: 'history', name: 'التاريخ', icon: HistoryIcon },
  { id: 'geography', name: 'الجغرافيا', icon: Map },
  { id: 'civic-education', name: 'التربية المدنية', icon: Scale },
  { id: 'science', name: 'التربية العلمية', icon: FlaskConical },
  { id: 'memorization', name: 'المحفوظات', icon: ScrollText },
] as const;

type SidebarProps = {
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: (typeof subjects)[number]['id']) => void;
};

export default function Sidebar({ selectedSubjectId, onSelectSubject }: SidebarProps) {
  return (
    <aside className="w-full max-w-full md:w-72 bg-surface border border-border rounded-2xl p-3.5 sm:p-5 shadow-md shrink-0 min-w-0">
      <h3 className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-3 text-lg font-extrabold text-foreground shadow-sm">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <Library size={18} aria-hidden="true" />
        </span>
        <span className="truncate">مواد السنة الرابعة</span>
      </h3>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {subjects.map((item) => {
          const Icon = item.icon;
          const isActive = selectedSubjectId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectSubject(item.id)}
                className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-right text-sm font-bold transition-all group sm:px-4 md:py-3.5 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'text-foreground hover:bg-surface-muted hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    className={isActive ? 'text-white' : 'text-primary/70 group-hover:text-primary'}
                  />
                  <span>{item.name}</span>
                </div>
                <ChevronLeft
                  size={16}
                  className={`transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
