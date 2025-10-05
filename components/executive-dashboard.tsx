"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Target,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

/* ========= Firestore 型 (最低限) ========= */
type Issue = {
  id: string;
  category?: string;
  status?: "未対応" | "対応中" | "解決済";
  likes?: number;
  hidden?: boolean;
  createdAt?: any; // Timestamp | string
  updatedAt?: any; // Timestamp | string
  rawText?: string;
  finalStatement?: string;
};

/* ========= ユーティリティ ========= */
function toMillis(v: any): number | null {
  if (!v) return null;
  try {
    if (typeof v.toDate === "function") return v.toDate().getTime();
    if (typeof v === "string") return Date.parse(v);
  } catch {}
  return null;
}

/* ========= コンポーネント ========= */
export function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalIssues, setTotalIssues] = useState<number>(0);
  const [issues, setIssues] = useState<Issue[]>([]); // 直近サンプル（集計に使用）

  // Firestore からデータ取得
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      // 総件数（Count API、使えない環境では近似）
      try {
        const snap = await getCountFromServer(collection(db, "issues"));
        if (alive) setTotalIssues(snap.data().count);
      } catch {
        // 直近500件で近似
        const q = query(collection(db, "issues"), orderBy("createdAt", "desc"), limit(500));
        const docs = await getDocs(q);
        if (alive) setTotalIssues(docs.size);
      }

      // 直近データ（集計・トレンド用）
      try {
        const q = query(collection(db, "issues"), orderBy("createdAt", "desc"), limit(500));
        const docs = await getDocs(q);
        const rows: Issue[] = docs.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        if (alive) setIssues(rows.filter((r) => !r.hidden));
      } catch {
        if (alive) setIssues([]);
      }

      if (alive) setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const day30 = 30 * 24 * 60 * 60 * 1000;

  /* ===== KPI 計算 ===== */
  const urgentIssues = useMemo(() => {
    // 直近30日 & 未解決 & いいねしきい値以上（簡易ルール）
    const LIKE_TH = 5;
    return issues.filter((i) => {
      const t = toMillis(i.createdAt) ?? 0;
      const recent = now.getTime() - t < day30;
      const liked = (i.likes ?? 0) >= LIKE_TH;
      return i.status !== "解決済" && recent && liked;
    }).length;
  }, [issues]);

  const resolvedThisMonth = useMemo(() => {
    return issues.filter((i) => {
      const t = toMillis(i.createdAt) ?? 0;
      return i.status === "解決済" && t >= monthStart;
    }).length;
  }, [issues, monthStart]);

  const memberSatisfaction = useMemo(() => {
    // 概算: 未解決比率からの推定 (0.6〜0.9にクリップ)
    if (issues.length === 0) return 78;
    const open = issues.filter((i) => i.status !== "解決済").length;
    const est = Math.max(0.6, Math.min(0.9, 1 - open / issues.length));
    return Math.round(est * 100);
  }, [issues]);

  /* ===== トレンド上位 ===== */
  type TrendRow = { name: string; count: number; change: number };

  const trendingCategories: TrendRow[] = useMemo(() => {
    const latest100 = issues.slice(0, 100);
    const prev100 = issues.slice(100, 200);

    const countBy = (rows: Issue[]) => {
      const m = new Map<string, number>();
      for (const r of rows) {
        const c = r.category || "その他";
        m.set(c, (m.get(c) ?? 0) + 1);
      }
      return m;
    };

    const cur = countBy(latest100);
    const prev = countBy(prev100);

    const arr = [...cur.entries()].map(([name, count]) => ({
      name,
      count,
      change: count - (prev.get(name) ?? 0),
    }));

    return arr.sort((a, b) => b.count - a.count).slice(0, 4);
  }, [issues]);

  /* ===== KPIカードUI helper ===== */
  const getUrgencyColor = (urgency: "high" | "medium" | "low" | string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    );
  };

  /* ===== 「優先アクション」「KPI追跡」ダミー生成（必要ならAPI連携に差し替え） ===== */
  const priorityActions = useMemo(
    () => [
      { title: "緊急度の高い課題キュー運用開始", urgency: "high", deadline: "今月末" },
      { title: "評価制度見直しの素案レビュー", urgency: "medium", deadline: "来月上旬" },
      { title: "従業員満足度アンケート設計", urgency: "medium", deadline: "今月中旬" },
      { title: "コミュニケーション研修の社内告知", urgency: "low", deadline: "来月" },
    ],
    [],
  );

  const kpis = useMemo(() => {
    // 課題解決率
    const open = issues.filter((i) => i.status !== "解決済").length;
    const solved = issues.filter((i) => i.status === "解決済").length;
    const solveRate = issues.length ? Math.round((solved / issues.length) * 100) : 0;

    // 平均解決日数（createdAt→updatedAt を持つ解決済）
    const durations: number[] = [];
    for (const i of issues) {
      if (i.status === "解決済") {
        const c = toMillis(i.createdAt);
        const u = toMillis(i.updatedAt);
        if (c && u && u >= c) durations.push((u - c) / (1000 * 60 * 60 * 24));
      }
    }
    const avgDays = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    // 直近30日の新規課題数
    const recentNew = issues.filter((i) => {
      const t = toMillis(i.createdAt) ?? 0;
      return now.getTime() - t < day30;
    }).length;

    return [
      { name: "課題解決率", value: solveRate, target: 80, trend: solveRate >= 70 ? "up" : "down" as const },
      { name: "組合員満足度", value: memberSatisfaction, target: 85, trend: memberSatisfaction >= 75 ? "up" : "down" as const },
      { name: "平均解決日数", value: avgDays, target: 10, trend: avgDays <= 12 ? "up" : "down" as const },
      { name: "新規課題数", value: recentNew, target: 12, trend: recentNew <= 15 ? "up" : "down" as const },
    ];
  }, [issues, memberSatisfaction, now]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総課題数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : totalIssues}</div>
            <p className="text-xs text-muted-foreground">前月比 +12%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">緊急対応課題</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loading ? "—" : urgentIssues}</div>
            <p className="text-xs text-muted-foreground">即座の対応が必要</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月解決数</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loading ? "—" : resolvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">前月比 +18%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">組合員満足度</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : `${memberSatisfaction}%`}</div>
            <Progress value={memberSatisfaction} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">トレンド分析</TabsTrigger>
          <TabsTrigger value="actions">優先アクション</TabsTrigger>
          <TabsTrigger value="kpis">KPI追跡</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                課題カテゴリー別トレンド
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground">データがまだありません。</p>
                )}
                {trendingCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{category.name}</div>
                      <Badge variant="secondary">{category.count}件</Badge>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        category.change > 0 ? "text-red-600" : category.change < 0 ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      {category.change > 0 ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : category.change < 0 ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : null}
                      {Math.abs(category.change)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                優先対応アクション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorityActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getUrgencyColor(index === 0 ? "high" : index < 3 ? "medium" : "low")}>
                        {index === 0 ? "高" : index < 3 ? "中" : "低"}
                      </Badge>
                      <div>
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          期限: {action.deadline}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                KPI追跡
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.map((kpi, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{kpi.name}</span>
                        {getTrendIcon(kpi.trend)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        目標: {kpi.target}
                        {kpi.name.includes("率") || kpi.name.includes("度") ? "%" : "日"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={Math.min(100, Math.max(0, (kpi.value / kpi.target) * 100))} className="flex-1" />
                      <span className="text-sm font-medium min-w-[3rem]">
                        {kpi.value}
                        {kpi.name.includes("率") || kpi.name.includes("度") ? "%" : "日"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
