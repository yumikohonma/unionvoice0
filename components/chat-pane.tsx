// components/chat-pane.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

type Msg = { role: "user" | "assistant"; content: string; ts: number }

function hasConfirmedBlock(text: string) {
  return /《確定》[\s\S]*?《\/確定》/.test(text)
}

function extractConfirmedOnly(text: string) {
  const m = text.match(/《確定》([\s\S]*?)《\/確定》/)
  if (!m) return ""
  return m[1].trim()
}

export function ChatPane() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "職場の“組織課題”に絞って整理します。まず背景を把握するために担当部門・簡単な業務内容を教えてください         （例：営業部門/量販MD　など）。",
      ts: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)

  // 直近のアシスタント発話から《確定》を検出
  const lastAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  )
  const confirmedText = useMemo(
    () => (lastAssistant ? extractConfirmedOnly(lastAssistant.content) : ""),
    [lastAssistant],
  )
  const canPost = !!confirmedText

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: "user" as const, content: text, ts: Date.now() }]
    setMessages(next)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data: { reply?: string } = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "（返答を生成できませんでした）",
          ts: Date.now(),
        },
      ])
    } catch (e) {
      console.error(e)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "すみません。少し時間をおいてもう一度お試しください。",
          ts: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const postConfirmed = async () => {
    if (!confirmedText || saving) return
    try {
      setSaving(true)

      // Firestore へ保存（issues コレクション）
      // 必須フィールドは運用に合わせて調整してください
      await addDoc(collection(db, "issues"), {
        createdAt: serverTimestamp(), // サーバ時刻
        rawText: confirmedText,       // 《確定》の中身のみ
        category: "その他",
        tags: [],
        likes: 0,
        status: "未対応",
        hidden: false,
      })

      // 保存できたらチャットに反映
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "《確定》の内容で投稿しました。ご協力ありがとうございます。",
          ts: Date.now(),
        },
      ])
    } catch (e) {
      console.error(e)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "投稿に失敗しました。通信状況をご確認のうえ、もう一度お試しください。",
          ts: Date.now(),
        },
      ])
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  return (
    <div className="grid grid-rows-[1fr_auto] h-[70vh] gap-4">
      {/* トーク表示 */}
      <div ref={listRef} className="rounded-2xl border bg-card/50 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={m.ts + i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted border rounded-2xl px-4 py-2">入力中…</div>
            </div>
          )}
        </div>
      </div>

      {/* 入力＆操作 */}
      <div className="rounded-2xl border bg-card/50 p-3">
        {/* 《確定》プレビューと投稿ボタン */}
        {canPost && (
          <div className="mb-3 rounded-xl border bg-background p-3">
            <div className="text-sm text-muted-foreground mb-1">投稿内容（《確定》のみ）</div>
            <div className="whitespace-pre-wrap text-sm">{confirmedText}</div>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setInput("OK")} disabled={loading || saving}>
                内容修正を続ける
              </Button>
              <Button onClick={postConfirmed} disabled={saving}>
                {saving ? "投稿中…" : "この内容で投稿"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3">
          <Textarea
            placeholder="ここに入力して Enter で送信（Shift+Enter で改行）"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-h-[56px] max-h-40 resize-y"
            disabled={loading}
          />
          <Button onClick={send} disabled={loading || !input.trim()}>
            送信
          </Button>
        </div>
      </div>
    </div>
  )
}
