import { useState, useEffect } from 'react';
import { TradingRule } from '../types';
import { subscribeRules, saveRule, deleteRule } from '../firebase/firestoreService';
import { isFirebaseConfigured } from '../firebase/config';

export function useTradingRules(userId?: string | null) {
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !isFirebaseConfigured) {
      setRules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeRules(
      userId,
      (fetched) => {
        setRules(fetched);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addOrUpdateRule = async (rule: TradingRule) => {
    if (!userId) return;
    await saveRule(userId, rule);
  };

  const removeRule = async (ruleId: string) => {
    if (!userId) return;
    await deleteRule(userId, ruleId);
  };

  const toggleRule = async (ruleId: string) => {
    if (!userId) return;
    const current = rules.find(r => r.id === ruleId);
    if (current) {
      await saveRule(userId, { ...current, isActive: !current.isActive });
    }
  };

  return { rules, loading, error, addOrUpdateRule, removeRule, toggleRule, setRules };
}
