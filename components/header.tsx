// components/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // 無ければ下の簡易 cn を使ってください

// // utils が無い場合は↓を使ってOK
// function cn(...classes: Array<string | false | undefined>) {
//   return classes.filter(Boolean).join(" ");
// }

export function Header() {
  const pathname = usePathname();

  // ★ マップは一時的に非表示のまま
  const nav = [
    { label: "ホーム", href: "/" },
    { label: "投稿", href: "/post" },
    { label: "チャット", href: "/chat" },
    { label: "一覧", href: "/list" },
    // { label: "マップ", href: "/map" },
    { label: "管理", href: "/admin" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* --- ロゴ --- */}
        <Link href="/" className="flex items-center gap-2" aria-label="Union Voice ホームへ">
          <div className="relative h-20  w-[150px] sm:w-[180px]">
            {/* 画像を /public に置いたファイル名に合わせて変更してください */}
            <Image
              src="/union-voice-logo.png" // 例: /union-voice-logo.svg でもOK
              alt="Union Voice"
              fill
              priority
              sizes="(max-width: 640px) 150px, 180px"
              style={{ objectFit: "contain" }}
            />
          </div>
          {/* アクセシビリティ用にテキストは画面外に置いておく */}
          <span className="sr-only">Union Voice</span>
        </Link>

        {/* --- ナビ --- */}
        <nav className="flex gap-2">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
