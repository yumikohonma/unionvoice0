// post/page.tsx
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import dynamic from "next/dynamic";

const SafePostForm = dynamic(() => import("@/components/post-form").then(m => m.PostForm), {
  ssr: false,
  loading: () => <div className="text-center text-sm text-muted-foreground">投稿フォームを読み込み中…</div>,
});

export default function PostPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">あなたの声を聞かせてください</h1>
            <p className="text-muted-foreground">匿名で安心して、あなたの想いや課題を共有できます。</p>
          </div>
          <SafePostForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
