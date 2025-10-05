"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { app } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, pass);
      router.replace("/admin"); // 成功したら管理画面へ
    } catch (e: any) {
      setErr(e?.message ?? "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 border rounded-lg bg-white">
        <h1 className="text-xl font-bold">管理ログイン</h1>
        {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">{err}</div>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="w-full border rounded px-3 py-2"
          autoComplete="username"
          required
        />
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="パスワード"
          className="w-full border rounded px-3 py-2"
          autoComplete="current-password"
          required
        />
        <button disabled={loading} className="w-full bg-sky-500 text-white rounded py-2">
          {loading ? "ログイン中…" : "ログイン"}
        </button>
      </form>
    </main>
  );
}
