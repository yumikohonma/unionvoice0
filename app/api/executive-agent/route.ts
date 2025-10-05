import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
} from "firebase/firestore";

/**
 * Firestore から直近の issues を取得
 * - 複合 index が不要なように、where は使わず orderBy + limit のみ
 * - hidden はサーバー側でフィルタ
 */
async function fetchRecentIssues(max = 120) {
  try {
    const q = query(
      collection(db, "issues"),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        rawText: data.rawText ?? "",
        finalStatement: data.finalStatement ?? "",
        category: data.category ?? "その他",
        likes: typeof data.likes === "number" ? data.likes : 0,
        status: data.status ?? "未対応",
        hidden: !!data.hidden,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() ??
          (typeof data.createdAt === "string"
            ? data.createdAt
            : new Date().toISOString()),
      };
    });
    // hidden を除外
    return rows.filter((r) => !r.hidden);
  } catch (e) {
    console.error("fetchRecentIssues error:", e);
    return [];
  }
}

/**
 * OpenAI へ問い合わせ（シンプルな fetch）
 */
async function callOpenAI(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "OPENAI_API_KEY が未設定です。.env.local を確認してください。";
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI error:", errText);
      return `OpenAI API エラー: ${res.status}`;
    }

    const json = await res.json();
    const text =
      json?.choices?.[0]?.message?.content?.toString() ??
      "（応答が取得できませんでした）";
    return text;
  } catch (e: any) {
    console.error("OpenAI fetch error:", e);
    return "OpenAI への接続に失敗しました。ネットワークをご確認ください。";
  }
}

/**
 * POST /api/executive-agent
 * body:
 *  - action?: "analyzeAndPrioritize" | undefined
 *  - messages?: {role, content}[]
 *  - hint?: string   // ← 任意の指示文（UIの入力欄の内容を渡せる）
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      messages = [],
      action,
      hint = "",
    }: {
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
      action?: string;
      hint?: string;
    } = body;

    if (action === "analyzeAndPrioritize") {
      const issues = await fetchRecentIssues(120);

      // AI への材料（テキスト化）
      const materials = issues
        .map((i) => {
          const t = (i.rawText || i.finalStatement || "").replace(/\s+/g, " ").trim();
          const date = new Date(i.createdAt).toLocaleString("ja-JP");
          return `- [${date}] (${i.category}) いいね:${i.likes} / ステータス:${i.status} : ${t}`;
        })
        .slice(0, 120)
        .join("\n");

      const system = {
        role: "system" as const,
        content:
          "あなたは労働組合の執行部を支援するアナリストです。投稿の傾向・優先課題・初動アクション案を、簡潔かつ実務的に日本語でまとめてください。箇条書きと小見出しを使い、読みやすく。",
      };

      // 入力欄の「指示文（任意）」を同梱できるように
      const user = {
        role: "user" as const,
        content:
          (hint ? `【執行部からの指示】\n${hint}\n\n` : "") +
          `以下は直近の投稿データです。傾向を要約し、優先課題トップ3と、それぞれの初動アクション案（3つ程度）を提案してください。\n\n` +
          `【直近投稿(最大120件)】\n${materials || "（投稿データなし）"}`,
      };

      const text = await callOpenAI([system, user]);
      return new Response(text, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 通常の対話（フロントの messages をそのまま前段に）
    const system = {
      role: "system" as const,
      content:
        "あなたは労働組合の執行部をサポートするアシスタントです。事実に基づき、簡潔・実務的な日本語で回答してください。",
    };
    const conv = [
      system,
      ...messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content ?? ""),
      })),
    ];

    const text = await callOpenAI(conv);
    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    console.error("POST /api/executive-agent error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
