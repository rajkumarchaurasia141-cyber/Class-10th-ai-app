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
  const [isVIP, setIsVIP] = useState(false);
  const [vipDetails, setVipDetails] = useState<any>(null);
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
  const mainAdminEmail = (import.meta.env.VITE_MAIN_ADMIN_EMAIL || '').trim().toLowerCase() || 'rajkumarchaurasia141@gmail.com';
  const isAdmin = cleanUserEmail === mainAdminEmail || getAdminEmails().includes(cleanUserEmail);

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
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'Unknown',
                email: firebaseUser.email,
                photo: firebaseUser.photoURL || '',
                createdAt: serverTimestamp(),
                isActive: false
              });
            } else {
              // Merge updates without losing active state
              await setDoc(userRef, {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'Unknown',
                email: firebaseUser.email,
                photo: firebaseUser.photoURL || ''
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

  // Real-time VIP listener with automatic expiration check
  useEffect(() => {
    if (!user?.email) {
      setIsVIP(false);
      setVipDetails(null);
      return;
    }

    const cleanEmail = user.email.trim().toLowerCase();
    const envEmail = (import.meta.env.VITE_MAIN_ADMIN_EMAIL || '').trim().toLowerCase() || 'rajkumarchaurasia141@gmail.com';
    if (cleanEmail === envEmail || getAdminEmails().includes(cleanEmail)) {
      setIsVIP(true);
      setVipDetails({
        isVip: true,
        plan: 'admin_lifetime',
        planDurationText: 'लाइफटाइम एडमिन',
        isExpired: false,
        daysRemaining: 9999,
        formattedExpiry: 'असीमित (Admin)'
      });
      return;
    }

    const uid = fbUser?.uid || `simulated_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // STEP 1 & STEP 3: Listen to 'users' collection at user.uid for active state
    const userDocRef = doc(db, 'users', uid);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.isActive === true) {
          setIsVIP(true);
          setVipDetails({
            isVip: true,
            plan: '1year',
            planDurationText: '1 वर्ष प्लान',
            isExpired: false,
            daysRemaining: 365,
            formattedExpiry: 'सक्रिय (Real-time)'
          });
          return;
        }
      }

      // Legacy fallback: also check vip_users
      const legacyDocRef = doc(db, 'vip_users', cleanEmail);
      getDoc(legacyDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.isVip === true) {
            const expiryStatus = checkVipExpiryStatus(data.expiresAt);
            if (!expiryStatus.isExpired) {
              setIsVIP(true);
              setVipDetails({
                ...data,
                isExpired: false,
                daysRemaining: expiryStatus.daysRemaining,
                statusText: expiryStatus.statusText,
                formattedExpiry: expiryStatus.formattedExpiry
              });
              return;
            }
          }
        }
        setIsVIP(false);
        setVipDetails(null);
      }).catch(() => {
        setIsVIP(false);
        setVipDetails(null);
      });
    }, (err) => {
      console.warn("User status listener notice:", err);
    });

    return () => unsubUser();
  }, [user?.email, fbUser?.uid]);

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
          createdAt: serverTimestamp(),
          isActive: false
        });
      } else {
        // update basic info if already registered, keeping isActive intact
        await setDoc(userRef, {
          name: cleanName,
          email: cleanEmail
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
    setIsVIP(false);
    setVipDetails(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, fbUser, isAdmin, isVIP, vipDetails, loading, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

