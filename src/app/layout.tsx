// =============================================================
// 全ページ共通の外枠（<html> と <body>）
// =============================================================
import type { Metadata } from "next";
import "./globals.css";

// <title> などの設定
export const metadata: Metadata = {
  title: "家計簿",
  description: "Next.js + PostgreSQL で作る学習用の家計簿アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
