import { useState, useEffect } from 'react';
import { MissedTrade } from '../types';
import { subscribeMissedTrades, saveMissedTrade, deleteMissedTrade } from '../firebase/firestoreService';
import { isFirebaseConfigured } from '../firebase/config';

export function useMissedTrades(userId?: string | null) {
  const [missedTrades, setMissedTrades] = useState<MissedTrade[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !isFirebaseConfigured) {
      setMissedTrades([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMissedTrades(
      userId,
      (fetched) => {
        setMissedTrades(fetched);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addOrUpdateMissedTrade = async (missed: MissedTrade) => {
    if (!userId) return;
    await saveMissedTrade(userId, missed);
  };

  const removeMissedTrade = async (id: string) => {
    if (!userId) return;
    await deleteMissedTrade(userId, id);
  };

  return { missedTrades, loading, error, addOrUpdateMissedTrade, removeMissedTrade, setMissedTrades };
}
