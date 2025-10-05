// app/chat/page.tsx
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChatPane } from "@/components/chat-pane";

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-4">AIとの対話</h1>
            <p className="text-muted-foreground">
              あなたの想いをより深く整理するために、AIがサポートします。
            </p>
          </div>
          <ChatPane />
        </div>
      </main>
      <Footer />
    </div>
  );
}
