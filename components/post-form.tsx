// components/post-form.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/lib/mock-data";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ★ getDb ではなく db を直 import

export function PostForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [rawText, setRawText] = useState("");
  const [category, setCategory] = useState<string>(categories[0] ?? "その他");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const text = rawText.trim();
    if (!text) {
      setErr("内容を入力してください。");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "issues"), {
        rawText: text,
        category: category || "その他",
        contact: contact || "",
        status: "未対応",
        likes: 0,
        hidden: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "投稿しました", description: "ご意見を受け付けました。ありがとうございました。" });
      setRawText("");
      setContact("");
      // 投稿後に一覧へ
      router.push("/list");
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "投稿に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>投稿フォーム</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {err && (
            <Alert variant="destructive">
              <AlertDescription>{err}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリー</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rawText">内容</Label>
            <Textarea
              id="rawText"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="匿名で安心してご意見をお寄せください。"
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">連絡先（任意）</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="返信をご希望の方は入力してください（任意）"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={loading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "送信中…" : "投稿する"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PostForm;
