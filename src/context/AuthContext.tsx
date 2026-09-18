import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.email === 'rajkumarchaurasia141@gmail.com';

  useEffect(() => {
    // Check if there was an error from redirect
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect error:", err);
      setError(err.message);
    });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === 'rajkumarchaurasia141@gmail.com') {
          setIsVIP(true);
        } else {
          try {
            const docRef = doc(db, 'vip_users', u.email || '');
            const snap = await getDoc(docRef);
            setIsVIP(snap.exists() && snap.data().isVip === true);
          } catch (e) { console.error(e); }
        }
      } else {
        setIsVIP(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Required for mobile PWAs where popups might be blocked or lost
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      console.error("Popup Error:", e);
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        } catch(redirectErr: any) {
           setError('लॉगिन एरर: ' + redirectErr.message);
        }
      } else {
        setError('लॉगिन में समस्या आई है। कृपया दोबारा प्रयास करें। Error: ' + e.message);
      }
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isVIP, loading, login, logout, error, setError }}>
      {loading ? <div className="min-h-screen flex items-center justify-center text-amber-500 font-bold">Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
