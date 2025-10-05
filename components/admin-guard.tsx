"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AdminGuardProps = {
  children: React.ReactNode;
  /** 認証確認中に表示するプレースホルダー（未指定ならデフォルト文言） */
  fallback?: React.ReactNode;
};

/**
 * サインイン済みかどうかだけをチェックする簡易ガード。
 * 必要ならカスタムクレームやメールホワイトリストなどで「管理者判定」を追加してください。
 */
export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setReady(true);
        return;
      }
      // ★ここで管理者判定を追加したい場合は行う（例: user.email のホワイトリスト など）
      setAllowed(true);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) {
    return <>{fallback ?? <p className="text-sm text-muted-foreground">認証確認中…</p>}</>;
  }

  if (!allowed) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        サインインが必要です。上部のメニューからログインしてください。
      </div>
    );
  }

  return <>{children}</>;
}

export default AdminGuard;
