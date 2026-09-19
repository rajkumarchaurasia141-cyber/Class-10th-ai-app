import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { checkVipExpiryStatus } from '../utils/vipHelper';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isVIP, setIsVIP] = useState(false);
  const [vipDetails, setVipDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const saved = localStorage.getItem('bseb_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to read user from localStorage", e);
    }
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
        // Not a VIP
        setIsVIP(false);
        setVipDetails(null);
      }, (err) => {
        console.warn("VIP listener notice:", err?.message || String(err));
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
      // Save student in Firestore
      await setDoc(doc(db, 'students', cleanEmail), {
        name: cleanName,
        email: cleanEmail,
        lastLogin: new Date().toISOString()
      }, { merge: true });
    } catch (e: any) {
      console.warn("Student record save notice:", e?.message || String(e));
    }

    localStorage.setItem('bseb_user', JSON.stringify(userData));
    setUser(userData);
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
      {loading ? (
        <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-500 font-bold">
          लोड हो रहा है...
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

