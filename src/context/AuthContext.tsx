import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { safeSetDoc, isFirestoreQuotaExceeded } from '../utils/firestoreSafe';
import { checkVipExpiryStatus } from '../utils/vipHelper';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
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
    return ['rajkumarchaurasia141@gmail.com'];
  };

  const cleanUserEmail = user?.email?.trim().toLowerCase() || '';
  const isAdmin = cleanUserEmail === 'rajkumarchaurasia141@gmail.com' || getAdminEmails().includes(cleanUserEmail);

  useEffect(() => {
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
  }, []);

  // Real-time VIP listener with automatic expiration check
  useEffect(() => {
    if (!user?.email) {
      setIsVIP(false);
      setVipDetails(null);
      return;
    }

    const cleanEmail = user.email.trim().toLowerCase();
    if (cleanEmail === 'rajkumarchaurasia141@gmail.com' || getAdminEmails().includes(cleanEmail)) {
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

    // Immediate local VIP cache check for instantaneous activation
    try {
      const localVips = JSON.parse(localStorage.getItem('bseb_vip_users') || '{}');
      if (localVips[cleanEmail]?.isVip) {
        const data = localVips[cleanEmail];
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
        }
      }
    } catch {}

    try {
      const docRef = doc(db, 'vip_users', cleanEmail);
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.isVip === true) {
            const expiryStatus = checkVipExpiryStatus(data.expiresAt);

            if (expiryStatus.isExpired) {
              // Time has passed -> auto de-activate VIP
              setIsVIP(false);
              setVipDetails({
                ...data,
                isExpired: true,
                daysRemaining: 0,
                statusText: expiryStatus.statusText,
                formattedExpiry: expiryStatus.formattedExpiry
              });
            } else {
              // Still valid
              setIsVIP(true);
              setVipDetails({
                ...data,
                isExpired: false,
                daysRemaining: expiryStatus.daysRemaining,
                statusText: expiryStatus.statusText,
                formattedExpiry: expiryStatus.formattedExpiry
              });
            }
            return;
          }
        }
        // If doc doesn't exist in Firestore, double check local VIP before revoking
        try {
          const localVips = JSON.parse(localStorage.getItem('bseb_vip_users') || '{}');
          if (localVips[cleanEmail]?.isVip) {
            const data = localVips[cleanEmail];
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
        } catch {}
        // Not a VIP
        setIsVIP(false);
        setVipDetails(null);
      }, (err) => {
        console.warn("VIP listener notice:", err?.message || String(err));
        try {
          const localVips = JSON.parse(localStorage.getItem('bseb_vip_users') || '{}');
          if (localVips[cleanEmail]?.isVip) {
            const data = localVips[cleanEmail];
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
        } catch {}
        setIsVIP(false);
        setVipDetails(null);
      });
      return () => unsub();
    } catch (e: any) {
      console.warn("VIP snapshot setup notice:", e?.message || String(e));
    }
  }, [user?.email]);

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

    // Only attempt Firestore background sync if quota is NOT exceeded
    if (!isFirestoreQuotaExceeded()) {
      try {
        setTimeout(() => {
          safeSetDoc(doc(db, 'students', cleanEmail), {
            name: cleanName,
            email: cleanEmail,
            lastLogin: new Date().toISOString()
          }, { merge: true }).catch(() => {});
        }, 50);
      } catch {}
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
    <AuthContext.Provider value={{ user, isAdmin, isVIP, vipDetails, loading, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

