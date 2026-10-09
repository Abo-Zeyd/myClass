import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import AppRouteGuard from './components/AppRouteGuard';
import Navbar from './components/Navbar';
import './globals.css';

// خط Tajawal للنصوص العامة - عصري وواضح ومناسب للأطفال
const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
});

// خط Cairo للعناوين - متوازن وحديث
const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'قسم السنة الرابعة - الأستاذ عز الدين عويسي',
  description: 'المنصة التعليمية لقسم السنة الرابعة ابتدائي - دروس، ملخصات، وواجبات مدرسية',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${cairo.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full w-full max-w-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden relative">
        <AppRouteGuard>
          <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden relative">
            <Navbar />
            <div className="flex-1 w-full max-w-full overflow-x-hidden pt-28 sm:pt-20">{children}</div>
          </div>
        </AppRouteGuard>
      </body>
    </html>
  );
}
