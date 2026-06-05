import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "カリエスリスク レポート作成アプリ",
  description: "歯科医院向けのカリエスリスク説明レポート作成アプリ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
