export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            プライバシーポリシー
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            利用規約
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            お問い合わせ
          </a>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-4">© 2025 Union Voice. All rights reserved.</div>
      </div>
    </footer>
  )
}
