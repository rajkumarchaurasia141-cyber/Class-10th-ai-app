import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { safeSetDoc, isFirestoreQuotaExceeded, setFirestoreQuotaExceeded, isQuotaError, safeGetDoc } from '../utils/firestoreSafe';
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
  const [isVIP, setIsVIP] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [hasCrashCourse, setHasCrashCourse] = useState<boolean>(false);
  const [hasFullCourse, setHasFullCourse] = useState<boolean>(false);
  const [vipDetails, setVipDetails] = useState<any>({
    isVip: false,
    plan: 'free',
    planDurationText: 'मुफ़्त सदस्य',
    isExpired: true,
    daysRemaining: 0,
    formattedExpiry: 'अनलॉक करें'
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
        if (firebaseUser.email && !firebaseUser.isAnonymous && !isFirestoreQuotaExceeded()) {
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
            if (isQuotaError(err)) setFirestoreQuotaExceeded(true);
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
    // Only force VIP if explicitly configured or for admin
    if (isAdmin) {
      setIsVIP(true);
      setVipDetails({
        isVip: true,
        plan: 'admin',
        planDurationText: 'एडमिन एक्सेस',
        isExpired: false,
        daysRemaining: 9999,
        formattedExpiry: 'असीमित'
      });
    } else {
      setIsVIP(isPaid);
      setVipDetails({
        isVip: isPaid,
        plan: isPaid ? 'paid' : 'free',
        planDurationText: isPaid ? 'प्रीमियम मेंबर' : 'मुफ़्त मेंबर',
        isExpired: !isPaid,
        daysRemaining: isPaid ? 365 : 0,
        formattedExpiry: isPaid ? 'सक्रिय' : 'खरीदें'
      });
    }
  }, [user?.email, isPaid, isAdmin]);

  // Real-time observer of current user's entitlement status
  useEffect(() => {
    let unsubUserDoc = () => {};
    let unsubCcDoc = () => {};

    if (isAdmin) {
      setIsPaid(true);
      setHasCrashCourse(true);
      setHasFullCourse(true);
      return;
    }

    const emailForUid = user?.email || fbUser?.email;
    if (emailForUid) {
      const cleanEmail = emailForUid.trim().toLowerCase();
      const uid = fbUser?.uid || `simulated_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const userRef = doc(db, 'users', uid);
      const ccAccessRef = doc(db, 'crash_course_access', cleanEmail);

      // Check local cache for offline/instant status
      const cachedCcUnlocked = localStorage.getItem(`bseb_crash_course_unlocked_${cleanEmail}`) === 'true';
      if (cachedCcUnlocked) {
        setHasCrashCourse(true);
      }

      unsubUserDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const userIsPaid = data?.isPaid === true;
          const userHasCc = data?.hasCrashCourse === true || data?.isCrashCoursePaid === true || cachedCcUnlocked;
          const userHasFull = data?.hasFullCourse === true || userIsPaid;

          setIsPaid(userIsPaid);
          setHasFullCourse(userHasFull);
          if (data?.hasCrashCourse !== undefined || userIsPaid) {
            setHasCrashCourse(data.hasCrashCourse === true || data.isCrashCoursePaid === true || userIsPaid);
          }
        } else {
          setIsPaid(false);
          setHasFullCourse(false);
          if (!cachedCcUnlocked) setHasCrashCourse(false);
        }
      }, (err) => {
        console.warn("User doc listener error:", err);
      });

      // Also listen to crash_course_access collection
      unsubCcDoc = onSnapshot(ccAccessRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const unlocked = data?.unlocked === true || data?.isPaid === true;
          setHasCrashCourse(unlocked);
          try {
            localStorage.setItem(`bseb_crash_course_unlocked_${cleanEmail}`, String(unlocked));
          } catch {}
        }
      }, (err) => {
        console.warn("Crash course access listener error:", err);
      });
    } else {
      setIsPaid(false);
      setHasFullCourse(false);
      setHasCrashCourse(false);
    }

    return () => {
      unsubUserDoc();
      unsubCcDoc();
    };
  }, [user?.email, fbUser?.uid, isAdmin]);

  const unlockUserCrashCourse = (cleanEmail: string) => {
    try {
      localStorage.setItem(`bseb_crash_course_unlocked_${cleanEmail.trim().toLowerCase()}`, 'true');
      if (cleanUserEmail === cleanEmail.trim().toLowerCase()) {
        setHasCrashCourse(true);
      }
    } catch {}
  };

  const lockUserCrashCourse = (cleanEmail: string) => {
    try {
      localStorage.setItem(`bseb_crash_course_unlocked_${cleanEmail.trim().toLowerCase()}`, 'false');
      if (cleanUserEmail === cleanEmail.trim().toLowerCase()) {
        setHasCrashCourse(false);
      }
    } catch {}
  };

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
    if (!isFirestoreQuotaExceeded()) {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await safeGetDoc(userRef);
        if (userSnap && !userSnap.exists()) {
          await setDoc(userRef, {
            uid,
            name: cleanName,
            email: cleanEmail,
            photo: '',
            isPaid: false,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
        } else if (userSnap && userSnap.exists()) {
          // update basic info if already registered, keeping isPaid intact
          await setDoc(userRef, {
            name: cleanName,
            email: cleanEmail,
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } catch (err) {
        console.error("Error auto-saving user to users collection in login:", err);
        if (isQuotaError(err)) setFirestoreQuotaExceeded(true);
      }
    } else {
      console.warn("Firestore quota exceeded, skipping user auto-save.");
    }

    return true;
  };

  const logout = () => {
    localStorage.removeItem('bseb_user');
    setUser(null);
    setIsVIP(false);
    setIsPaid(false);
    setHasCrashCourse(false);
    setHasFullCourse(false);
    setVipDetails({
      isVip: false,
      plan: 'free',
      planDurationText: 'मुफ़्त सदस्य',
      isExpired: true,
      daysRemaining: 0,
      formattedExpiry: 'अनलॉक करें'
    });
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      fbUser, 
      isAdmin, 
      isVIP, 
      isPaid, 
      hasCrashCourse, 
      hasFullCourse, 
      unlockUserCrashCourse, 
      lockUserCrashCourse, 
      vipDetails, 
      loading, 
      login, 
      logout, 
      error, 
      setError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

