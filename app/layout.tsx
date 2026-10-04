import type { Metadata, Viewport } from 'next';
import { Noto_Naskh_Arabic, Noto_Sans_Arabic } from 'next/font/google';
import AppRouteGuard from './components/AppRouteGuard';
import Navbar from './components/Navbar';
import './globals.css';

// استخدام خط واضح ومناسب للنصوص العربية
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-arabic',
});
const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-naskh-arabic',
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
      className={`${notoSansArabic.variable} ${notoNaskhArabic.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full w-full max-w-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden relative">
        <AppRouteGuard>
          <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden relative">
            <Navbar />
            <div className="flex-1 w-full max-w-full overflow-x-hidden">{children}</div>
          </div>
        </AppRouteGuard>
      </body>
    </html>
  );
}
