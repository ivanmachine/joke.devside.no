import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

const firebaseConfig = {
  apiKey: 'AIzaSyAR2DBerIXFqlT-tXfaeUNmTQ8OuV9b1TM',
  authDomain: 'joke-devside-no.firebaseapp.com',
  projectId: 'joke-devside-no',
  storageBucket: 'joke-devside-no.firebasestorage.app',
  messagingSenderId: '884157295428',
  appId: '1:884157295428:web:f7d42cfdd7e8ca3519c511'
};

export function initFirebase(): { app: FirebaseApp; db: Firestore } {
  if (!app) {
    app = initializeApp(firebaseConfig);
    console.info('[Firebase] initialized');
  }
  if (!db) {
    db = getFirestore(app);
  }
  return { app, db };
}

export function getDb(): Firestore {
  if (!db) {
    return initFirebase().db;
  }
  return db;
}


