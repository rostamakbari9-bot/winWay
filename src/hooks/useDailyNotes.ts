import { useState, useEffect } from 'react';
import { DailyNote } from '../types';
import { subscribeDailyNotes, saveDailyNote } from '../firebase/firestoreService';
import { isFirebaseConfigured } from '../firebase/config';

export function useDailyNotes(userId?: string | null) {
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !isFirebaseConfigured) {
      setDailyNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeDailyNotes(
      userId,
      (fetched) => {
        setDailyNotes(fetched);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addOrUpdateDailyNote = async (note: DailyNote) => {
    if (!userId) return;
    await saveDailyNote(userId, note);
  };

  return { dailyNotes, loading, error, addOrUpdateDailyNote, setDailyNotes };
}
