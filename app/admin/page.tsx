import { hasAdminAuthConfig, isAdminAuthenticated } from "../../lib/admin-auth";
import Dashboard from "./Dashboard";
import { login } from "./actions";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  if (await isAdminAuthenticated()) return <Dashboard />;

  const { error } = await searchParams;
  const configured = hasAdminAuthConfig();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12" dir="rtl">
      <section className="w-full rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">دخول لوحة الإدارة</h1>
        <p className="mb-6 text-sm text-muted-foreground">إدارة الواجبات ومحتوى الدروس</p>

        {!configured ? (
          <p role="alert" className="rounded-md border border-amber-700/25 bg-amber-50 p-4 text-sm text-amber-950">
            أضف `ADMIN_PASSWORD` و`ADMIN_SESSION_SECRET` إلى متغيرات البيئة. كلمة المرور 12 حرفاً على الأقل، والسر 32 حرفاً على الأقل.
          </p>
        ) : (
          <form action={login} className="grid gap-4">
            {error === "invalid" && (
              <p role="alert" className="rounded-md border border-red-700/25 bg-red-50 p-3 text-sm text-red-900">
                كلمة المرور غير صحيحة.
              </p>
            )}
            <label className="grid gap-2 text-sm font-medium text-foreground">
              كلمة المرور
              <input
                autoComplete="current-password"
                className="min-h-12 rounded-md border border-border bg-background px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                maxLength={1024}
                name="password"
                required
                type="password"
              />
            </label>
            <button className="min-h-12 rounded-md bg-primary px-5 font-bold text-white hover:opacity-90" type="submit">
              تسجيل الدخول
            </button>
          </form>
        )}
      </section>
    </main>
  );
}