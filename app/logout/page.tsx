// app/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await signOut(auth);
      } finally {
        router.replace("/"); // サインアウト後にトップへ戻す
      }
    })();
  }, [router]);

  return <p className="p-6 text-center text-sm text-muted-foreground">サインアウト中…</p>;
}
