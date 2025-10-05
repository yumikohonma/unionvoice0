"use client"; 

import { useEffect, useState } from "react";

// Layout
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// Tabs / UI
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Agent
import { ExecutiveAgent } from "@/components/executive-agent";
import ExecutiveAgentFeatures from "@/components/executive-agent-features"; // ← 新規追加した右側機能カード
import { ExecutiveDashboard } from "@/components/executive-dashboard"; // ある場合のみ

// Admin guard（ログイン必須＆権限チェック）
import AdminGuard from "@/components/admin-guard";

// Firestore
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

// ===== Issue 型 =====
type Issue = {
  id: string;
  createdAt: string; // ISO string fallback
  category: string;
  rawText: string;
  finalStatement?: string;
  likes: number;
  status: "未対応" | "対応中" | "解決済";
  hidden?: boolean;
};

export default function AdminPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestore リアルタイム購読（createdAt の降順）
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Issue[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const createdAt =
            data.createdAt?.toDate?.()?.toISOString?.() ??
            (typeof data.createdAt === "string"
              ? data.createdAt
              : new Date().toISOString());
          return {
            id: d.id,
            category: data.category ?? "その他",
            rawText: data.rawText ?? "",
            finalStatement: data.finalStatement ?? "",
            likes: typeof data.likes === "number" ? data.likes : 0,
            status: (data.status as Issue["status"]) ?? "未対応",
            hidden: !!data.hidden,
            createdAt,
          };
        });
        setIssues(rows);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  // ステータス変更（1フィールドだけ更新）＋失敗時ロールバック
  const handleStatusChange = async (issueId: string, next: Issue["status"]) => {
    const prev = issues;
    // 楽観的更新
    setIssues((cur) =>
      cur.map((it) => (it.id === issueId ? { ...it, status: next } : it))
    );
    try {
      await updateDoc(doc(db, "issues", issueId), { status: next });
    } catch (e) {
      // 失敗 → ロールバック
      setIssues(prev);
      alert("ステータス更新に失敗しました。権限/ルールをご確認ください。");
      console.error(e);
    }
  };

  // 非表示トグル（1フィールドだけ更新）＋失敗時ロールバック
  const handleHiddenToggle = async (issueId: string, checked: boolean) => {
    const prev = issues;
    // 楽観的更新
    setIssues((cur) =>
      cur.map((it) => (it.id === issueId ? { ...it, hidden: checked } : it))
    );
    try {
      await updateDoc(doc(db, "issues", issueId), { hidden: checked });
    } catch (e) {
      // 失敗 → ロールバック
      setIssues(prev);
      alert("非表示の更新に失敗しました。権限/ルールをご確認ください。");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">執行部管理ダッシュボード</h1>
            <p className="text-muted-foreground">
              課題管理とAIエージェントによる執行部サポート
            </p>
          </div>

          {/* ログイン＆権限ガード */}
          <AdminGuard
            fallback={
              <Card className="mb-6">
                <CardContent className="py-10 text-center text-muted-foreground">
                  認証確認中…
                </CardContent>
              </Card>
            }
          >
            <Tabs defaultValue="agent" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="executive">執行部サポート</TabsTrigger>
                <TabsTrigger value="agent">AIエージェント</TabsTrigger>
                <TabsTrigger value="management">課題管理</TabsTrigger>
              </TabsList>

              {/* ---- 執行部サポート（既存ダッシュボード） ---- */}
              <TabsContent value="executive" className="space-y-6">
                {/* ある場合のみ */}
                <ExecutiveDashboard />
              </TabsContent>

              {/* ---- AI エージェント（左：チャット / 右：機能） ---- */}
              <TabsContent value="agent" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 左：チャット */}
                  <ExecutiveAgent />
                  {/* 右：集計・優先順位/戦略提案の実行カード */}
                  <ExecutiveAgentFeatures />
                </div>
              </TabsContent>

              {/* ---- 課題管理テーブル ---- */}
              <TabsContent value="management" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>課題管理テーブル</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">ID</TableHead>
                            <TableHead className="min-w-48">内容</TableHead>
                            <TableHead className="w-32">カテゴリー</TableHead>
                            <TableHead className="w-24">共感数</TableHead>
                            <TableHead className="w-36">ステータス</TableHead>
                            <TableHead className="w-24">非表示</TableHead>
                            <TableHead className="w-40">作成日</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground">
                                読み込み中…
                              </TableCell>
                            </TableRow>
                          ) : issues.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground">
                                データがありません
                              </TableCell>
                            </TableRow>
                          ) : (
                            issues.map((issue) => (
                              <TableRow key={issue.id}>
                                <TableCell className="font-mono text-xs">
                                  {issue.id.slice(0, 8)}
                                </TableCell>

                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="text-sm line-clamp-2">
                                      {issue.rawText || issue.finalStatement || "（本文なし）"}
                                    </p>
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <Badge variant="secondary" className="text-xs">
                                    {issue.category}
                                  </Badge>
                                </TableCell>

                                <TableCell className="text-center">{issue.likes}</TableCell>

                                <TableCell>
                                  <Select
                                    value={issue.status}
                                    onValueChange={(v) =>
                                      handleStatusChange(issue.id, v as Issue["status"])
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="未対応">未対応</SelectItem>
                                      <SelectItem value="対応中">対応中</SelectItem>
                                      <SelectItem value="解決済">解決済</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>

                                <TableCell>
                                  <Switch
                                    checked={issue.hidden || false}
                                    onCheckedChange={(c) => handleHiddenToggle(issue.id, c)}
                                  />
                                </TableCell>

                                <TableCell className="text-xs text-muted-foreground">
                                  {new Date(issue.createdAt).toLocaleDateString("ja-JP", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </AdminGuard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
