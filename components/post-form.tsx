// components/post-form.tsx
"use client";

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
import { db } from "@/lib/firebase";

export function PostForm() {
  const router = useRouter();
  const { toast } = useToast();

  // 入力状態（連絡先系は完全に削除）
  const [category, setCategory] = useState<string>(categories[0] ?? "その他");
  const [rawText, setRawText] = useState<string>("");
  const [tagsInput, setTagsInput] = useState<string>(""); // カンマ区切りタグ（任意）
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // バリデーション（最低限）
    if (!rawText.trim()) {
      setErrorMsg("内容を入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      // タグ整形（空白トリム、重複除去、空文字除去）
      const tags = Array.from(
        new Set(
          tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        )
      );

      // Firestore へ追加（連絡先は含めない）
      await addDoc(collection(db, "issues"), {
        rawText: rawText.trim(),
        category,
        tags,
        likes: 0,
        status: "未対応",
        hidden: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "投稿しました", description: "ご協力ありがとうございます。" });
      router.push("/list");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("投稿に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border rounded-xl">
      <CardHeader>
        <CardTitle>投稿フォーム</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* カテゴリ */}
          <div className="grid gap-2">
            <Label htmlFor="category">カテゴリー</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="カテゴリーを選択" />
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

          {/* 本文 */}
          <div className="grid gap-2">
            <Label htmlFor="rawText">内容</Label>
            <Textarea
              id="rawText"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="職場で感じている課題や、改善してほしい点を具体的に教えてください。"
              rows={8}
            />
            <p className="text-xs text-muted-foreground">個人が特定される情報は書かないようご注意ください。</p>
          </div>

          {/* タグ（任意） */}
          <div className="grid gap-2">
            <Label htmlFor="tags">タグ（任意・カンマ区切り）</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例) 働き方, 評価制度, コミュニケーション"
            />
          </div>

          {/* 連絡先は削除済み */}

          {errorMsg && (
            <Alert variant="destructive">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "投稿する"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PostForm;
