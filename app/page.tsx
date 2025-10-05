import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import { OrganicBackground } from "@/components/organic-background"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <OrganicBackground />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
            多様な声は、<span className="text-primary">つながる。</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed">
            労働者の声の可視化プラットフォーム<br/>
            <span className="text-primary">Union Voice</span>
          </p>

          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="text-lg px-12 py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/post">投稿をはじめる</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 w-full">
            <div className="text-center p-6 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🗣️</span>
              </div>
              <h3 className="font-semibold mb-2">匿名で安心</h3>
              <p className="text-sm text-muted-foreground">安全な環境で本音を共有</p>
            </div>

            <div className="text-center p-6 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 bg-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold mb-2">声をつなげる</h3>
              <p className="text-sm text-muted-foreground">多様な意見を可視化</p>
            </div>

            <div className="text-center p-6 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 bg-chart-3/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">データで理解</h3>
              <p className="text-sm text-muted-foreground">AIが課題を分析</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
