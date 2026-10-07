export default function HomepageFooter({ year }: { year: number }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface py-8 text-center text-sm text-muted-foreground">
      <div className="mx-auto max-w-5xl space-y-2 px-6">
        <p>© {year} قسم السنة الرابعة - الأستاذ عز الدين عويسي. جميع الحقوق محفوظة.</p>
        <p className="text-xs text-muted-foreground">
          منصة تعليمية لدعم وتوجيه تلاميذ التعليم الابتدائي
        </p>
      </div>
    </footer>
  );
}
