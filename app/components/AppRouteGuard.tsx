'use client';

import { Capacitor } from '@capacitor/core';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AppRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isNativeApp = isHydrated && Capacitor.isNativePlatform();
  const isAdminRoute = pathname.split('/').filter(Boolean).includes('admin');

  useEffect(() => {
    if (isNativeApp && isAdminRoute) {
      router.replace('/');
    }
  }, [isAdminRoute, isNativeApp, router]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollLeft = 0;
    if (document.body) document.body.scrollLeft = 0;
  }, [pathname]);

  if (isAdminRoute && !isHydrated) return null;

  if (isAdminRoute && isNativeApp) {
    return (
      <main
        className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
        dir="rtl"
      >
        <h1 className="text-2xl font-bold text-primary">لوحة الإدارة غير متاحة في التطبيق</h1>
        <p className="text-muted-foreground">يمكنك متابعة الدروس والواجبات من تطبيق قسمي.</p>
      </main>
    );
  }

  return children;
}
