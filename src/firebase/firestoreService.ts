import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { getFirebaseDb } from './config';
import { Trade, MissedTrade, DailyNote, TradingRule } from '../types';

// ==========================================
// TRADES
// ==========================================

export function subscribeTrades(
  userId: string,
  onUpdate: (trades: Trade[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getFirebaseDb();
  const tradesCol = collection(db, 'users', userId, 'trades');
  const q = query(tradesCol, orderBy('entryDate', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Trade[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as Trade), id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Error listening to trades:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveTrade(userId: string, trade: Trade): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', userId, 'trades', trade.id);
  await setDoc(
    docRef,
    {
      ...trade,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteTrade(userId: string, tradeId: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', userId, 'trades', tradeId);
  await deleteDoc(docRef);
}

// ==========================================
// MISSED TRADES
// ==========================================

export function subscribeMissedTrades(
  userId: string,
  onUpdate: (missed: MissedTrade[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getFirebaseDb();
  const colRef = collection(db, 'users', userId, 'missedTrades');
  const q = query(colRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MissedTrade[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as MissedTrade), id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Error listening to missed trades:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveMissedTrade(userId: string, missedTrade: MissedTrade): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', userId, 'missedTrades', missedTrade.id);
  await setDoc(
    docRef,
    {
      ...missedTrade,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteMissedTrade(userId: string, id: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', userId, 'missedTrades', id);
  await deleteDoc(docRef);
}

// ==========================================
// DAILY NOTES
// ==========================================

export function subscribeDailyNotes(
  userId: string,
  onUpdate: (notes: DailyNote[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getFirebaseDb();
  const colRef = collection(db, 'users', userId, 'dailyNotes');
  const q = query(colRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: DailyNote[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as DailyNote), id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Error listening to daily notes:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveDailyNote(userId: string, note: DailyNote): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', userId, 'dailyNotes', note.id || note.date);
  await setDoc(
    docRef,
    {
      ...note,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ==========================================
// PLAYBOOK RULES
// ==========================================

export function subscribeRules(
  userId: string,
  onUpdate: (rules: TradingRule[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getFirebaseDb();
  const colRef = collection(db, 'users', userId, 'playbook');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: TradingRule[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as TradingRule), id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Error listening to rules:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveRule(userId: string, rule: TradingRule): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', userId, 'playbook', rule.id);
  await setDoc(
    docRef,
    {
      ...rule,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteRule(userId: string, ruleId: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', userId, 'playbook', ruleId);
  await deleteDoc(docRef);
}

// ==========================================
// MIGRATION HELPER (localStorage -> Firestore)
// ==========================================

export async function checkHasCloudData(userId: string): Promise<boolean> {
  const db = getFirebaseDb();
  const tradesCol = collection(db, 'users', userId, 'trades');
  const snap = await getDocs(query(tradesCol));
  return !snap.empty;
}

export async function migrateLocalDataToFirestore(
  userId: string,
  trades: Trade[],
  missedTrades: MissedTrade[],
  dailyNotes: DailyNote[],
  rules: TradingRule[]
): Promise<{ tradesCount: number; missedCount: number; notesCount: number; rulesCount: number }> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  let tradesCount = 0;
  for (const t of trades) {
    const docRef = doc(db, 'users', userId, 'trades', t.id);
    batch.set(docRef, { ...t, migratedAt: serverTimestamp() }, { merge: true });
    tradesCount++;
  }

  let missedCount = 0;
  for (const m of missedTrades) {
    const docRef = doc(db, 'users', userId, 'missedTrades', m.id);
    batch.set(docRef, { ...m, migratedAt: serverTimestamp() }, { merge: true });
    missedCount++;
  }

  let notesCount = 0;
  for (const n of dailyNotes) {
    const docRef = doc(db, 'users', userId, 'dailyNotes', n.id || n.date);
    batch.set(docRef, { ...n, migratedAt: serverTimestamp() }, { merge: true });
    notesCount++;
  }

  let rulesCount = 0;
  for (const r of rules) {
    const docRef = doc(db, 'users', userId, 'playbook', r.id);
    batch.set(docRef, { ...r, migratedAt: serverTimestamp() }, { merge: true });
    rulesCount++;
  }

  await batch.commit();

  return { tradesCount, missedCount, notesCount, rulesCount };
}
