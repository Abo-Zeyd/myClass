import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

// استخدام خط تجوال المتميز للغة العربية
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "قسم السنة الرابعة - الأستاذ عز الدين عويسي",
  description: "المنصة التعليمية لقسم السنة الرابعة ابتدائي - دروس، ملخصات، وواجبات مدرسية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {/* الشريط العلوي المشترك لجميع الصفحات */}
        <Navbar />

        {/* محتوى الصفحات */}
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}