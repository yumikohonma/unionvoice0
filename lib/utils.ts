// lib/utils.ts
import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind 用: className を賢く結合 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/** ネストを辿って値を取得（"a.b.c" 形式） */
export function pick<T = unknown>(obj: any, path: string): T | undefined {
  return path.split(".").reduce<any>((o, k) => (o ? (o as any)[k] : undefined), obj);
}

/** 本文フィールドを抽出（代表的キー → 見つからなければ全探索） */
export function extractContent(post: any): string {
  const candidates = [
    "content", "body", "text", "description", "message", "detail", "details",
    "problem", "issue", "comment", "answer",
    "本文", "内容", "要望", "課題内容", "自由記述", "テキスト",
    "data.content", "data.body", "data.text",
    "fields.content", "fields.body", "fields.text",
    "form.content", "form.body", "form.text",
  ];
  for (const p of candidates) {
    const v = pick<string>(post, p);
    if (typeof v === "string" && v.trim()) return v;
  }
  // 最長の文字列を拾うフォールバック
  let best = "";
  const visit = (v: any) => {
    if (typeof v === "string") {
      const s = v.trim();
      if (s.length > best.length) best = s;
    } else if (v && typeof v === "object") {
      for (const k of Object.keys(v)) visit(v[k]);
    }
  };
  visit(post);
  return best;
}

/** タイトル抽出（なければ本文の先頭を流用） */
export function extractTitle(post: any): string {
  const candidates = [
    "title", "subject", "name", "headline", "summary",
    "data.title", "fields.title", "form.title",
    "件名", "題名", "タイトル", "課題名",
  ];
  for (const p of candidates) {
    const v = pick<string>(post, p);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const content = extractContent(post);
  return content ? content.slice(0, 30) : "";
}

