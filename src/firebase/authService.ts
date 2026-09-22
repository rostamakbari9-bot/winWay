import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from './config';
import { UserProfile, SubscriptionPlan } from '../types';

export interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function createUserProfile(
  user: FirebaseUser,
  displayName?: string,
  plan: SubscriptionPlan = 'free'
): Promise<UserProfile> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  const profileData: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: displayName || user.displayName || user.email?.split('@')[0] || 'Trader',
    photoURL: user.photoURL || undefined,
    plan,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, {
    ...profileData,
    serverCreatedAt: serverTimestamp(),
    serverUpdatedAt: serverTimestamp(),
  }, { merge: true });

  return profileData;
}

export async function updateUserProfileData(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await fbUpdateProfile(cred.user, { displayName });
  }
  const profile = await createUserProfile(cred.user, displayName);
  return { user: cred.user, profile };
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  await fbSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
}

// Prepared architecture for Google Sign-in when enabled in Firebase Console
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  // Ensure profile exists
  let profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    await createUserProfile(cred.user, cred.user.displayName || undefined);
  }
  return cred.user;
}

export function subscribeToAuth(
  onStateChange: (user: FirebaseUser | null) => void
): () => void {
  try {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, onStateChange);
  } catch (err) {
    console.warn('Firebase auth listener failed to attach (check configuration):', err);
    onStateChange(null);
    return () => {};
  }
}
