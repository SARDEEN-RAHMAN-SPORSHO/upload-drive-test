import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

let app

try {
  app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  })
} catch (err) {
  console.error("Firebase init failed:", err)
}

export const storage = app ? getStorage(app) : null
