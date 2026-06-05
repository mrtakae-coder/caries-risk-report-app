import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "唾液検査結果レポート作成アプリ",
  description: "歯科医院向けの唾液検査結果説明レポート作成アプリ"
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
