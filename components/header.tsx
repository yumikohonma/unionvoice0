// /components/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/post", label: "投稿" },
  { href: "/chat", label: "チャット" },
  { href: "/list", label: "一覧" },
  { href: "/admin", label: "管理" },
];

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const displayName = useMemo(
    () => user?.displayName || user?.email || "User",
    [user],
  );

  const handleLogin = async () => {
    try {
      setBusy(true);
      // まずはポップアップ
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      // ポップアップがブロックされる環境向けにフォールバック
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (err2) {
        console.error("Google login failed:", err2);
        alert("ログインに失敗しました。ポップアップブロックを確認してください。");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      setBusy(true);
      await signOut(auth);
    } catch (err) {
      console.error("logout error:", err);
      alert("ログアウトに失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* 左：ロゴ */}
        <Link href="/" className="flex items-center gap-3">
          {/* 既存の public のロゴ画像に合わせて変更してください */}
          <Image
            src="/union-voice-logo.png"
            alt="Union Voice"
            width={120}
            height={120}
            priority
          />
          <span className="text-lg font-semibold tracking-wide">Union Voice</span>
        </Link>

        {/* 中央：ナビ */}
        <nav className="hidden gap-5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右：ログイン／ユーザー */}
        <div className="flex items-center gap-3">
          {!user ? (
            <button
              onClick={handleLogin}
              disabled={busy}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {busy ? "処理中…" : "ログイン"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {/* アバター */}
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="h-8 w-8 rounded-full ring-1 ring-gray-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm text-gray-700 md:inline">{displayName}</span>
              <button
                onClick={handleLogout}
                disabled={busy}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {busy ? "処理中…" : "ログアウト"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* モバイル用ナビ（必要なら） */}
      <div className="border-t md:hidden">
        <nav className="mx-auto flex max-w-7xl items-center justify-between overflow-x-auto px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
