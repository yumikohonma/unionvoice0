// /lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * .env.local に必須（NEXT_PUBLIC はブラウザ側から参照されます）
 *
 * NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
 * NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxxxxxxxxxx:web:xxxxxxxxxxxx
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// すでに初期化済みならそれを使う（HotReload対策）
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 認証とDBクライアント
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Google プロバイダ（ヘッダーのログインで使用）
export const googleProvider = new GoogleAuthProvider();

// 必要であればAppもexport
export { app };
