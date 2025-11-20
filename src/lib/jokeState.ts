import { getDb, initFirebase } from './firebase';
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

export type JokeState = {
  active: boolean;
  updatedAt?: unknown;
};

const DOC_PATH = ['state', 'joke'] as const;

export function subscribeJokeState(onChange: (state: JokeState) => void): () => void {
  initFirebase();
  const db = getDb();
  const ref = doc(db, DOC_PATH[0], DOC_PATH[1]);
  return onSnapshot(
    ref,
    (snap) => {
      const data = snap.data() as JokeState | undefined;
      if (data) {
        onChange({ active: !!data.active, updatedAt: data.updatedAt });
      } else {
        onChange({ active: false });
      }
    },
    (err) => {
      console.error('[Firestore] subscribe error', err);
    }
  );
}

export async function setJokeActive(active: boolean): Promise<void> {
  initFirebase();
  const db = getDb();
  const ref = doc(db, DOC_PATH[0], DOC_PATH[1]);
  await setDoc(ref, { active, updatedAt: serverTimestamp() }, { merge: true });
  console.info('[Firestore] set joke state:', active);
}

export async function getJokeState(): Promise<JokeState> {
  initFirebase();
  const db = getDb();
  const ref = doc(db, DOC_PATH[0], DOC_PATH[1]);
  const snap = await getDoc(ref);
  const data = snap.data() as JokeState | undefined;
  return data ?? { active: false };
}


