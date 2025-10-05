"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrganicCluster } from "@/components/organic-cluster"
import { AvatarBubble } from "@/components/avatar-bubble"
import { mockIssues, mockEdges, type Issue } from "@/lib/mock-data"

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues)

  useEffect(() => {
    // Load user issues from localStorage
    const userIssues = JSON.parse(localStorage.getItem("userIssues") || "[]")
    const allIssues = [...mockIssues, ...userIssues].filter((issue) => !issue.hidden)
    setIssues(allIssues)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">課題の関係性マップ</h1>
            <p className="text-muted-foreground">
              課題同士の関係性を可視化し、根本的な原因や関連する問題を発見できます。
            </p>
          </div>

          <div className="flex justify-center">
            <OrganicCluster issues={issues} edges={mockEdges} />
          </div>
        </div>

        
      </main>
      <Footer />
    </div>
  )
}
