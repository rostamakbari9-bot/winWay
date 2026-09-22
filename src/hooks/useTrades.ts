import { useState, useEffect } from 'react';
import { Trade } from '../types';
import { subscribeTrades, saveTrade, deleteTrade } from '../firebase/firestoreService';
import { isFirebaseConfigured } from '../firebase/config';

export function useTrades(userId?: string | null) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !isFirebaseConfigured) {
      setTrades([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeTrades(
      userId,
      (fetched) => {
        setTrades(fetched);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addOrUpdateTrade = async (trade: Trade) => {
    if (!userId) return;
    await saveTrade(userId, trade);
  };

  const removeTrade = async (tradeId: string) => {
    if (!userId) return;
    await deleteTrade(userId, tradeId);
  };

  return { trades, loading, error, addOrUpdateTrade, removeTrade, setTrades };
}
