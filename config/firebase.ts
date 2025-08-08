import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 프로젝트 설정 (환경변수로 관리하는 것을 권장)
const firebaseConfig = {
  apiKey: "AIzaSyC_nNqG34KslmocDQP49iWBdMtvGuiJRW8",
  authDomain: "mediport-3f8ef.firebaseapp.com",
  projectId: "mediport-3f8ef",
  storageBucket: "mediport-3f8ef.firebasestorage.app",
  messagingSenderId: "366039574427",
  appId: "1:366039574427:web:355ef2293ee0b5dbf7233e",
  measurementId: "G-XM52VBV469"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase Auth 초기화 (React Native에서는 자동으로 AsyncStorage 사용)
export const auth = getAuth(app);

// Firestore 초기화
export const db = getFirestore(app);

export default app;