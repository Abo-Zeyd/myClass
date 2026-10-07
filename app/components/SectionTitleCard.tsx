import type { LucideIcon } from 'lucide-react';

type SectionTitleCardProps = {
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  tone?: 'primary' | 'secondary';
  id: string;
};

export default function SectionTitleCard({
  title,
  description,
  badge,
  icon: Icon,
  tone = 'primary',
  id,
}: SectionTitleCardProps) {
  const toneClasses =
    tone === 'secondary'
      ? 'bg-secondary text-white shadow-secondary/20'
      : 'bg-primary text-white shadow-primary/20';
  const badgeClasses =
    tone === 'secondary'
      ? 'border-secondary/20 bg-secondary/10 text-secondary'
      : 'border-primary/20 bg-primary/10 text-primary';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/60 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-lg ${toneClasses}`}
          aria-hidden="true"
        >
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <h2 id={id} className="truncate text-lg font-black text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
            {description}
          </p>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold sm:text-sm ${badgeClasses}`}
      >
        {badge}
      </span>
    </header>
  );
}
