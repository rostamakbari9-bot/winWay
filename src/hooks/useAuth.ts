import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeToAuth, getUserProfile, createUserProfile } from '../firebase/authService';
import { isFirebaseConfigured } from '../firebase/config';
import { UserProfile, SubscriptionPlan } from '../types';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let userProfile = await getUserProfile(currentUser.uid);
          if (!userProfile) {
            userProfile = await createUserProfile(
              currentUser,
              currentUser.displayName || undefined,
              'free'
            );
          }
          setProfile(userProfile);
        } catch (err: any) {
          console.error('Error loading user profile:', err);
          setError(err.message || 'Failed to fetch user profile');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const p = await getUserProfile(user.uid);
      if (p) setProfile(p);
    } catch (err) {
      console.error(err);
    }
  };

  const isPremium = profile?.plan === 'premium';

  return {
    user,
    profile,
    loading,
    error,
    isPremium,
    refreshProfile,
    isFirebaseConfigured,
  };
}
