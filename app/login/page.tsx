// app/login/page.tsx
import EmailAuth from "@/components/email-auth";
// もし共通ヘッダー/フッターがある場合はコメントアウトを外してください
// import { Header } from "@/components/header";
// import { Footer } from "@/components/footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-1 container mx-auto max-w-md px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold">ログイン</h1>
        <p className="text-sm text-muted-foreground">
          メール / パスワードでログイン、または新規登録ができます。
        </p>

        <EmailAuth />

        {/* Google ログインも一緒に出すなら、ヘッダーの Google ボタンをここに出してもOK */}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
