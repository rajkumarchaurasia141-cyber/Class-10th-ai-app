import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { safeSetDoc, isFirestoreQuotaExceeded } from '../utils/firestoreSafe';
import { checkVipExpiryStatus } from '../utils/vipHelper';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [fbUser, setFbUser] = useState<any>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('bseb_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse cached user:", e);
    }
    return null;
  });
  const [isVIP, setIsVIP] = useState(true);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [vipDetails, setVipDetails] = useState<any>({
    isVip: true,
    plan: 'free_unlocked',
    planDurationText: 'मुफ़्त शिक्षा अभियान (सभी अनलॉक)',
    isExpired: false,
    daysRemaining: 9999,
    formattedExpiry: 'असीमित (मुफ़्त एक्सेस)'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdminEmails = (): string[] => {
    try {
      const stored = localStorage.getItem('bseb_admin_emails');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.map(e => e.trim().toLowerCase());
      }
    } catch (e) {}
    const envEmail = (import.meta.env.VITE_MAIN_ADMIN_EMAIL || '').trim().toLowerCase();
    return envEmail ? [envEmail] : ['rajkumarchaurasia141@gmail.com'];
  };

  const cleanUserEmail = user?.email?.trim().toLowerCase() || '';
  const isAdmin = cleanUserEmail === 'rajkumarchaurasia143@gmail.com' || cleanUserEmail === 'rajkumarchaurasia141@gmail.com';

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFbUser(firebaseUser);
        
        // Auto save Google or authenticated real users to Firestore
        if (firebaseUser.email && !firebaseUser.isAnonymous) {
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);
            const cleanEmail = firebaseUser.email.trim().toLowerCase();
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'Unknown',
                email: cleanEmail,
                photo: firebaseUser.photoURL || '',
                isPaid: false,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
              });
            } else {
              // Merge updates without losing active state
              await setDoc(userRef, {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'Unknown',
                email: cleanEmail,
                photo: firebaseUser.photoURL || '',
                lastLogin: serverTimestamp()
              }, { merge: true });
            }
          } catch (err) {
            console.error("Error auto-saving user on auth state change:", err);
          }
        }
      } else {
        setFbUser(null);
        // Automatically sign in anonymously to satisfy request.auth != null rule for storage
        signInAnonymously(auth).catch((err) => {
          console.warn("Background anonymous sign-in notice:", err);
        });
      }
    });

    // Secondary sync from localStorage if needed
    try {
      const saved = localStorage.getItem('bseb_user');
      if (saved && !user) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {}
    setLoading(false);

    return () => unsubAuth();
  }, []);

  // Real-time VIP listener with automatic expiration check (Forced to true for free access)
  useEffect(() => {
    setIsVIP(true);
    setVipDetails({
      isVip: true,
      plan: 'free_unlocked',
      planDurationText: 'मुफ़्त शिक्षा अभियान (सभी अनलॉक)',
      isExpired: false,
      daysRemaining: 9999,
      formattedExpiry: 'असीमित (मुफ़्त एक्सेस)'
    });
  }, [user?.email]);

  // Real-time observer of current user's isPaid status in users collection
  useEffect(() => {
    let unsubUserDoc = () => {};

    if (isAdmin) {
      setIsPaid(true);
      return;
    }

    const emailForUid = user?.email || fbUser?.email;
    if (emailForUid) {
      const cleanEmail = emailForUid.trim().toLowerCase();
      const uid = fbUser?.uid || `simulated_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const userRef = doc(db, 'users', uid);

      unsubUserDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIsPaid(data?.isPaid === true);
        } else {
          setIsPaid(false);
        }
      }, (err) => {
        console.warn("User doc listener error:", err);
      });
    } else {
      setIsPaid(false);
    }

    return () => unsubUserDoc();
  }, [user?.email, fbUser?.uid, isAdmin]);

  const login = async (name: string, email: string) => {
    setError(null);
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('कृपया अपना नाम दर्ज करें।');
      return false;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('कृपया एक मान्य ईमेल (Gmail) दर्ज करें।');
      return false;
    }

    const userData = { name: cleanName, email: cleanEmail };

    try {
      localStorage.setItem('bseb_user', JSON.stringify(userData));
    } catch (e) {
      console.warn("LocalStorage save notice:", e);
    }

    // Set user synchronously immediately so UI updates instantly
    setUser(userData);

    // Save student profile locally for offline & quota-proof access
    try {
      const storedStudents = JSON.parse(localStorage.getItem('bseb_registered_students') || '{}');
      storedStudents[cleanEmail] = {
        id: cleanEmail,
        name: cleanName,
        email: cleanEmail,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('bseb_registered_students', JSON.stringify(storedStudents));
    } catch {}

    // STEP 1: USER LOGIN PE AUTO SAVE (TURANT ADMIN PANEL ME JAYE)
    const uid = fbUser?.uid || `simulated_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          name: cleanName,
          email: cleanEmail,
          photo: '',
          isPaid: false,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // update basic info if already registered, keeping isPaid intact
        await setDoc(userRef, {
          name: cleanName,
          email: cleanEmail,
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.error("Error auto-saving user to users collection in login:", err);
    }

    return true;
  };

  const logout = () => {
    localStorage.removeItem('bseb_user');
    setUser(null);
    setIsVIP(true);
    setVipDetails({
      isVip: true,
      plan: 'free_unlocked',
      planDurationText: 'मुफ़्त शिक्षा अभियान (सभी अनलॉक)',
      isExpired: false,
      daysRemaining: 9999,
      formattedExpiry: 'असीमित (मुफ़्त एक्सेस)'
    });
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, fbUser, isAdmin, isVIP, isPaid, vipDetails, loading, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

