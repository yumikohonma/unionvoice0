// app/layout.tsx
import "./globals.css";          // 既存のグローバルCSS
import "@/styles/layout.css";    // ← ここを追加（先ほど作成したCSSをimport）

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Union Voice",
  description: "Unity in Diversity - 労働者の声の可視化プラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* 以前ここに <link rel="stylesheet" href="/layout.css"> があった場合は削除してください */}
      <body>{children}</body>
    </html>
  );
}
