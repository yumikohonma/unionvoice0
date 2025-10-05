// lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// 既存 or 初期化
const _app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const _auth: Auth = getAuth(_app);
const _db: Firestore = getFirestore(_app);

// named exports
export const app = _app;
export const auth = _auth;
export const db = _db;
export const getDb = () => db; // ← これが必要

// default export（保険）
export default { app, auth, db, getDb };
