"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, HeartOff, Trash2, Maximize2, Minimize2 } from "lucide-react";
import type { Issue } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IssueCardProps {
  issue: Issue;
  onVote: (issueId: string, liked: boolean) => void;
  isLiked: boolean;
  onHide?: (issueId: string) => void; // 親から渡す
  /** カード内で本文を折りたたみ表示する（デフォルト: true） */
  collapsible?: boolean;
  /** 一覧以外でカードを使うときに全文をそのまま出したい場合 */
  forceFullText?: boolean;
  /** finalStatement があるときは本文プレビューを抑制する（デフォルト: true） */
  suppressPreviewWhenHasFinal?: boolean;
}

/**
 * タイトル文字列を生成（finalStatement を優先、なければ rawText 冒頭＋省略記号）
 */
export function computeDisplayTitle(issue: Issue): string {
  if (issue.finalStatement && issue.finalStatement.trim().length > 0) {
    return issue.finalStatement.trim();
  }
  const source = issue.rawText ?? "";
  const head = source.slice(0, 48);
  return head + (source.length > 48 ? "…" : "");
}

/**
 * 本文プレビューをカード内に表示するべきかどうか
 */
export function shouldShowInlineBody(
  issue: Issue,
  forceFullText: boolean,
  suppressPreviewWhenHasFinal: boolean
): boolean {
  if (forceFullText) return true;
  if (suppressPreviewWhenHasFinal && issue.finalStatement && issue.finalStatement.trim().length > 0) {
    return false;
  }
  return true;
}

export function IssueCard(props: IssueCardProps) {
    const {
    issue,
    onVote,
    isLiked,
    onHide,
    collapsible = true,
    forceFullText = false,
    suppressPreviewWhenHasFinal = false,
  } = props;

  const [isVoting, setIsVoting] = useState(false);
  const [open, setOpen] = useState(false); // Dialog open
  const [expanded, setExpanded] = useState(false); // 折りたたみ制御

  const handleVote = async () => {
    setIsVoting(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onVote(issue.id, !isLiked);
    setIsVoting(false);
  };

  const getStatusColor = (status: Issue["status"]) => {
    switch (status) {
      case "未対応":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "対応中":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "解決済":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const displayTitle = useMemo(() => computeDisplayTitle(issue), [issue.finalStatement, issue.rawText]);

  const showInlineBody = useMemo(
    () => shouldShowInlineBody(issue, forceFullText, suppressPreviewWhenHasFinal),
    [issue, forceFullText, suppressPreviewWhenHasFinal]
  );

  // onHide が渡ってきていて id があれば非表示可能
  const canHide = typeof onHide === "function" && !!issue.id;

  const handleHideClick = () => {
    if (!canHide) return;
    if (window.confirm("この投稿を一覧から非表示にします。よろしいですか？")) {
      onHide!(issue.id);
    }
  };

  const createdAtLabel = useMemo(
    () => new Date(issue.createdAt).toLocaleDateString("ja-JP"),
    [issue.createdAt]
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-2 line-clamp-2 break-words">{displayTitle}</h3>
            <div className="flex items-center gap-2 mb-2">
              {issue.category && (
                <Badge variant="secondary" className="text-xs">
                  {issue.category}
                </Badge>
              )}
              <Badge className={`text-xs ${getStatusColor(issue.status)}`}>{issue.status}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* 全文ダイアログ */}
            <Button
              variant="ghost"
              size="icon"
              title="全文表示"
              onClick={() => setOpen(true)}
              className="shrink-0"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            {canHide && (
              <Button
                variant="ghost"
                size="icon"
                title="この投稿を一覧から非表示にする"
                onClick={handleHideClick}
                className="shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 本文（折りたたみ or 全文） */}
        {issue.rawText && showInlineBody && (
          <div className="text-sm text-muted-foreground mb-3">
            {forceFullText ? (
              <p className="whitespace-pre-wrap break-words">{issue.rawText}</p>
            ) : collapsible ? (
              <>
                <p className={`whitespace-pre-wrap break-words ${expanded ? "" : "line-clamp-3"}`}>
                  {issue.rawText}
                </p>
                {issue.rawText.length > 80 && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="px-0 h-auto mt-1"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? (
                      <span className="inline-flex items-center gap-1">
                        <Minimize2 className="w-3 h-3" /> 折りたたむ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" /> もっと見る
                      </span>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <p className="whitespace-pre-wrap break-words line-clamp-3">{issue.rawText}</p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{createdAtLabel}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className={`h-8 px-2 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
            >
              {isLiked ? (
                <Heart className="w-4 h-4 fill-current" />
              ) : (
                <HeartOff className="w-4 h-4" />
              )}
              <span className="ml-1">{issue.likes}</span>
            </Button>
            <span className="text-xs">{isLiked ? "取り消す" : "共感する"}</span>
          </div>
        </div>
      </CardContent>

      {/* 全文表示ダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base break-words">
              {displayTitle || "投稿の詳細"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {createdAtLabel} ・ {issue.category} ・ {issue.status}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-6">
              {issue.rawText || issue.finalStatement}
            </p>
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// =============================
// Dev-time lightweight tests
// （本番では何もしません。開発時のみ console.assert で検証します）
// =============================
if (process.env.NODE_ENV !== "production") {
  const base: Issue = {
    id: "t1",
    category: "その他",
    status: "未対応" as Issue["status"],
    createdAt: new Date().toISOString(),
    likes: 0,
    rawText: "",
    finalStatement: "",
  } as Issue;

  // displayTitle: finalStatement を優先
  console.assert(
    computeDisplayTitle({ ...base, finalStatement: "要約", rawText: "長文" }) === "要約",
    "computeDisplayTitle should prefer finalStatement when present"
  );

  // displayTitle: rawText の省略表示
  const long = "あ".repeat(60);
  const t = computeDisplayTitle({ ...base, rawText: long, finalStatement: "" });
  console.assert(
    t.length > 0 && t.endsWith("…"),
    "computeDisplayTitle should add ellipsis for long rawText"
  );

  // shouldShowInlineBody: finalStatement がある＆抑制フラグ true なら非表示
  console.assert(
    shouldShowInlineBody({ ...base, finalStatement: "要約" }, false, true) === false,
    "shouldShowInlineBody should hide inline body when final exists and suppression is true"
  );

  // forceFullText が最優先
  console.assert(
    shouldShowInlineBody({ ...base, finalStatement: "要約" }, true, true) === true,
    "forceFullText should override and show inline body"
  );

  // finalStatement が無ければ表示
  console.assert(
    shouldShowInlineBody({ ...base, finalStatement: "" }, false, true) === true,
    "shouldShowInlineBody should show inline when no finalStatement"
  );
}
