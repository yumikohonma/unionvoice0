// components/email-auth.tsx
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function EmailAuth() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function login() {
    try {
      setLoading(true);
      setErr("");
      await signInWithEmailAndPassword(auth, email, pw);
      // 成功後はヘッダーのユーザー状態が切り替わります
    } catch (e: any) {
      setErr(e.message ?? "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function register() {
    try {
      setLoading(true);
      setErr("");
      await createUserWithEmailAndPassword(auth, email, pw);
    } catch (e: any) {
      setErr(e.message ?? "新規登録に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="メールアドレス"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="パスワード（6文字以上）"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
      />
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <div className="flex gap-2">
        <button
          onClick={login}
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          ログイン
        </button>
        <button
          onClick={register}
          disabled={loading}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          新規登録
        </button>
      </div>
    </div>
  );
}
