import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDGfupRcSBp-lszXz8onMQEHI3V-rYzT0U",
  authDomain: "fitxtec.firebaseapp.com",
  projectId: "fitxtec",
  storageBucket: "fitxtec.firebasestorage.app",
  messagingSenderId: "152331365997",
  appId: "1:152331365997:web:8693846f3fa36870555964"
};

let app: FirebaseApp;
if (!getApps().length) {
  console.log("[firebase] app ok");
  console.log("[firebase] auth initialized");
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const db = getFirestore(app);
