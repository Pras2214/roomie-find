import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// 🔴 REPLACE WITH YOUR FIREBASE CONFIG
// Go to Firebase Console → Project Settings → Your Apps → Web App → Config
const firebaseConfig = {
  apiKey: "AIzaSyDfs65nkXQc9L8kxjVMoRCQlIr2ACO52_8",
  authDomain: "roomie-find-iu.firebaseapp.com",
  projectId: "roomie-find-iu",
  storageBucket: "roomie-find-iu.firebasestorage.app",
  messagingSenderId: "594383752989",
  appId: "1:594383752989:web:dcc408c358ba0ae38b9bf4"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
