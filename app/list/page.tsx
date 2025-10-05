"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IssueCard } from "@/components/issue-card"
import { FilterBar } from "@/components/filter-bar"

import { db } from "@/lib/firebase"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore"

// Firestore に保存している Issue の型（最低限）
type Issue = {
  id: string
  createdAt: string // ISO 文字列 or フォールバック
  category: string
  rawText: string
  finalStatement?: string
  likes: number
  status: "未対応" | "対応中" | "解決済"
  hidden?: boolean
}

export default function ListPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [likedIssues, setLikedIssues] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Firestore から一覧購読
  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      const rows: Issue[] = snap.docs.map((d) => {
        const data = d.data() as any
        const createdAt =
          data.createdAt?.toDate?.()?.toISOString?.() ??
          (typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString())

        return {
          id: d.id,
          category: data.category ?? "その他",
          rawText: data.rawText ?? "",
          finalStatement: data.finalStatement ?? "",
          likes: typeof data.likes === "number" ? data.likes : 0,
          status: (data.status as Issue["status"]) ?? "未対応",
          hidden: !!data.hidden,
          createdAt,
        }
      })
      setIssues(rows)
    })
    return () => unsub()
  }, [])

  // いいね済みのローカル状態を読み込み
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("likedIssues") || "[]") as string[]
    setLikedIssues(new Set(saved))
  }, [])

  // いいね / 取り消し（アラートは出さない）
  const handleVote = async (issueId: string, like: boolean) => {
    // 楽観更新
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, likes: Math.max(0, i.likes + (like ? 1 : -1)) } : i)),
    )
    const next = new Set(likedIssues)
    like ? next.add(issueId) : next.delete(issueId)
    setLikedIssues(next)
    localStorage.setItem("likedIssues", JSON.stringify([...next]))

    try {
      await updateDoc(doc(db, "issues", issueId), {
        likes: increment(like ? 1 : -1),
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      // 失敗したらロールバック（サイレント）
      console.error("いいね更新失敗:", e)
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, likes: Math.max(0, i.likes + (like ? -1 : 1)) } : i)),
      )
      const rollback = new Set(next)
      like ? rollback.delete(issueId) : rollback.add(issueId)
      setLikedIssues(rollback)
      localStorage.setItem("likedIssues", JSON.stringify([...rollback]))
      // ← alert は出さない
    }
  }

  // 「削除」＝ 非表示（アラートは出さない）
  const handleHide = async (issueId: string) => {
    try {
      await updateDoc(doc(db, "issues", issueId), {
        hidden: true,
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error("非表示更新失敗:", e)
      // ← alert は出さない
    }
  }

  // 絞り込み
  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        if (issue.hidden) return false
        if (
          searchQuery &&
          !`${issue.rawText} ${issue.finalStatement ?? ""}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false
        if (selectedCategory !== "all" && issue.category !== selectedCategory) return false
        if (selectedStatus !== "all" && issue.status !== selectedStatus) return false
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [issues, searchQuery, selectedCategory, selectedStatus])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">課題一覧</h1>
            <p className="text-muted-foreground">みんなの声を見て、共感できる課題に投票しましょう。</p>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onVote={handleVote}
                isLiked={likedIssues.has(issue.id)}
                onHide={handleHide}
              />
            ))}
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">条件に一致する課題が見つかりませんでした。</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
