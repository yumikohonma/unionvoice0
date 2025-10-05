"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ListOrdered, Lightbulb } from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

type Stat = { label: string; value: number };
type CategoryCount = { category: string; count: number };

export default function ExecutiveAgentFeatures() {
  // ===== Firestore quick stats =====
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryCount[]>([]);

  // ===== LLM 実行（優先順位付け / 戦略提案） =====
  const [prioLoading, setPrioLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [prioResult, setPrioResult] = useState<string>("");
  const [planResult, setPlanResult] = useState<string>("");

  // 直近日数（必要なら変更）
  const DAYS = 14;

  useEffect(() => {
    (async () => {
      try {
        const since = new Date();
        since.setDate(since.getDate() - DAYS);

        // hidden = false のみ取得（createdAt はクライアント側でフィルタ）
        const q = query(collection(db, "issues"), where("hidden", "==", false));
        const snap = await getDocs(q);

        const rows = snap.docs
          .map((d) => d.data() as any)
          .filter((x) => {
            const t =
              x.createdAt?.toDate?.() ??
              (typeof x.createdAt === "string" ? new Date(x.createdAt) : undefined);
            return t ? t >= since : true;
          });

        // 簡易統計
        const total = rows.length;
        const unresolved = rows.filter((r) => r.status === "未対応").length;
        const inProgress = rows.filter((r) => r.status === "対応中").length;
        const resolved = rows.filter((r) => r.status === "解決済").length;
        const likes = rows.reduce(
          (acc, r) => acc + (typeof r.likes === "number" ? r.likes : 0),
          0
        );

        // カテゴリ上位3
        const byCat = new Map<string, number>();
        for (const r of rows) {
          const c = r.category ?? "その他";
          byCat.set(c, (byCat.get(c) ?? 0) + 1);
        }
        const top3 = [...byCat.entries()]
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setStats([
          { label: `直近${DAYS}日・総投稿`, value: total },
          { label: "未対応", value: unresolved },
          { label: "対応中", value: inProgress },
          { label: "解決済", value: resolved },
          { label: "総いいね数", value: likes },
        ]);
        setTopCategories(top3);
      } catch (e) {
        console.error("load quickstats error:", e);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, []);

  // LLM: 優先順位付け
  const runPrioritization = async () => {
    setPrioLoading(true);
    setPrioResult("");
    try {
      const res = await fetch("/api/executive-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                "直近の投稿を踏まえ、重要度×緊急度で課題の優先順位を上位5件まで示してください。",
                "各項目は『課題名／背景（1行）／初動アクション（1-2行）／推奨リードタイム』を箇条書きで。",
                "可能なら担当の想定（例: 人事部・現場マネジメント・法務 など）も添えてください。",
              ].join("\n"),
            },
          ],
        }),
      });
      setPrioResult(await res.text());
    } catch (e) {
      console.error(e);
      setPrioResult("優先順位付けの生成に失敗しました。");
    } finally {
      setPrioLoading(false);
    }
  };

  // LLM: 戦略的提案
  const runStrategy = async () => {
    setPlanLoading(true);
    setPlanResult("");
    try {
      const res = await fetch("/api/executive-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                "直近の投稿を踏まえ、3ヶ月の『実行計画（ロードマップ）』を提案してください。",
                "フェーズ別（0-2週／3-6週／7-12週）で、目的・主要タスク・成果物・KPI・想定リスク/回避策を簡潔に示してください。",
                "現実的に取り組める粒度でお願いします。",
              ].join("\n"),
            },
          ],
        }),
      });
      setPlanResult(await res.text());
    } catch (e) {
      console.error(e);
      setPlanResult("戦略提案の生成に失敗しました。");
    } finally {
      setPlanLoading(false);
    }
  };

  const empty = useMemo(
    () => stats.reduce((a, s) => a + s.value, 0) === 0,
    [stats]
  );

  return (
    <Card className="h-[600px] flex flex-col overflow-hidden rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle>エージェント機能</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-6 pr-1">
        {/* Quick Stats */}
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">直近データのサマリー</p>
          {loadingStats ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              集計中…
            </div>
          ) : empty ? (
            <div className="text-sm text-muted-foreground">
              直近{DAYS}日に可視投稿がありません。
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {stats.map((s) => (
                  <Badge
                    key={s.label}
                    variant="outline"
                    className="text-sm px-2 py-1"
                  >
                    {s.label}: <span className="ml-1 font-semibold">{s.value}</span>
                  </Badge>
                ))}
              </div>
              {topCategories.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  上位カテゴリ:&nbsp;
                  {topCategories.map((c, i) => (
                    <span key={c.category}>
                      {i > 0 && " / "}
                      <span className="font-medium">{c.category}</span> {c.count}件
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <Separator />

        {/* 優先順位付け */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              <h3 className="font-medium">課題分析・優先順位付け</h3>
            </div>
            <Button size="sm" onClick={runPrioritization} disabled={prioLoading}>
              {prioLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  生成中…
                </>
              ) : (
                <>実行</>
              )}
            </Button>
          </div>
          <div className="border rounded-lg p-3 min-h-[120px] whitespace-pre-wrap break-words text-sm bg-muted/40">
            {prioResult || "ボタンを押すと、直近の投稿に基づいて優先順位を生成します。"}
          </div>
        </section>

        {/* 戦略的提案 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <h3 className="font-medium">戦略的提案</h3>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={runStrategy}
              disabled={planLoading}
            >
              {planLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  生成中…
                </>
              ) : (
                <>提案を生成</>
              )}
            </Button>
          </div>
          <div className="border rounded-lg p-3 min-h-[120px] whitespace-pre-wrap break-words text-sm bg-muted/40">
            {planResult || "ボタンを押すと、直近の投稿に基づいて3ヶ月の実行計画案を生成します。"}
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          ※ 生成結果はAIの提案です。組織の方針・規程・法令に照らしてご判断ください。
        </p>
      </CardContent>
    </Card>
  );
}
