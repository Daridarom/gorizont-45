import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Горизонт 45 — Бухта Космонавтов",
  description:
    "Ландшафтный комплекс у Бухты Космонавтов: гостевые дома, панорамное кафе, SPA, события и природные маршруты.",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
